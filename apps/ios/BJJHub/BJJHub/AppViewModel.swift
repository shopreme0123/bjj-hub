import Foundation
import Combine

@MainActor
final class AppViewModel: ObservableObject {
    @Published var profile: Profile?
    @Published var techniques: [Technique] = []
    @Published var flows: [Flow] = []
    @Published var trainingLogs: [TrainingLog] = []
    @Published var groups: [Group] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var showErrorPopup = false
    @Published var authErrorMessage: String?
    @Published var authDebugMessage: String?
    @Published var isAuthenticating = false
    @Published var session: AuthSession?
    @Published var isPremium = false
    @Published var showPremiumSheet = false
    @Published var customCategories: [TechniqueCategory] = []
    @Published var enableTabAnimations = true

    let notificationsManager = NotificationsManager()
    let premiumManager = PremiumManager()

    private let service: SupabaseService
    private let authService: SupabaseAuthService
    private let localStorage = SimpleLocalStorage.shared
    private var hasLoaded = false
    private var cancellables: Set<AnyCancellable> = []
    private var recentTechniqueIds: [String] = []
    private let recentTechniquesKey = "bjjhub.recentTechniques"
    private let localUserIdKey = "bjjhub.localUserId"
    private let customCategoriesKey = "bjjhub.customCategories"
    private let enableTabAnimationsKey = "bjjhub.enableTabAnimations"

    // Local user ID for offline usage
    private var localUserId: String {
        if let stored = UserDefaults.standard.string(forKey: localUserIdKey) {
            return stored
        }
        let newId = "local_\(UUID().uuidString)"
        UserDefaults.standard.set(newId, forKey: localUserIdKey)
        return newId
    }

    init() {
        self.service = SupabaseService()
        self.authService = SupabaseAuthService()
        self.session = SessionStore.load()
        self.isPremium = premiumManager.isPremium
        self.enableTabAnimations = UserDefaults.standard.object(forKey: enableTabAnimationsKey) as? Bool ?? true
        loadRecentTechniqueIds()
        loadCustomCategories()
        premiumManager.$isPremium
            .receive(on: RunLoop.main)
            .sink { [weak self] storePremium in
                self?.updatePremiumStatus(storePremium: storePremium)
            }
            .store(in: &cancellables)
        premiumManager.start()
    }

    init(service: SupabaseService) {
        self.service = service
        self.authService = SupabaseAuthService()
        premiumManager.$isPremium
            .receive(on: RunLoop.main)
            .sink { [weak self] storePremium in
                self?.updatePremiumStatus(storePremium: storePremium)
            }
            .store(in: &cancellables)
        premiumManager.start()
    }

    var beltColor: BeltColor {
        profile?.beltColor ?? .white
    }

    var beltStripes: Int {
        profile?.beltStripes ?? 0
    }

    var profileName: String {
        if let name = profile?.displayName?.trimmingCharacters(in: .whitespacesAndNewlines), !name.isEmpty {
            return name
        }
        if let email = session?.email.trimmingCharacters(in: .whitespacesAndNewlines), !email.isEmpty {
            return email
        }
        return "ゲスト"
    }

    var isAuthenticated: Bool {
        session != nil
    }

    var userId: String? {
        session?.userId ?? localUserId
    }

    var techniqueCount: Int { techniques.count }
    var flowCount: Int { flows.count }
    var trainingDayCount: Int { trainingLogs.count }

    var weeklyPractice: [Bool] {
        var calendar = Calendar.current
        calendar.locale = Locale(identifier: "ja_JP")
        calendar.firstWeekday = 2 // Monday
        let today = Date()
        guard let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else {
            return Array(repeating: false, count: 7)
        }

        return (0..<7).map { offset in
            guard let date = calendar.date(byAdding: .day, value: offset, to: startOfWeek) else {
                return false
            }
            let dateString = Self.dateFormatter.string(from: date)
            return trainingLogs.contains { $0.trainingDate == dateString }
        }
    }

    var recentLogs: [TrainingLog] {
        Array(sortedTrainingLogs.prefix(3))
    }

    var recentTechniques: [Technique] {
        let lookup = Dictionary(uniqueKeysWithValues: techniques.map { ($0.id, $0) })
        let ordered = recentTechniqueIds.compactMap { lookup[$0] }
        var result = Array(ordered.prefix(6))
        if result.count < 6 {
            let remaining = techniques.filter { tech in
                !result.contains(where: { $0.id == tech.id })
            }
            result.append(contentsOf: remaining.prefix(6 - result.count))
        }
        return result
    }

    func recordTechniqueView(_ id: String) {
        recentTechniqueIds.removeAll { $0 == id }
        recentTechniqueIds.insert(id, at: 0)
        if recentTechniqueIds.count > 20 {
            recentTechniqueIds = Array(recentTechniqueIds.prefix(20))
        }
        saveRecentTechniqueIds()
    }

    private func loadRecentTechniqueIds() {
        if let ids = UserDefaults.standard.stringArray(forKey: recentTechniquesKey) {
            recentTechniqueIds = ids
        }
    }

    private func saveRecentTechniqueIds() {
        UserDefaults.standard.set(recentTechniqueIds, forKey: recentTechniquesKey)
    }

    private func loadCustomCategories() {
        if let data = UserDefaults.standard.data(forKey: customCategoriesKey),
           let decoded = try? JSONDecoder().decode([TechniqueCategory].self, from: data) {
            customCategories = decoded
            print("📚 [DEBUG] Loaded \(decoded.count) custom categories from UserDefaults")
        } else {
            print("📚 [DEBUG] No custom categories found in UserDefaults")
        }
    }

    private func saveCustomCategories() {
        if let encoded = try? JSONEncoder().encode(customCategories) {
            UserDefaults.standard.set(encoded, forKey: customCategoriesKey)
            print("💾 [DEBUG] Saved \(customCategories.count) custom categories to UserDefaults")
        } else {
            print("❌ [DEBUG] Failed to encode custom categories")
        }
    }

    func addCustomCategory(_ category: TechniqueCategory) {
        // Check if category name already exists
        let existingNames = Set(customCategories.map { $0.name })
        guard !existingNames.contains(category.name) else {
            print("⚠️ [DEBUG] Category '\(category.name)' already exists, skipping")
            return
        }

        customCategories.append(category)
        saveCustomCategories()
        print("✅ [DEBUG] Added custom category: \(category.name)")
    }

    func loadIfNeeded() async {
        guard !hasLoaded else { return }
        await load()
        hasLoaded = true
    }

    func load() async {
        isLoading = true
        errorMessage = nil

        // Always load from local storage first
        print("📱 [DEBUG] Loading data from local storage...")
        do {
            techniques = try await localStorage.fetchTechniques(userId: userId)
            flows = try await localStorage.fetchFlows(userId: userId)
            trainingLogs = try await localStorage.fetchTrainingLogs(userId: userId)

            if let userId = userId {
                profile = try await localStorage.fetchProfile(userId: userId)
                if profile != nil {
                    updatePremiumStatus(storePremium: premiumManager.isPremium)
                }

                // If no profile exists, create a default one
                if profile == nil {
                    print("⚠️ [DEBUG] No profile found for user \(userId), creating default profile...")
                    let now = ISO8601DateFormatter().string(from: Date())
                    let defaultProfile = Profile(
                        id: userId,
                        displayName: nil,
                        avatarUrl: nil,
                        beltColor: .white,
                        beltStripes: 0,
                        bjjStartDate: nil,
                        bio: nil,
                        isPremium: false,
                        premiumUntil: nil,
                        createdAt: now,
                        updatedAt: now
                    )
                    try await localStorage.saveProfile(defaultProfile)
                    profile = defaultProfile
                    updatePremiumStatus(storePremium: premiumManager.isPremium)
                    print("✅ [DEBUG] Default profile created and saved")
                }
            }

            print("✅ [DEBUG] Local data loaded - Techniques: \(techniques.count), Flows: \(flows.count), Logs: \(trainingLogs.count)")
        } catch {
            print("❌ [DEBUG] Error loading local data: \(error)")
        }

        // If user is authenticated and Supabase is configured, also fetch from cloud
        if SupabaseConfig.isConfigured, let userId = userId {
            print("☁️ [DEBUG] User authenticated, loading from cloud...")

            // Check if token is expired and refresh if needed
            if let expiresAt = session?.expiresAt, Date() >= expiresAt {
                print("⚠️ [DEBUG] Token expired, attempting to refresh...")
                await refreshSessionIfNeeded()
            }

            do {
                // Fetch profile from cloud
                async let cloudProfile = service.fetchProfile(userId: userId, accessToken: session?.accessToken)
                async let groups = service.fetchGroups(userId: userId, accessToken: session?.accessToken)

                // Update profile from cloud if it exists
                if let fetchedProfile = try await cloudProfile {
                    self.profile = fetchedProfile
                    updatePremiumStatus(storePremium: premiumManager.isPremium)
                    // Save to local storage
                    try? await localStorage.saveProfile(fetchedProfile)
                    print("✅ [DEBUG] Cloud profile loaded and saved locally")
                }

                self.groups = try await groups
                print("✅ [DEBUG] Cloud groups loaded: \(self.groups.count)")
            } catch {
                print("❌ [DEBUG] Error loading cloud data: \(error)")
                showError("グループの取得に失敗しました (\(errorDetails(error)))")

                // If we get a 401 error, try refreshing the token and retry
                if let supabaseError = error as? SupabaseError, supabaseError.statusCode == 401 {
                    print("⚠️ [DEBUG] Got 401 error, attempting token refresh...")
                    await refreshSessionIfNeeded()
                    do {
                        async let retryProfile = service.fetchProfile(userId: userId, accessToken: session?.accessToken)
                        async let retryGroups = service.fetchGroups(userId: userId, accessToken: session?.accessToken)

                        if let fetchedProfile = try await retryProfile {
                            self.profile = fetchedProfile
                            updatePremiumStatus(storePremium: premiumManager.isPremium)
                            try? await localStorage.saveProfile(fetchedProfile)
                        }
                        self.groups = try await retryGroups
                        print("✅ [DEBUG] Cloud data loaded after refresh: groups \(self.groups.count)")
                    } catch {
                        print("❌ [DEBUG] Retry after refresh failed: \(error)")
                        showError("グループの取得に失敗しました (\(errorDetails(error)))")
                    }
                }
            }
        }

        isLoading = false
    }

    func refreshGroups() async {
        guard SupabaseConfig.isConfigured, let userId = userId else { return }
        do {
            let fetched = try await service.fetchGroups(userId: userId, accessToken: session?.accessToken)
            groups = fetched
        } catch {
            if let supabaseError = error as? SupabaseError, supabaseError.statusCode == 401 {
                await refreshSessionIfNeeded()
                do {
                    let fetched = try await service.fetchGroups(userId: userId, accessToken: session?.accessToken)
                    groups = fetched
                } catch {
                    showError("グループの取得に失敗しました (\(errorDetails(error)))")
                }
            } else {
                showError("グループの取得に失敗しました (\(errorDetails(error)))")
            }
        }
    }

    private func refreshSessionIfNeeded() async {
        guard let currentSession = session else {
            print("⚠️ [DEBUG] No session to refresh")
            return
        }

        do {
            print("🔄 [DEBUG] Refreshing token...")
            let newSession = try await authService.refreshSession(refreshToken: currentSession.refreshToken)
            session = newSession
            SessionStore.save(newSession)
            print("✅ [DEBUG] Token refreshed successfully")
        } catch {
            print("❌ [DEBUG] Failed to refresh token: \(error)")
            // If refresh fails, sign out the user
            signOut()
        }
    }

    func signIn(email: String, password: String) async {
        guard SupabaseConfig.isConfigured else {
            authErrorMessage = "Supabase設定を確認してください"
            authDebugMessage = nil
            return
        }

        let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let trimmedPassword = password.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedEmail.isEmpty, !trimmedPassword.isEmpty else {
            authErrorMessage = "メールアドレスとパスワードを入力してください"
            authDebugMessage = nil
            return
        }

        isAuthenticating = true
        authErrorMessage = nil
        authDebugMessage = nil

        do {
            // Store local data before sign in
            let localTechniques = techniques
            let localFlows = flows
            let localLogs = trainingLogs

            let newSession = try await authService.signIn(email: trimmedEmail, password: trimmedPassword)
            session = newSession
            SessionStore.save(newSession)
            hasLoaded = false

            // Migrate local data to authenticated user
            print("🔄 [DEBUG] Migrating local data to authenticated user...")
            for technique in localTechniques {
                let migratedTechnique = Technique(
                    id: UUID().uuidString,
                    userId: newSession.userId,
                    name: technique.name,
                    nameEn: technique.nameEn,
                    categoryId: technique.categoryId,
                    category: technique.category,
                    techniqueType: technique.techniqueType,
                    description: technique.description,
                    videoUrl: technique.videoUrl,
                    videoType: technique.videoType,
                    tags: technique.tags,
                    difficulty: technique.difficulty,
                    masteryLevel: technique.masteryLevel,
                    createdAt: technique.createdAt,
                    updatedAt: ISO8601DateFormatter().string(from: Date())
                )
                try? await localStorage.saveTechnique(migratedTechnique)
            }

            for flow in localFlows {
                let migratedFlow = Flow(
                    id: UUID().uuidString,
                    userId: newSession.userId,
                    name: flow.name,
                    description: flow.description,
                    tags: flow.tags,
                    flowData: flow.flowData,
                    isFavorite: flow.isFavorite,
                    createdAt: flow.createdAt,
                    updatedAt: ISO8601DateFormatter().string(from: Date())
                )
                try? await localStorage.saveFlow(migratedFlow)
            }

            for log in localLogs {
                let migratedLog = TrainingLog(
                    id: UUID().uuidString,
                    userId: newSession.userId,
                    trainingDate: log.trainingDate,
                    startTime: log.startTime,
                    endTime: log.endTime,
                    durationMinutes: log.durationMinutes,
                    notes: log.notes,
                    content: log.content,
                    condition: log.condition,
                    sparringRounds: log.sparringRounds,
                    createdAt: log.createdAt,
                    updatedAt: ISO8601DateFormatter().string(from: Date()),
                    techniques: log.techniques,
                    flows: log.flows,
                    videoUrls: log.videoUrls
                )
                try? await localStorage.saveTrainingLog(migratedLog)
            }

            print("✅ [DEBUG] Local data migration completed")
            await load()
        } catch {
            if let authError = error as? AuthError {
                authErrorMessage = authError.message
                if let statusCode = authError.statusCode {
                    let body = authError.responseBody ?? ""
                    authDebugMessage = "status=\(statusCode) body=\(body)"
                }
            } else {
                authErrorMessage = "ログインに失敗しました: \(error.localizedDescription)"
            }
        }

        isAuthenticating = false
    }

    func signOut() {
        if let session {
            UserDefaults.standard.set(session.userId, forKey: localUserIdKey)
        }

        // Don't clear local data, just switch back to local user
        session = nil
        groups = []
        SessionStore.clear()
        hasLoaded = false

        // Reload with local user ID
        Task {
            await load()
        }
    }

    func updateBeltColor(_ beltColor: BeltColor) async {
        guard let userId, let profile else {
            print("❌ [DEBUG] Cannot update belt color - userId: \(String(describing: userId)), profile: \(String(describing: profile))")
            return
        }

        print("🔄 [DEBUG] Updating belt color to \(beltColor.rawValue) for user \(userId)")

        // Update profile locally
        let updatedProfile = Profile(
            id: profile.id,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            beltColor: beltColor,
            beltStripes: profile.beltStripes,
            bjjStartDate: profile.bjjStartDate,
            bio: profile.bio,
            isPremium: profile.isPremium,
            premiumUntil: profile.premiumUntil,
            createdAt: profile.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            // Save to local storage
            try await localStorage.saveProfile(updatedProfile)
            self.profile = updatedProfile
            updatePremiumStatus(storePremium: premiumManager.isPremium)

            // Explicitly trigger objectWillChange to ensure UI updates
            objectWillChange.send()

            print("✅ [DEBUG] Belt color updated locally - new color: \(updatedProfile.beltColor?.rawValue ?? "nil")")
            print("✅ [DEBUG] Profile object updated in memory: \(self.profile?.beltColor?.rawValue ?? "nil")")
            print("ℹ️ [DEBUG] Auto-sync disabled - belt color will be synced on manual backup")
        } catch {
            showError("帯色の更新に失敗しました")
        }
    }

    func updateBeltStripes(_ stripes: Int) async {
        guard let userId, let profile else {
            print("❌ [DEBUG] Cannot update belt stripes - userId: \(String(describing: userId)), profile: \(String(describing: profile))")
            return
        }

        print("🔄 [DEBUG] Updating belt stripes to \(stripes) for user \(userId)")

        // Update profile locally
        let updatedProfile = Profile(
            id: profile.id,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            beltColor: profile.beltColor,
            beltStripes: stripes,
            bjjStartDate: profile.bjjStartDate,
            bio: profile.bio,
            isPremium: profile.isPremium,
            premiumUntil: profile.premiumUntil,
            createdAt: profile.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            // Save to local storage
            try await localStorage.saveProfile(updatedProfile)
            self.profile = updatedProfile
            updatePremiumStatus(storePremium: premiumManager.isPremium)

            // Explicitly trigger objectWillChange to ensure UI updates
            objectWillChange.send()

            print("✅ [DEBUG] Belt stripes updated locally - new stripes: \(updatedProfile.beltStripes ?? 0)")
            print("✅ [DEBUG] Profile object updated in memory: \(self.profile?.beltStripes ?? 0)")
            print("ℹ️ [DEBUG] Auto-sync disabled - belt stripes will be synced on manual backup")
        } catch {
            showError("ストライプの更新に失敗しました")
        }
    }

    func updateProfile(displayName: String, bio: String, avatarUrl: String?) async {
        guard let profile else { return }

        // Update profile locally
        let finalDisplayName = displayName.isEmpty ? nil : displayName
        let finalBio = bio.isEmpty ? nil : bio

        let updatedProfile = Profile(
            id: profile.id,
            displayName: finalDisplayName,
            avatarUrl: avatarUrl ?? profile.avatarUrl,
            beltColor: profile.beltColor,
            beltStripes: profile.beltStripes,
            bjjStartDate: profile.bjjStartDate,
            bio: finalBio,
            isPremium: profile.isPremium,
            premiumUntil: profile.premiumUntil,
            createdAt: profile.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            // Save to local storage
            try await localStorage.saveProfile(updatedProfile)
            self.profile = updatedProfile
            updatePremiumStatus(storePremium: premiumManager.isPremium)

            // Explicitly trigger objectWillChange to ensure UI updates
            objectWillChange.send()

            print("✅ [DEBUG] Profile updated locally")
            print("ℹ️ [DEBUG] Auto-sync disabled - profile will be synced on manual backup")
        } catch {
            showError("プロフィールの更新に失敗しました")
        }
    }

    func createFlow(name: String) async -> Flow? {
        let flowId = UUID().uuidString
        let now = ISO8601DateFormatter().string(from: Date())

        let flow = Flow(
            id: flowId,
            userId: userId!,
            name: name,
            description: nil,
            tags: nil,
            flowData: nil,
            isFavorite: false,
            createdAt: now,
            updatedAt: now
        )

        do {
            // Save to local storage
            try await localStorage.saveFlow(flow)
            flows.insert(flow, at: 0)
            print("✅ [DEBUG] Flow saved locally: \(flowId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - flow will be synced on manual backup")

            return flow
        } catch {
            showError("フローの作成に失敗しました")
            return nil
        }
    }

    func updateFlowData(flowId: String, flowData: FlowData, name: String? = nil) async {
        guard let existingFlow = flows.first(where: { $0.id == flowId }) else {
            showError("フローが見つかりません")
            return
        }

        let trimmedName = name?.trimmingCharacters(in: .whitespacesAndNewlines)
        let finalName = (trimmedName?.isEmpty == false) ? trimmedName! : existingFlow.name

        let updatedFlow = Flow(
            id: existingFlow.id,
            userId: existingFlow.userId,
            name: finalName,
            description: existingFlow.description,
            tags: existingFlow.tags,
            flowData: flowData,
            isFavorite: existingFlow.isFavorite,
            createdAt: existingFlow.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            // Update local storage
            try await localStorage.saveFlow(updatedFlow)

            // Update the flows array - force a new array to trigger @Published
            if let index = flows.firstIndex(where: { $0.id == flowId }) {
                // Create a new array to ensure @Published triggers
                var newFlows = flows
                newFlows[index] = updatedFlow
                flows = newFlows

                // Explicitly trigger objectWillChange
                objectWillChange.send()
            }
            print("✅ [DEBUG] Flow updated locally: \(flowId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - flow will be synced on manual backup")
        } catch {
            showError("フローの保存に失敗しました")
        }
    }

    func fetchSharedFlows(groupId: String) async -> [SharedFlow] {
        guard let session else {
            showError("共有フローの閲覧にはログインが必要です")
            return []
        }
        let nowIso = ISO8601DateFormatter().string(from: Date())
        do {
            return try await service.fetchSharedFlows(
                groupId: groupId,
                accessToken: session.accessToken,
                nowIso: nowIso
            )
        } catch {
            showError("共有フローの取得に失敗しました")
            return []
        }
    }

    func fetchSharedTechniques(groupId: String) async -> [SharedTechniqueEntry] {
        guard let session else {
            showError("共有技の閲覧にはログインが必要です")
            return []
        }
        let nowIso = ISO8601DateFormatter().string(from: Date())
        do {
            return try await service.fetchSharedTechniques(
                groupId: groupId,
                accessToken: session.accessToken,
                nowIso: nowIso
            )
        } catch {
            showError("共有技の取得に失敗しました")
            return []
        }
    }

    func shareFlowToGroup(flow: Flow, groupId: String, expiresInDays: Int) async -> SharedFlow? {
        guard let session else {
            showError("フロー共有にはログインが必要です")
            return nil
        }
        let data = flow.flowData ?? FlowData(nodes: [], edges: [])
        let expiry = Calendar.current.date(byAdding: .day, value: expiresInDays, to: Date())
        let expiresAt = expiry.map { ISO8601DateFormatter().string(from: $0) }

        do {
            let sharedTechniqueIds = try await ensureSharedTechniques(
                groupId: groupId,
                flowData: data,
                expiresAt: expiresAt,
                session: session
            )
            let shared = try await service.createSharedFlow(
                groupId: groupId,
                userId: session.userId,
                accessToken: session.accessToken,
                name: flow.name,
                flowData: data,
                techniqueIds: sharedTechniqueIds,
                expiresAt: expiresAt
            )
            return shared
        } catch {
            showError("フローの共有に失敗しました")
            return nil
        }
    }

    func shareTechniqueToGroup(technique: Technique, groupId: String, expiresInDays: Int) async -> SharedTechniqueEntry? {
        guard let session else {
            showError("技共有にはログインが必要です")
            return nil
        }
        let expiresAt: String? = nil
        let sharedTechnique = SharedTechnique(
            id: technique.id,
            name: technique.name,
            nameEn: technique.nameEn,
            category: technique.category,
            techniqueType: technique.techniqueType,
            description: technique.description,
            videoUrl: technique.videoUrl,
            videoType: technique.videoType,
            tags: technique.tags,
            difficulty: technique.difficulty,
            masteryLevel: technique.masteryLevel
        )

        do {
            let existingShared = try await service.fetchSharedTechniques(
                groupId: groupId,
                accessToken: session.accessToken,
                nowIso: ISO8601DateFormatter().string(from: Date())
            )
            if let existing = existingShared.first(where: { $0.sourceTechniqueId == technique.id }) {
                return try await service.updateSharedTechnique(
                    id: existing.id,
                    accessToken: session.accessToken,
                    technique: sharedTechnique,
                    expiresAt: expiresAt
                )
            }

            return try await service.createSharedTechnique(
                groupId: groupId,
                userId: session.userId,
                accessToken: session.accessToken,
                technique: sharedTechnique,
                sourceTechniqueId: technique.id,
                expiresAt: expiresAt
            )
        } catch {
            showError("技の共有に失敗しました")
            return nil
        }
    }

    func importSharedFlow(_ sharedFlow: SharedFlow) async -> Flow? {
        guard session != nil else {
            showError("取り込みにはログインが必要です")
            return nil
        }

        var techniqueIdMap: [String: String] = [:]
        let sharedTechniques = await fetchSharedTechniques(groupId: sharedFlow.groupId)
        let sharedLookup = Dictionary(uniqueKeysWithValues: sharedTechniques.map { ($0.id, $0) })

        for sharedId in sharedFlow.techniqueIds {
            guard let sharedEntry = sharedLookup[sharedId] else { continue }
            let sharedTechnique = sharedEntry.technique
            let form = TechniqueForm(
                name: sharedTechnique.name,
                nameEn: sharedTechnique.nameEn,
                category: sharedTechnique.category,
                techniqueType: sharedTechnique.techniqueType ?? "other",
                description: sharedTechnique.description,
                videoUrl: sharedTechnique.videoUrl,
                tags: sharedTechnique.tags,
                masteryLevel: sharedTechnique.masteryLevel
            )
            if let created = await createTechnique(form: form) {
                if let sourceId = sharedEntry.sourceTechniqueId {
                    techniqueIdMap[sourceId] = created.id
                }
            }
        }

        let remappedNodes = sharedFlow.flowData.nodes.map { node -> FlowNodeData in
            if let techniqueId = node.techniqueId, let newId = techniqueIdMap[techniqueId] {
                return FlowNodeData(
                    id: node.id,
                    type: node.type,
                    label: node.label,
                    techniqueId: newId,
                    positionX: node.positionX,
                    positionY: node.positionY
                )
            }
            return node
        }
        let remappedData = FlowData(nodes: remappedNodes, edges: sharedFlow.flowData.edges)

        if let flow = await createFlow(name: sharedFlow.name) {
            await updateFlowData(flowId: flow.id, flowData: remappedData)
            return flow
        }

        showError("共有フローの取り込みに失敗しました")
        return nil
    }

    func importSharedTechnique(_ shared: SharedTechniqueEntry) async -> Technique? {
        guard session != nil else {
            showError("取り込みにはログインが必要です")
            return nil
        }

        let form = TechniqueForm(
            name: shared.technique.name,
            nameEn: shared.technique.nameEn,
            category: shared.technique.category,
            techniqueType: shared.technique.techniqueType ?? "other",
            description: shared.technique.description,
            videoUrl: shared.technique.videoUrl,
            tags: shared.technique.tags,
            masteryLevel: shared.technique.masteryLevel
        )

        if let technique = await createTechnique(form: form) {
            return technique
        }

        showError("共有技の取り込みに失敗しました")
        return nil
    }

    private func sharedTechniques(for flowData: FlowData) -> [SharedTechnique] {
        let techniqueIds = Set(flowData.nodes.compactMap { $0.techniqueId })
        let techniques = self.techniques.filter { techniqueIds.contains($0.id) }
        return techniques.map { technique in
            SharedTechnique(
                id: technique.id,
                name: technique.name,
                nameEn: technique.nameEn,
                category: technique.category,
                techniqueType: technique.techniqueType,
                description: technique.description,
                videoUrl: technique.videoUrl,
                videoType: technique.videoType,
                tags: technique.tags,
                difficulty: technique.difficulty,
                masteryLevel: technique.masteryLevel
            )
        }
    }

    private func ensureSharedTechniques(
        groupId: String,
        flowData: FlowData,
        expiresAt: String?,
        session: AuthSession
    ) async throws -> [String] {
        let techniqueIds = Set(flowData.nodes.compactMap { $0.techniqueId })
        guard !techniqueIds.isEmpty else { return [] }

        let existingShared = try await service.fetchSharedTechniques(
            groupId: groupId,
            accessToken: session.accessToken,
            nowIso: ISO8601DateFormatter().string(from: Date())
        )
        var sharedBySource: [String: SharedTechniqueEntry] = [:]
        for entry in existingShared {
            if let sourceId = entry.sourceTechniqueId {
                sharedBySource[sourceId] = entry
            }
        }

        var sharedIds: [String] = []
        for technique in techniques.filter({ techniqueIds.contains($0.id) }) {
            if let existing = sharedBySource[technique.id] {
                let updated = try await service.updateSharedTechnique(
                    id: existing.id,
                    accessToken: session.accessToken,
                    technique: SharedTechnique(
                        id: technique.id,
                        name: technique.name,
                        nameEn: technique.nameEn,
                        category: technique.category,
                        techniqueType: technique.techniqueType,
                        description: technique.description,
                        videoUrl: technique.videoUrl,
                        videoType: technique.videoType,
                        tags: technique.tags,
                        difficulty: technique.difficulty,
                        masteryLevel: technique.masteryLevel
                    ),
                    expiresAt: expiresAt
                )
                sharedIds.append(updated.id)
                continue
            }

            let sharedTechnique = SharedTechnique(
                id: technique.id,
                name: technique.name,
                nameEn: technique.nameEn,
                category: technique.category,
                techniqueType: technique.techniqueType,
                description: technique.description,
                videoUrl: technique.videoUrl,
                videoType: technique.videoType,
                tags: technique.tags,
                difficulty: technique.difficulty,
                masteryLevel: technique.masteryLevel
            )
            let created = try await service.createSharedTechnique(
                groupId: groupId,
                userId: session.userId,
                accessToken: session.accessToken,
                technique: sharedTechnique,
                sourceTechniqueId: technique.id,
                expiresAt: expiresAt
            )
            sharedIds.append(created.id)
        }

        return sharedIds
    }

    func createTechnique(form: TechniqueForm) async -> Technique? {
        if !isPremium && techniques.count >= 10 {
            showError("無料版は技を10件まで登録できます")
            showPremiumSheet = true
            return nil
        }
        // Create technique locally first
        let techniqueId = UUID().uuidString
        let now = ISO8601DateFormatter().string(from: Date())

        let technique = Technique(
            id: techniqueId,
            userId: userId!,
            name: form.name,
            nameEn: form.nameEn,
            categoryId: nil,
            category: form.category,
            techniqueType: form.techniqueType,
            description: form.description,
            videoUrl: form.videoUrl,
            videoType: "youtube",
            tags: form.tags,
            difficulty: nil,
            masteryLevel: form.masteryLevel,
            createdAt: now,
            updatedAt: now
        )

        do {
            // Save to local storage
            try await localStorage.saveTechnique(technique)
            techniques.insert(technique, at: 0)
            print("✅ [DEBUG] Technique saved locally: \(techniqueId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - technique will be synced on manual backup")

            return technique
        } catch {
            showError("技の作成に失敗しました")
            return nil
        }
    }

    func updateTechnique(techniqueId: String, form: TechniqueForm) async {
        guard let existingTechnique = techniques.first(where: { $0.id == techniqueId }) else {
            showError("技が見つかりません")
            return
        }

        let updatedTechnique = Technique(
            id: existingTechnique.id,
            userId: existingTechnique.userId,
            name: form.name,
            nameEn: form.nameEn,
            categoryId: existingTechnique.categoryId,
            category: form.category,
            techniqueType: form.techniqueType,
            description: form.description,
            videoUrl: form.videoUrl,
            videoType: existingTechnique.videoType,
            tags: form.tags,
            difficulty: existingTechnique.difficulty,
            masteryLevel: form.masteryLevel,
            createdAt: existingTechnique.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date())
        )

        do {
            // Update local storage
            try await localStorage.saveTechnique(updatedTechnique)

            // Update the techniques array - force a new array to trigger @Published
            if let index = techniques.firstIndex(where: { $0.id == techniqueId }) {
                print("🔄 [DEBUG] Updating technique at index \(index) in array (total: \(techniques.count))")
                print("🔄 [DEBUG] Old technique: \(techniques[index].name)")
                print("🔄 [DEBUG] New technique: \(updatedTechnique.name)")

                // Create a new array to ensure @Published triggers
                var newTechniques = techniques
                newTechniques[index] = updatedTechnique
                techniques = newTechniques

                // Explicitly trigger objectWillChange
                objectWillChange.send()

                print("✅ [DEBUG] Technique array updated - count: \(techniques.count)")
            } else {
                print("❌ [DEBUG] Technique not found in array: \(techniqueId)")
            }
            print("✅ [DEBUG] Technique updated locally: \(techniqueId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - technique will be synced on manual backup")
        } catch {
            showError("技の更新に失敗しました")
        }
    }

    func deleteTechnique(techniqueId: String) async {
        do {
            // Delete from local storage
            try await localStorage.deleteTechnique(id: techniqueId)
            techniques.removeAll { $0.id == techniqueId }
            print("✅ [DEBUG] Technique deleted locally: \(techniqueId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - deletion will be synced on manual backup")
        } catch {
            showError("技の削除に失敗しました")
        }
    }

    func createTrainingLog(form: TrainingLogForm) async -> TrainingLog? {
        if !isPremium && trainingLogs.count >= 50 {
            showError("無料版は日記を50件まで登録できます")
            showPremiumSheet = true
            return nil
        }
        let logId = UUID().uuidString
        let now = ISO8601DateFormatter().string(from: Date())

        let log = TrainingLog(
            id: logId,
            userId: userId!,
            trainingDate: form.trainingDate,
            startTime: form.startTime,
            endTime: form.endTime,
            durationMinutes: form.durationMinutes,
            notes: form.notes,
            content: form.content,
            condition: form.condition,
            sparringRounds: nil,
            createdAt: now,
            updatedAt: now,
            techniques: nil,
            flows: nil,
            videoUrls: nil  // 動画はLocalVideoStoreで管理
        )

        do {
            // Save to local storage
            try await localStorage.saveTrainingLog(log)
            trainingLogs.insert(log, at: 0)
            print("✅ [DEBUG] Training log saved locally: \(logId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - training log will be synced on manual backup")

            return log
        } catch {
            showError("記録の作成に失敗しました")
            return nil
        }
    }

    func updateTrainingLog(logId: String, form: TrainingLogForm) async {
        guard let existingLog = trainingLogs.first(where: { $0.id == logId }) else {
            showError("記録が見つかりません")
            return
        }

        print("💾 [DEBUG AppViewModel] Updating log \(logId)")
        print("💾 [DEBUG AppViewModel] Form videoUrls: \(form.videoUrls ?? [])")
        print("💾 [DEBUG AppViewModel] Existing videoUrls: \(existingLog.videoUrls ?? [])")
        print("💾 [DEBUG AppViewModel] Form startTime: \(form.startTime ?? "nil"), endTime: \(form.endTime ?? "nil")")
        print("💾 [DEBUG AppViewModel] Form condition: \(form.condition ?? 0)")

        let updatedLog = TrainingLog(
            id: existingLog.id,
            userId: existingLog.userId,
            trainingDate: form.trainingDate,
            startTime: form.startTime,
            endTime: form.endTime,
            durationMinutes: form.durationMinutes,
            notes: form.notes,
            content: form.content,
            condition: form.condition,
            sparringRounds: existingLog.sparringRounds,
            createdAt: existingLog.createdAt,
            updatedAt: ISO8601DateFormatter().string(from: Date()),
            techniques: existingLog.techniques,
            flows: existingLog.flows,
            videoUrls: form.videoUrls
        )

        print("💾 [DEBUG AppViewModel] Updated log videoUrls: \(updatedLog.videoUrls ?? [])")

        do {
            // Update local storage
            try await localStorage.saveTrainingLog(updatedLog)

            // Update the trainingLogs array - force a new array to trigger @Published
            if let index = trainingLogs.firstIndex(where: { $0.id == logId }) {
                // Create a new array to ensure @Published triggers
                var newLogs = trainingLogs
                newLogs[index] = updatedLog
                trainingLogs = newLogs

                // Explicitly trigger objectWillChange
                objectWillChange.send()
            }
            print("✅ [DEBUG] Training log updated locally: \(logId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - training log will be synced on manual backup")
        } catch {
            showError("記録の更新に失敗しました")
        }
    }

    func deleteTrainingLog(logId: String) async {
        do {
            // Delete from local storage
            try await localStorage.deleteTrainingLog(id: logId)
            trainingLogs.removeAll { $0.id == logId }
            print("✅ [DEBUG] Training log deleted locally: \(logId)")
            print("ℹ️ [DEBUG] Auto-sync disabled - deletion will be synced on manual backup")
        } catch {
            showError("記録の削除に失敗しました")
        }
    }

    func createGroup(name: String, description: String?) async -> Group? {
        guard let userId else { return nil }
        do {
            let group = try await service.createGroup(
                userId: userId,
                accessToken: session?.accessToken,
                name: name,
                description: description
            )
            groups.insert(group, at: 0)
            return group
        } catch {
            showError("グループ作成に失敗しました (\(errorDetails(error)))")
            return nil
        }
    }

    func joinGroup(inviteCode: String) async -> Group? {
        guard let userId else { return nil }
        do {
            let group = try await service.joinGroup(
                userId: userId,
                accessToken: session?.accessToken,
                inviteCode: inviteCode
            )
            if groups.contains(where: { $0.id == group.id }) == false {
                groups.insert(group, at: 0)
            }
            return group
        } catch {
            showError("参加に失敗しました (\(errorDetails(error)))")
            return nil
        }
    }

    func fetchGroupMembers(groupId: String) async -> [GroupMember] {
        do {
            let members = try await service.fetchGroupMembers(
                groupId: groupId,
                accessToken: session?.accessToken
            )
            let userIds = members.map { $0.userId }.filter { !$0.isEmpty }
            let profiles = try await service.fetchProfiles(userIds: userIds, accessToken: session?.accessToken)
            let profileLookup = Dictionary(uniqueKeysWithValues: profiles.map { ($0.id, $0) })
            return members.map { member in
                GroupMember(
                    id: member.id,
                    groupId: member.groupId,
                    userId: member.userId,
                    role: member.role,
                    joinedAt: member.joinedAt,
                    user: profileLookup[member.userId]
                )
            }
        } catch {
            print("❌ Error fetching group members: \(error)")
            showError("メンバー取得に失敗しました (\(errorDetails(error)))")
            return []
        }
    }

    func updateGroup(groupId: String, name: String, description: String?) async {
        do {
            let updated = try await service.updateGroup(
                groupId: groupId,
                name: name,
                description: description,
                accessToken: session?.accessToken
            )
            if let index = groups.firstIndex(where: { $0.id == groupId }) {
                groups[index] = updated
            }
        } catch {
            showError("更新に失敗しました")
        }
    }

    func updateGroupIcon(groupId: String, imageData: Data) async -> Bool {
        guard let session else {
            showError("ログインが必要です")
            return false
        }
        if let expiresAt = session.expiresAt, Date() >= expiresAt {
            await refreshSessionIfNeeded()
        }
        guard let accessToken = self.session?.accessToken, !accessToken.isEmpty else {
            showError("ログインが必要です")
            return false
        }
        do {
            let iconUrl = try await service.uploadGroupIcon(
                groupId: groupId,
                accessToken: accessToken,
                data: imageData
            )
            let updated = try await service.updateGroupIcon(
                groupId: groupId,
                iconUrl: iconUrl,
                accessToken: accessToken
            )
            if let index = groups.firstIndex(where: { $0.id == groupId }) {
                groups[index] = updated
            }
            return true
        } catch {
            showError("グループ画像の更新に失敗しました (\(errorDetails(error)))")
            return false
        }
    }


    func kickGroupMember(groupId: String, userId: String) async {
        do {
            try await service.leaveGroup(
                groupId: groupId,
                userId: userId,
                accessToken: session?.accessToken
            )
        } catch {
            showError("追放に失敗しました")
        }
    }

    func leaveGroup(groupId: String) async {
        guard let userId else { return }
        do {
            try await service.leaveGroup(
                groupId: groupId,
                userId: userId,
                accessToken: session?.accessToken
            )
            groups.removeAll { $0.id == groupId }
        } catch {
            showError("退出に失敗しました")
        }
    }

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "ja_JP")
        formatter.timeZone = .current
        return formatter
    }()

    private static let timeFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter
    }()

    private var sortedTrainingLogs: [TrainingLog] {
        trainingLogs.sorted { logSortDate($0) > logSortDate($1) }
    }

    private func logSortDate(_ log: TrainingLog) -> Date {
        if let date = Self.dateFormatter.date(from: log.trainingDate) {
            if let time = log.startTime, let timeDate = Self.timeFormatter.date(from: time) {
                let calendar = Calendar.current
                let dateComponents = calendar.dateComponents([.year, .month, .day], from: date)
                let timeComponents = calendar.dateComponents([.hour, .minute], from: timeDate)
                var combined = DateComponents()
                combined.year = dateComponents.year
                combined.month = dateComponents.month
                combined.day = dateComponents.day
                combined.hour = timeComponents.hour
                combined.minute = timeComponents.minute
                if let combinedDate = calendar.date(from: combined) {
                    return combinedDate
                }
            }
            return date
        }
        if let createdAt = log.createdAt, let isoDate = ISO8601DateFormatter().date(from: createdAt) {
            return isoDate
        }
        return Date.distantPast
    }

    func showError(_ message: String) {
        errorMessage = message
        showErrorPopup = true
    }

    func dismissError() {
        showErrorPopup = false
        // Clear error message after a delay to allow animation to complete
        Task {
            try? await Task.sleep(nanoseconds: 300_000_000) // 0.3 seconds
            errorMessage = nil
        }
    }

    private func updatePremiumStatus(storePremium: Bool) {
        let serverPremium = isServerPremium()
        let combined = storePremium || serverPremium
        if isPremium != combined {
            isPremium = combined
        }
    }

    private func isServerPremium() -> Bool {
        if profile?.isPremium == true {
            return true
        }
        guard let premiumUntil = profile?.premiumUntil,
              let date = ISO8601DateFormatter().date(from: premiumUntil) else {
            return false
        }
        return date > Date()
    }

    // MARK: - Sync Functions

    func syncWithCloud() async {
        guard SupabaseConfig.isConfigured, let userId = userId, let session = session else {
            print("⚠️ [DEBUG] Cannot sync: Not authenticated")
            return
        }

        print("🔄 [DEBUG] Starting cloud sync...")

        // Sync techniques
        do {
            // Upload unsynced techniques
            let unsyncedTechniques = try await localStorage.fetchUnsyncedTechniques()
            print("📤 [DEBUG] Uploading \(unsyncedTechniques.count) unsynced techniques")

            for technique in unsyncedTechniques {
                do {
                    // Create or update on server
                    _ = try await service.createTechnique(
                        userId: userId,
                        accessToken: session.accessToken,
                        payload: [
                            "name": technique.name,
                            "technique_type": technique.techniqueType ?? "other",
                            "video_type": "youtube",
                            "name_en": technique.nameEn as Any,
                            "category": technique.category as Any,
                            "description": technique.description as Any,
                            "video_url": technique.videoUrl as Any
                        ]
                    )
                    try await localStorage.markAsSynced(techniqueId: technique.id)
                    print("✅ [DEBUG] Synced technique: \(technique.name)")
                } catch {
                    print("⚠️ [DEBUG] Failed to sync technique \(technique.name): \(error)")
                }
            }

            // Download from cloud and merge
            let cloudTechniques = try await service.fetchTechniques(userId: userId, accessToken: session.accessToken)
            print("📥 [DEBUG] Downloaded \(cloudTechniques.count) techniques from cloud")

            for cloudTechnique in cloudTechniques {
                try await localStorage.saveTechnique(cloudTechnique)
                try await localStorage.markAsSynced(techniqueId: cloudTechnique.id)
            }

            // Reload techniques
            techniques = try await localStorage.fetchTechniques(userId: userId)
            print("✅ [DEBUG] Techniques synced: \(techniques.count)")

        } catch {
            print("❌ [DEBUG] Error syncing techniques: \(error)")
        }

        // Sync flows
        do {
            let cloudFlows = try await service.fetchFlows(userId: userId, accessToken: session.accessToken)
            print("📥 [DEBUG] Downloaded \(cloudFlows.count) flows from cloud")

            for cloudFlow in cloudFlows {
                try await localStorage.saveFlow(cloudFlow)
            }

            flows = try await localStorage.fetchFlows(userId: userId)
            print("✅ [DEBUG] Flows synced: \(flows.count)")
        } catch {
            print("❌ [DEBUG] Error syncing flows: \(error)")
        }

        // Sync training logs
        do {
            let cloudLogs = try await service.fetchTrainingLogs(userId: userId, accessToken: session.accessToken)
            print("📥 [DEBUG] Downloaded \(cloudLogs.count) training logs from cloud")

            for cloudLog in cloudLogs {
                try await localStorage.saveTrainingLog(cloudLog)
            }

            trainingLogs = try await localStorage.fetchTrainingLogs(userId: userId)
            print("✅ [DEBUG] Training logs synced: \(trainingLogs.count)")
        } catch {
            print("❌ [DEBUG] Error syncing training logs: \(error)")
        }

        print("✅ [DEBUG] Cloud sync completed")
    }

    func backupToCloud() async {
        guard SupabaseConfig.isConfigured else {
            showError("Supabase設定が未入力です")
            return
        }
        guard let userId = userId, let session = session else {
            showError("バックアップにはログインが必要です")
            return
        }

        do {
            let cloudTechniques = try await service.fetchTechniques(userId: userId, accessToken: session.accessToken)
            let localTechniqueIds = Set(techniques.map { $0.id })
            for cloudTechnique in cloudTechniques where !localTechniqueIds.contains(cloudTechnique.id) {
                try await service.deleteTechnique(techniqueId: cloudTechnique.id, accessToken: session.accessToken)
            }
            for technique in techniques {
                try await service.upsertTechnique(userId: userId, accessToken: session.accessToken, technique: technique)
                try? await localStorage.markAsSynced(techniqueId: technique.id)
            }
        } catch {
            showError("技のバックアップに失敗しました (\(errorDetails(error)))")
        }

        do {
            let cloudFlows = try await service.fetchFlows(userId: userId, accessToken: session.accessToken)
            let localFlowIds = Set(flows.map { $0.id })
            for cloudFlow in cloudFlows where !localFlowIds.contains(cloudFlow.id) {
                try await service.deleteFlow(flowId: cloudFlow.id, accessToken: session.accessToken)
            }
            for flow in flows {
                try await service.upsertFlow(userId: userId, accessToken: session.accessToken, flow: flow)
            }
        } catch {
            showError("フローのバックアップに失敗しました (\(errorDetails(error)))")
        }

        do {
            let cloudLogs = try await service.fetchTrainingLogs(userId: userId, accessToken: session.accessToken)
            let localLogIds = Set(trainingLogs.map { $0.id })
            for cloudLog in cloudLogs where !localLogIds.contains(cloudLog.id) {
                try await service.deleteTrainingLog(logId: cloudLog.id, accessToken: session.accessToken)
            }
            for log in trainingLogs {
                try await service.upsertTrainingLog(userId: userId, accessToken: session.accessToken, log: log)
            }
        } catch {
            showError("日記のバックアップに失敗しました (\(errorDetails(error)))")
        }
    }

    func restoreFromCloud() async {
        guard SupabaseConfig.isConfigured else {
            showError("Supabase設定が未入力です")
            return
        }
        guard let userId = userId, let session = session else {
            showError("取得にはログインが必要です")
            return
        }

        do {
            if let cloudProfile = try await service.fetchProfile(userId: userId, accessToken: session.accessToken) {
                try await localStorage.saveProfile(cloudProfile)
                profile = cloudProfile
                updatePremiumStatus(storePremium: premiumManager.isPremium)
            }
        } catch {
            showError("プロフィールの取得に失敗しました (\(errorDetails(error)))")
        }

        do {
            let cloudTechniques = try await service.fetchTechniques(userId: userId, accessToken: session.accessToken)
            let cloudTechniqueIds = Set(cloudTechniques.map { $0.id })
            let localTechniques = try await localStorage.fetchTechniques(userId: userId)
            for localTechnique in localTechniques where !cloudTechniqueIds.contains(localTechnique.id) {
                try await localStorage.deleteTechnique(id: localTechnique.id)
            }
            for cloudTechnique in cloudTechniques {
                try await localStorage.saveTechnique(cloudTechnique)
                try await localStorage.markAsSynced(techniqueId: cloudTechnique.id)
            }
            techniques = try await localStorage.fetchTechniques(userId: userId)
        } catch {
            showError("技の取得に失敗しました (\(errorDetails(error)))")
        }

        do {
            let cloudFlows = try await service.fetchFlows(userId: userId, accessToken: session.accessToken)
            let cloudFlowIds = Set(cloudFlows.map { $0.id })
            let localFlows = try await localStorage.fetchFlows(userId: userId)
            for localFlow in localFlows where !cloudFlowIds.contains(localFlow.id) {
                try await localStorage.deleteFlow(id: localFlow.id)
            }
            for cloudFlow in cloudFlows {
                try await localStorage.saveFlow(cloudFlow)
            }
            flows = try await localStorage.fetchFlows(userId: userId)
        } catch {
            showError("フローの取得に失敗しました (\(errorDetails(error)))")
        }

        do {
            let cloudLogs = try await service.fetchTrainingLogs(userId: userId, accessToken: session.accessToken)
            let cloudLogIds = Set(cloudLogs.map { $0.id })
            let localLogs = try await localStorage.fetchTrainingLogs(userId: userId)
            for localLog in localLogs where !cloudLogIds.contains(localLog.id) {
                try await localStorage.deleteTrainingLog(id: localLog.id)
            }
            for cloudLog in cloudLogs {
                try await localStorage.saveTrainingLog(cloudLog)
            }
            trainingLogs = try await localStorage.fetchTrainingLogs(userId: userId)
        } catch {
            showError("日記の取得に失敗しました (\(errorDetails(error)))")
        }
    }

    private func errorDetails(_ error: Error) -> String {
        if let supabaseError = error as? SupabaseError {
            let trimmed = supabaseError.responseBody.trimmingCharacters(in: .whitespacesAndNewlines)
            let body = trimmed.isEmpty ? "no body" : trimmed
            return "Supabase \(supabaseError.statusCode): \(body)"
        }
        let nsError = error as NSError
        if nsError.domain == NSURLErrorDomain {
            return "\(nsError.domain) \(nsError.code)"
        }
        if nsError.domain != "Swift.Error" {
            return "\(nsError.domain) \(nsError.code)"
        }
        let message = error.localizedDescription.trimmingCharacters(in: .whitespacesAndNewlines)
        return message.isEmpty ? "unknown error" : message
    }

    func updateTabAnimations(_ enabled: Bool) {
        enableTabAnimations = enabled
        UserDefaults.standard.set(enabled, forKey: enableTabAnimationsKey)
        print("⚙️ [DEBUG] Tab animations: \(enabled ? "enabled" : "disabled")")
    }
}
