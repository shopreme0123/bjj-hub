import SwiftUI
import PhotosUI

struct SettingsView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var beltSelection: BeltColor = .white
    @State private var stripeSelection = 0
    @State private var displayName = ""
    @State private var bio = ""
    @State private var localAvatarURL: URL?
    @State private var selectedAvatarItem: PhotosPickerItem?
    @State private var showAvatarActions = false
    @State private var showAvatarPicker = false
    @State private var showSavedMessage = false
    @State private var savedBannerText: String?
    @State private var showLogoutConfirmation = false
    @State private var showPremium = false
    @State private var isBackingUp = false
    @State private var isRestoring = false
    @State private var backupMessage: String?
    @State private var restoreMessage: String?
    @State private var showBackupSheet = false
    @State private var showBackupConfirmation = false
    @State private var showPrivacyPolicy = false
    @State private var showTerms = false
    @State private var showAuthSheet = false
    @State private var loginEmail = ""
    @State private var loginPassword = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.backgroundGradient
                .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header with close button
                    HStack {
                        Text("設定")
                            .font(.display(28, weight: .heavy))
                            .foregroundStyle(theme.textPrimary)

                        Spacer()

                        Button(action: { dismiss() }) {
                            Image(systemName: "xmark")
                                .font(.app(size: 14, weight: .semibold))
                                .foregroundStyle(theme.textPrimary)
                                .frame(width: 36, height: 36)
                                .background(theme.card)
                                .clipShape(Circle())
                                .cardShadow(radius: 8, y: 2)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)

                    ProfileEditorView(
                        theme: theme,
                        displayName: $displayName,
                        bio: $bio,
                        localAvatarURL: localAvatarURL,
                        onAvatarTap: { showAvatarActions = true },
                        onSave: { Task { await saveProfile() } }
                    )

                    // Backup/Restore Buttons
                    if viewModel.isAuthenticated {
                        VStack(spacing: 12) {
                            Button(action: { showBackupSheet = true }) {
                                HStack(spacing: 12) {
                                    Image(systemName: "arrow.triangle.2.circlepath.circle")
                                        .font(.app(size: 18, weight: .semibold))
                                        .foregroundStyle(theme.textMuted)
                                        .frame(width: 40, height: 40)
                                        .background(theme.background)
                                        .clipShape(Circle())

                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("バックアップ")
                                            .font(.title(15, weight: .bold))
                                        if let backupMessage {
                                            Text(backupMessage)
                                                .font(.caption(12, weight: .medium))
                                                .foregroundStyle(theme.textMuted)
                                        } else if let restoreMessage {
                                            Text(restoreMessage)
                                                .font(.caption(12, weight: .medium))
                                                .foregroundStyle(theme.textMuted)
                                        }
                                    }

                                    Spacer()
                                }
                                .foregroundStyle(theme.textPrimary)
                                .padding(16)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                                .cardShadow(radius: 8, y: 2)
                            }
                            .disabled(isBackingUp || isRestoring)
                            .pressEffect()
                        }
                        .padding(.horizontal, 20)
                    }

                    Button(action: { showPremium = true }) {
                        PremiumStatusView(isPremium: viewModel.isPremium, theme: theme)
                    }
                    .buttonStyle(.plain)

                    BeltSelectionView(selected: $beltSelection, theme: theme)
                        .onChange(of: beltSelection) { oldValue, newValue in
                            // Adjust stripes immediately to prevent layout jump when switching to/from black belt
                            stripeSelection = min(stripeSelection, maxStripes)

                            Task {
                                await viewModel.updateBeltColor(newValue)
                            }
                        }

                    StripeSelectionView(
                        selected: $stripeSelection,
                        maxStripes: maxStripes,
                        theme: theme
                    )
                    .onChange(of: stripeSelection) {
                        Task {
                            await viewModel.updateBeltStripes(stripeSelection)
                        }
                    }

                    // Tab Animation Toggle
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("タブ切り替えアニメーション")
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)

                                Text("タブをタップしたときのアニメーション効果")
                                    .font(.app(size: 12, weight: .medium))
                                    .foregroundStyle(theme.textMuted)
                            }

                            Spacer()

                            Toggle("", isOn: Binding(
                                get: { viewModel.enableTabAnimations },
                                set: { viewModel.updateTabAnimations($0) }
                            ))
                            .labelsHidden()
                            .tint(theme.primary)
                        }
                        .padding(16)
                        .background(theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )
                        .cardShadow(radius: 16, y: 6)
                    }
                    .padding(.horizontal, 20)

                    AppInfoView(
                        theme: theme,
                        onShowPrivacyPolicy: {
                            showPrivacyPolicy = true
                        },
                        onShowTerms: {
                            showTerms = true
                        }
                    )

                    // Login or Logout section
                    if viewModel.isAuthenticated {
                        Button(action: {
                            showLogoutConfirmation = true
                        }) {
                            HStack {
                                Spacer()
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                    .font(.app(size: 14, weight: .semibold))
                                Text("ログアウト")
                                    .font(.title(15, weight: .bold))
                                Spacer()
                            }
                            .padding(.vertical, 14)
                            .foregroundStyle(Color.red)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(Color.red.opacity(0.3), lineWidth: 1.5)
                            )
                            .cardShadow(color: Color.red.opacity(0.15), radius: 12, y: 4)
                        }
                        .padding(.horizontal, 20)
                    } else {
                        LoginSectionView(
                            email: $loginEmail,
                            password: $loginPassword,
                            viewModel: viewModel,
                            theme: theme,
                            onShowSignUp: {
                                showAuthSheet = true
                            }
                        )
                    }
                }
                .padding(.top, 8)
                .padding(.bottom, 96)
            }
        }
        .onAppear {
            beltSelection = viewModel.beltColor
            stripeSelection = viewModel.beltStripes
            displayName = viewModel.profile?.displayName ?? ""
            bio = viewModel.profile?.bio ?? ""
            if let userId = viewModel.userId {
                localAvatarURL = LocalAvatarStore.avatarURL(for: userId)
            }
        }
        .onChange(of: selectedAvatarItem) {
            guard let item = selectedAvatarItem, let userId = viewModel.userId else { return }
            Task {
                do {
                    let data = try await item.loadTransferable(type: Data.self)
                    guard let data else { return }
                    try LocalAvatarStore.saveAvatar(data: data, userId: userId)
                    localAvatarURL = LocalAvatarStore.avatarURL(for: userId)
                    selectedAvatarItem = nil
                } catch {
                    selectedAvatarItem = nil
                }
            }
        }
        .photosPicker(isPresented: $showAvatarPicker, selection: $selectedAvatarItem, matching: .images)
        .confirmationDialog("プロフィール画像", isPresented: $showAvatarActions, titleVisibility: .visible) {
            Button("画像を選択") { showAvatarPicker = true }
            if localAvatarURL != nil {
                Button("削除", role: .destructive) { removeAvatar() }
            }
            Button("キャンセル", role: .cancel) {}
        }
        .sheet(isPresented: $showPremium) {
            PremiumView(viewModel: viewModel)
        }
        .sheet(isPresented: $showAuthSheet) {
            AuthView(viewModel: viewModel, initiallySignUp: true, allowsModeSwitch: false)
        }
        .onChange(of: viewModel.session) { _, newSession in
            // セッションが更新されたら認証モーダルを閉じる
            if newSession != nil {
                showAuthSheet = false
            }
        }
        .sheet(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView(theme: theme)
        }
        .sheet(isPresented: $showTerms) {
            TermsView(theme: theme)
        }
        .alert("ログアウト", isPresented: $showLogoutConfirmation) {
            Button("キャンセル", role: .cancel) {}
            Button("ログアウト", role: .destructive) {
                viewModel.signOut()
                dismiss()
            }
        } message: {
            Text("ログアウトしますか？")
        }
        .alert("バックアップ", isPresented: $showBackupConfirmation) {
            Button("キャンセル", role: .cancel) {}
            Button("実行") {
                Task { await backupData() }
            }
        } message: {
            Text("本当にバックアップしますか？")
        }
        .overlay(alignment: .top) {
            if showSavedMessage {
                SavedBanner(text: savedBannerText ?? "保存しました")
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    .transition(.move(edge: .top).combined(with: .opacity))
            }

            if viewModel.showErrorPopup, let errorMessage = viewModel.errorMessage {
                ErrorPopup(
                    message: errorMessage,
                    theme: theme,
                    onDismiss: { viewModel.dismissError() }
                )
                .transition(.move(edge: .top).combined(with: .opacity))
                .zIndex(99999)
            }

            if showBackupSheet {
                BackupActionSheet(
                    theme: theme,
                    isBusy: isBackingUp || isRestoring,
                    onBackup: {
                        showBackupSheet = false
                        showBackupConfirmation = true
                    },
                    onRestore: {
                        showBackupSheet = false
                        Task { await restoreData() }
                    },
                    onDismiss: { showBackupSheet = false }
                )
                .zIndex(100000)
            }
        }
    }

    private var maxStripes: Int {
        switch beltSelection {
        case .black: return 6
        default: return 4
        }
    }

    private func saveProfile() async {
        let name = displayName.trimmingCharacters(in: .whitespacesAndNewlines)
        let bioValue = bio.trimmingCharacters(in: .whitespacesAndNewlines)

        // Upload avatar if local avatar exists
        var avatarUrl: String? = nil
        if let userId = viewModel.userId,
           let localURL = localAvatarURL ?? LocalAvatarStore.avatarURL(for: userId),
           let data = try? Data(contentsOf: localURL) {
            let accessToken = viewModel.session?.accessToken
            do {
                avatarUrl = try await viewModel.supabaseService.uploadAvatar(
                    userId: userId,
                    accessToken: accessToken,
                    data: data
                )
                print("✅ [DEBUG] Avatar uploaded: \(avatarUrl ?? "nil")")
            } catch {
                print("⚠️ [DEBUG] Avatar upload failed: \(error.localizedDescription)")
                // Continue with profile save even if avatar upload fails
            }
        }

        await viewModel.updateProfile(
            displayName: name,
            bio: bioValue,
            avatarUrl: avatarUrl
        )
        await MainActor.run {
            savedBannerText = "保存しました"
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                showSavedMessage = true
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation(.easeOut(duration: 0.3)) {
                showSavedMessage = false
                savedBannerText = nil
            }
        }
    }

    private func removeAvatar() {
        guard let userId = viewModel.userId else { return }
        LocalAvatarStore.deleteAvatar(for: userId)
        localAvatarURL = nil
    }

    private func backupData() async {
        await MainActor.run {
            isBackingUp = true
            backupMessage = "バックアップ中..."
        }

        await viewModel.backupToCloud()

        await MainActor.run {
            backupMessage = "バックアップ完了"
            savedBannerText = "バックアップ完了"
            isBackingUp = false
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                showSavedMessage = true
            }
            Task {
                try? await Task.sleep(for: .seconds(2))
                await MainActor.run {
                    showSavedMessage = false
                    savedBannerText = nil
                    backupMessage = nil
                }
            }
        }
    }

    private func restoreData() async {
        await MainActor.run {
            isRestoring = true
            restoreMessage = "取得中..."
        }

        await viewModel.restoreFromCloud()

        await MainActor.run {
            restoreMessage = "取得完了"
            savedBannerText = "取得完了"
            withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                showSavedMessage = true
            }
            Task {
                try? await Task.sleep(for: .seconds(2))
                await MainActor.run {
                    showSavedMessage = false
                    savedBannerText = nil
                    isRestoring = false
                    restoreMessage = nil
                }
            }
        }
    }
}

private struct BackupActionSheet: View {
    let theme: BeltTheme
    let isBusy: Bool
    let onBackup: () -> Void
    let onRestore: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        ZStack {
            Color.black.opacity(0.35)
                .ignoresSafeArea()
                .onTapGesture { onDismiss() }

            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 16) {
                    RoundedRectangle(cornerRadius: 3, style: .continuous)
                        .fill(theme.cardBorder)
                        .frame(width: 36, height: 5)
                        .padding(.top, 8)

                    VStack(spacing: 6) {
                        Text("バックアップ")
                            .font(.app(size: 16, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                        Text("操作を選択してください")
                            .font(.app(size: 12, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }

                    VStack(spacing: 10) {
                        BackupActionRow(
                            theme: theme,
                            title: "デバイスからバックアップ",
                            subtitle: "動画は含まれません（技・日記の動画は端末のみ）",
                            systemImage: "arrow.up.circle.fill",
                            isPrimary: false,
                            action: onBackup
                        )
                        .disabled(isBusy)

                        BackupActionRow(
                            theme: theme,
                            title: "サーバーから取得",
                            subtitle: "動画は含まれません（技・日記の動画は端末のみ）",
                            systemImage: "arrow.down.circle.fill",
                            isPrimary: false,
                            action: onRestore
                        )
                        .disabled(isBusy)
                    }

                    Button(action: onDismiss) {
                        Text("キャンセル")
                            .font(.app(size: 14, weight: .semibold))
                            .frame(maxWidth: .infinity)
                            .padding(12)
                            .foregroundStyle(theme.textMuted)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1)
                            )
                    }
                    .pressEffect()
                    .padding(.bottom, 6)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
                .frame(maxWidth: .infinity)
                .background(theme.background)
                .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(theme.cardBorder, lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.2), radius: 18, x: 0, y: 8)
                .padding(.horizontal, 16)
                .padding(.bottom, 12)
            }
        }
    }
}

private struct BackupActionRow: View {
    let theme: BeltTheme
    let title: String
    let subtitle: String
    let systemImage: String
    let isPrimary: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.app(size: 18, weight: .semibold))
                    .foregroundStyle(isPrimary ? .white : theme.primary)
                    .frame(width: 34, height: 34)
                    .background(isPrimary ? theme.primary.opacity(0.9) : theme.primary.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.app(size: 14, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                    Text(subtitle)
                        .font(.app(size: 12, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                }

                Spacer()
            }
            .padding(14)
            .background(isPrimary ? theme.primary.opacity(0.12) : theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isPrimary ? theme.primary.opacity(0.2) : theme.cardBorder, lineWidth: 1)
            )
        }
        .pressEffect()
    }
}

private struct ProfileEditorView: View {
    let theme: BeltTheme
    @Binding var displayName: String
    @Binding var bio: String
    let localAvatarURL: URL?
    let onAvatarTap: () -> Void
    let onSave: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 14) {
                Button(action: onAvatarTap) {
                    ZStack(alignment: .bottomTrailing) {
                        AvatarPreview(localAvatarURL: localAvatarURL, theme: theme, placeholder: displayName)
                            .frame(width: 64, height: 64)

                        Image(systemName: "camera.fill")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 24, height: 24)
                            .background(theme.primary)
                            .clipShape(Circle())
                            .overlay(
                                Circle()
                                    .stroke(theme.card, lineWidth: 2)
                            )
                            .offset(x: 2, y: 2)
                    }
                }
                .buttonStyle(.plain)

                VStack(alignment: .leading, spacing: 6) {
                    Text("表示名")
                        .font(.caption(11))
                        .foregroundStyle(theme.textMuted)
                        .textCase(.uppercase)
                        .tracking(0.5)

                    TextField("名前を入力", text: $displayName)
                        .font(.title(15, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                }

                Spacer()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("自己紹介")
                    .font(.caption(11))
                    .foregroundStyle(theme.textMuted)
                    .textCase(.uppercase)
                    .tracking(0.5)

                TextEditor(text: $bio)
                    .frame(height: 88)
                    .padding(10)
                    .scrollContentBackground(.hidden)
                    .background(theme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1.5)
                    )
            }

            Button(action: onSave) {
                HStack {
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .font(.app(size: 14, weight: .semibold))
                    Text("プロフィールを保存")
                        .font(.title(14, weight: .bold))
                    Spacer()
                }
                .padding(.vertical, 13)
                .background(theme.gradient)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .glowEffect(color: theme.primary.opacity(0.3), radius: 12)
            }
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }
}

private struct AvatarPreview: View {
    let localAvatarURL: URL?
    let theme: BeltTheme
    let placeholder: String

    var body: some View {
        ZStack {
            if let localAvatarURL {
                AsyncImage(url: localAvatarURL) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    theme.gradient
                }
            } else {
                theme.gradient
            }
        }
        .frame(width: 64, height: 64)
        .clipShape(Circle())
        .overlay(
            Text(String(placeholder.prefix(1)))
                .font(.display(22, weight: .bold))
                .foregroundStyle(.white)
                .opacity(localAvatarURL == nil ? 1 : 0)
        )
        .overlay(
            Circle()
                .stroke(theme.card, lineWidth: 3)
        )
        .cardShadow(radius: 12, y: 4)
    }
}

private struct BeltSelectionView: View {
    @Binding var selected: BeltColor
    let theme: BeltTheme

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("帯の色")
                .font(.title(15, weight: .bold))
                .foregroundStyle(theme.textPrimary)

            HStack(spacing: 10) {
                ForEach(BeltColor.allCases, id: \.self) { belt in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.25)) {
                            selected = belt
                        }
                    }) {
                        VStack(spacing: 8) {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(BeltTheme(belt: belt).beltGradient)
                                .frame(height: 32)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(selected == belt ? theme.primary : theme.cardBorder, lineWidth: selected == belt ? 2 : 1)
                                )
                                .glowEffect(color: selected == belt ? theme.primary.opacity(0.3) : .clear, radius: 8)

                            if selected == belt {
                                Image(systemName: "checkmark.circle.fill")
                                    .font(.app(size: 14, weight: .bold))
                                    .foregroundStyle(theme.primary)
                                    .transition(.scale.combined(with: .opacity))
                            } else {
                                Circle()
                                    .fill(Color.clear)
                                    .frame(width: 14, height: 14)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(selected == belt ? theme.accentGlow : Color.clear)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
            .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }
}

private struct StripeSelectionView: View {
    @Binding var selected: Int
    let maxStripes: Int
    let theme: BeltTheme

    // Dynamically calculate button size based on number of stripes
    private var buttonSize: CGFloat {
        // For 5 buttons (0-4): 48pt, for 7 buttons (0-6): 38pt
        maxStripes >= 6 ? 38 : 48
    }

    private var buttonSpacing: CGFloat {
        // Reduce spacing for more buttons
        maxStripes >= 6 ? 6 : 12
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("ストライプ")
                    .font(.title(15, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                HStack(spacing: 5) {
                    ForEach(0..<maxStripes, id: \.self) { index in
                        Capsule()
                            .fill(index < selected ? theme.primary : theme.cardBorder.opacity(0.6))
                            .frame(width: 10, height: 8)
                    }
                }
            }

            // Centered stripe selection with fixed container width
            HStack(spacing: buttonSpacing) {
                ForEach(0...maxStripes, id: \.self) { count in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selected = count
                        }
                    }) {
                        VStack(spacing: 8) {
                            Text("\(count)")
                                .font(.body(16, weight: .bold))
                                .foregroundStyle(count == selected ? .white : theme.textPrimary)
                                .frame(width: buttonSize, height: buttonSize)
                                .background(
                                    ZStack {
                                        if count == selected {
                                            theme.gradient
                                        } else {
                                            theme.card
                                        }
                                    }
                                )
                                .clipShape(Circle())
                                .overlay(
                                    Circle()
                                        .stroke(count == selected ? theme.primary : theme.cardBorder, lineWidth: count == selected ? 2 : 1)
                                )
                                .glowEffect(color: count == selected ? theme.primary.opacity(0.4) : .clear, radius: 12)
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }
}

private struct NotificationToggleView: View {
    let isAuthorized: Bool
    let theme: BeltTheme
    let onToggle: (Bool) -> Void

    var body: some View {
        Button(action: {
            onToggle(!isAuthorized)
        }) {
            HStack {
                HStack(spacing: 12) {
                    Image(systemName: isAuthorized ? "bell.fill" : "bell.slash.fill")
                        .font(.app(size: 18, weight: .semibold))
                        .foregroundStyle(theme.primary)
                        .frame(width: 40, height: 40)
                        .background(theme.accentGlow)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 4) {
                        Text("通知")
                            .font(.title(15, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                        Text(isAuthorized ? "許可済み" : "未許可")
                            .font(.caption(12))
                            .foregroundStyle(theme.textMuted)
                    }
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textMuted)
            }
            .padding(16)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
            .cardShadow(radius: 16, y: 6)
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 20)
    }
}

private struct PremiumStatusView: View {
    let isPremium: Bool
    let theme: BeltTheme

    var body: some View {
        HStack {
            HStack(spacing: 12) {
                Image(systemName: "crown.fill")
                    .font(.app(size: 18, weight: .semibold))
                    .foregroundStyle(isPremium ? Color(hex: "#fbbf24") : theme.textMuted)
                    .frame(width: 40, height: 40)
                    .background(isPremium ? Color(hex: "#fbbf24").opacity(0.15) : theme.background)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text("プレミアム")
                        .font(.title(15, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                    Text(isPremium ? "有効" : "未加入")
                        .font(.caption(12))
                        .foregroundStyle(theme.textMuted)
                }
            }

            Spacer()

            if !isPremium {
                Text("アップグレード")
                    .font(.caption(13, weight: .bold))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(theme.primary)
                    .foregroundStyle(.white)
                    .clipShape(Capsule())
            } else {
                Image(systemName: "checkmark.circle.fill")
                    .font(.app(size: 20, weight: .semibold))
                    .foregroundStyle(Color(hex: "#10b981"))
            }
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }
}

private struct SavedBanner: View {
    let text: String

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .font(.app(size: 14, weight: .bold))
            Text(text)
                .font(.body(14, weight: .bold))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(hex: "#ecfdf3"))
        .foregroundStyle(Color(hex: "#15803d"))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .cardShadow(color: Color(hex: "#15803d").opacity(0.2), radius: 12, y: 4)
    }
}

private struct AppInfoView: View {
    let theme: BeltTheme
    let onShowPrivacyPolicy: () -> Void
    let onShowTerms: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("その他")
                .font(.title(15, weight: .bold))
                .foregroundStyle(theme.textPrimary)

            VStack(spacing: 10) {
                InfoRow(title: "バージョン", value: appVersion, theme: theme)
                Divider().background(theme.cardBorder.opacity(0.5))

                Button(action: onShowPrivacyPolicy) {
                    HStack {
                        Text("プライバシーポリシー")
                            .font(.body(13, weight: .medium))
                            .foregroundStyle(theme.textPrimary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.textMuted)
                    }
                    .contentShape(Rectangle())
                }

                Divider().background(theme.cardBorder.opacity(0.5))
                Button(action: onShowTerms) {
                    HStack {
                        Text("利用規約")
                            .font(.body(13, weight: .medium))
                            .foregroundStyle(theme.textPrimary)

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.textMuted)
                    }
                    .contentShape(Rectangle())
                }
            }
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "-"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "-"
        return "\(version) (\(build))"
    }
}

private struct InfoRow: View {
    let title: String
    let value: String
    let theme: BeltTheme

    var body: some View {
        HStack {
            Text(title)
                .font(.body(13, weight: .medium))
                .foregroundStyle(theme.textPrimary)
            Spacer()
            Text(value)
                .font(.caption(12))
                .foregroundStyle(theme.textMuted)
        }
    }
}

struct PremiumView: View {
    @ObservedObject var viewModel: AppViewModel
    @ObservedObject var premiumManager: PremiumManager
    @Environment(\.dismiss) private var dismiss
    @State private var showPrivacyPolicy = false
    @State private var showTerms = false
    @State private var showPurchaseError = false
    @State private var purchaseErrorMessage: String?
    @State private var selectedPlan: PremiumPlan = .monthly
    @State private var isPurchasing = false

    init(viewModel: AppViewModel) {
        self.viewModel = viewModel
        self._premiumManager = ObservedObject(wrappedValue: viewModel.premiumManager)
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(hex: "#fbbf24").opacity(0.15),
                        theme.background
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 16) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                Color(hex: "#fbbf24"),
                                                Color(hex: "#f59e0b")
                                            ],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 100, height: 100)
                                    .shadow(color: Color(hex: "#fbbf24").opacity(0.4), radius: 20, x: 0, y: 10)

                                Image(systemName: "crown.fill")
                                    .font(.system(size: 48, weight: .bold))
                                    .foregroundStyle(.white)
                            }

                            VStack(spacing: 8) {
                                Text("Your BJJ プレミアム")
                                    .font(.app(size: 28, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)

                                Text("すべての機能を解放して、\n柔術の上達をサポート")
                                    .font(.app(size: 15, weight: .medium))
                                    .foregroundStyle(theme.textMuted)
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.top, 20)

                        // Features
                        VStack(spacing: 16) {
                            PremiumFeatureRow(
                                icon: "infinity",
                                title: "技登録数の上限解除",
                                description: "無料版の10件制限を解除",
                                theme: theme
                            )

                            PremiumFeatureRow(
                                icon: "note.text",
                                title: "日記登録数の上限解除",
                                description: "無料版の50件制限を解除",
                                theme: theme
                            )

                            PremiumFeatureRow(
                                icon: "sparkles",
                                title: "広告非表示",
                                description: "快適な練習記録体験",
                                theme: theme
                            )

                            PremiumFeatureRow(
                                icon: "gift.fill",
                                title: "今後の新機能",
                                description: "追加費用なしで新機能を利用可能",
                                theme: theme
                            )
                        }
                        .padding(.horizontal, 20)

                        // Pricing
                        VStack(spacing: 16) {
                            Text("料金プラン")
                                .font(.app(size: 20, weight: .bold))
                                .foregroundStyle(theme.textPrimary)

                            PricingPicker(
                                selectedPlan: $selectedPlan,
                                theme: theme,
                                priceText: { premiumManager.priceText(for: $0) }
                            )
                        }
                        .padding(.horizontal, 20)

                        // CTA Button
                        Button(action: {
                            Task {
                                isPurchasing = true
                                let success = await premiumManager.purchase(plan: selectedPlan)
                                isPurchasing = false
                                if success {
                                    dismiss()
                                } else if let message = premiumManager.lastErrorMessage {
                                    purchaseErrorMessage = message
                                    showPurchaseError = true
                                }
                            }
                        }) {
                            let priceText = premiumManager.priceText(for: selectedPlan)
                            Text(isPurchasing ? "処理中..." : "\(selectedPlan.title)\(priceText)で登録")
                                .font(.app(size: 17, weight: .bold))
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 18)
                                .background(
                                    LinearGradient(
                                        colors: [
                                            Color(hex: "#fbbf24"),
                                            Color(hex: "#f59e0b")
                                        ],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                .shadow(color: Color(hex: "#fbbf24").opacity(0.4), radius: 12, x: 0, y: 6)
                        }
                        .padding(.horizontal, 20)
                        .disabled(isPurchasing)

                        // Terms
                        VStack(spacing: 8) {
                            Text("登録すると利用規約とプライバシーポリシーに同意したことになります")
                                .font(.caption(11, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                                .multilineTextAlignment(.center)

                            HStack(spacing: 16) {
                                Button("利用規約") {
                                    showTerms = true
                                }
                                .font(.caption(12, weight: .semibold))
                                .foregroundStyle(theme.primary)

                                Button("プライバシーポリシー") {
                                    showPrivacyPolicy = true
                                }
                                .font(.caption(12, weight: .semibold))
                                .foregroundStyle(theme.primary)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 40)
                    }
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showPrivacyPolicy) {
                PrivacyPolicyView(theme: theme)
            }
            .sheet(isPresented: $showTerms) {
                TermsView(theme: theme)
            }
            .alert("購入エラー", isPresented: $showPurchaseError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(purchaseErrorMessage ?? "購入に失敗しました。")
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)
                            .frame(width: 32, height: 32)
                            .background(theme.card)
                            .clipShape(Circle())
                    }
                }
            }
        }
        .task {
            await premiumManager.refresh()
        }
        .onChange(of: premiumManager.lastErrorMessage) { _, newValue in
            guard let newValue else { return }
            purchaseErrorMessage = newValue
            showPurchaseError = true
        }
    }
}

private struct PricingPicker: View {
    @Binding var selectedPlan: PremiumPlan
    let theme: BeltTheme
    let priceText: (PremiumPlan) -> String

    var body: some View {
        VStack(spacing: 12) {
            ForEach(PremiumPlan.allCases, id: \.self) { plan in
                Button(action: { selectedPlan = plan }) {
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 8) {
                                Text(plan.title)
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                                if plan == .yearly {
                                    Text("おすすめ")
                                        .font(.app(size: 10, weight: .bold))
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 2)
                                        .background(Color(hex: "#f59e0b"))
                                        .clipShape(Capsule())
                                }
                            }
                            Text(plan.subtitle)
                                .font(.app(size: 12, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }

                        Spacer()

                        Text(priceText(plan))
                            .font(.app(size: 16, weight: .bold))
                            .foregroundStyle(theme.textPrimary)

                        ZStack {
                            Circle()
                                .stroke(selectedPlan == plan ? theme.primary : theme.cardBorder, lineWidth: 2)
                                .frame(width: 20, height: 20)
                            if selectedPlan == plan {
                                Circle()
                                    .fill(theme.primary)
                                    .frame(width: 10, height: 10)
                            }
                        }
                    }
                    .padding(14)
                    .background(selectedPlan == plan ? theme.primary.opacity(0.08) : theme.card)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(selectedPlan == plan ? theme.primary.opacity(0.3) : theme.cardBorder, lineWidth: 1)
                    )
                }
                .pressEffect()
            }
        }
    }
}

private struct PremiumFeatureRow: View {
    let icon: String
    let title: String
    let description: String
    let theme: BeltTheme

    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(Color(hex: "#fbbf24").opacity(0.15))
                    .frame(width: 50, height: 50)

                Image(systemName: icon)
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(Color(hex: "#f59e0b"))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.body(16, weight: .bold))
                    .foregroundStyle(theme.textPrimary)

                Text(description)
                    .font(.caption(13, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }

            Spacer()
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}

private struct PricingCard: View {
    let period: String
    let price: String
    let description: String
    var isRecommended: Bool = false
    let theme: BeltTheme

    var body: some View {
        VStack(spacing: 12) {
            if isRecommended {
                Text("おすすめ")
                    .font(.caption(11, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 4)
                    .background(Color(hex: "#f59e0b"))
                    .clipShape(Capsule())
            }

            VStack(spacing: 8) {
                Text(period)
                    .font(.body(14, weight: .semibold))
                    .foregroundStyle(theme.textMuted)

                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(price)
                        .font(.display(32, weight: .heavy))
                        .foregroundStyle(theme.textPrimary)

                    Text(period == "月額" ? "/月" : "/年")
                        .font(.body(16, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                }

                Text(description)
                    .font(.caption(12, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
        .padding(.horizontal, 20)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(
                    isRecommended ? Color(hex: "#fbbf24") : theme.cardBorder,
                    lineWidth: isRecommended ? 2 : 1
                )
        )
        .shadow(
            color: isRecommended ? Color(hex: "#fbbf24").opacity(0.2) : .clear,
            radius: 12,
            x: 0,
            y: 6
        )
    }
}

private struct LoginSectionView: View {
    @Binding var email: String
    @Binding var password: String
    @ObservedObject var viewModel: AppViewModel
    let theme: BeltTheme
    let onShowSignUp: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("ログイン")
                .font(.title(15, weight: .bold))
                .foregroundStyle(theme.textPrimary)

            Text("データをバックアップ・同期するにはログインしてください")
                .font(.caption(12, weight: .medium))
                .foregroundStyle(theme.textMuted)

            // Email field
            VStack(alignment: .leading, spacing: 8) {
                Text("メールアドレス")
                    .font(.caption(11))
                    .foregroundStyle(theme.textMuted)
                    .textCase(.uppercase)
                    .tracking(0.5)

                TextField("", text: $email)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .keyboardType(.emailAddress)
                    .padding(14)
                    .background(theme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1.5)
                    )
            }

            // Password field
            VStack(alignment: .leading, spacing: 8) {
                Text("パスワード")
                    .font(.caption(11))
                    .foregroundStyle(theme.textMuted)
                    .textCase(.uppercase)
                    .tracking(0.5)

                SecureField("", text: $password)
                    .padding(14)
                    .background(theme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1.5)
                    )
            }

            // Error messages
            if let error = viewModel.authErrorMessage {
                Text(error)
                    .font(.caption(12))
                    .foregroundStyle(Color.red)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }

            // Login button
            Button(action: {
                Task {
                    await viewModel.signIn(email: email, password: password)
                }
            }) {
                ZStack {
                    if viewModel.isAuthenticating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        HStack(spacing: 8) {
                            Image(systemName: "person.circle.fill")
                                .font(.app(size: 14, weight: .semibold))
                            Text("ログイン")
                                .font(.title(15, weight: .bold))
                        }
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .foregroundStyle(.white)
                .background(theme.gradient)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .glowEffect(color: theme.primary.opacity(email.isEmpty || password.isEmpty ? 0 : 0.3), radius: 12)
            }
            .disabled(email.isEmpty || password.isEmpty || viewModel.isAuthenticating)

            // Sign up link
            Button(action: {
                onShowSignUp()
            }) {
                Text("新規登録はこちら")
                    .font(.caption(12, weight: .semibold))
                    .foregroundStyle(theme.textMuted)
                    .padding(.vertical, 4)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
        .padding(.horizontal, 20)
    }
}
