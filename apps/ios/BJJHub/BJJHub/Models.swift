import Foundation

enum BeltColor: String, Codable, CaseIterable {
    case white
    case blue
    case purple
    case brown
    case black
}

struct TechniqueCategory: Identifiable, Codable, Equatable {
    let id: String
    let name: String
    let icon: String

    static let defaultCategories: [TechniqueCategory] = [
        TechniqueCategory(id: "guard", name: "ガード（ボトム）", icon: "🛡️"),
        TechniqueCategory(id: "top", name: "トップポジション", icon: "⬆️"),
        TechniqueCategory(id: "stand", name: "スタンド", icon: "🧍"),
        TechniqueCategory(id: "leglock", name: "レッグロック", icon: "🦵"),
        TechniqueCategory(id: "turtle", name: "タートル", icon: "🐢"),
        TechniqueCategory(id: "back", name: "バック", icon: "🔙")
    ]
}

struct Profile: Identifiable, Codable {
    let id: String
    let displayName: String?
    let avatarUrl: String?
    let beltColor: BeltColor?
    let beltStripes: Int?
    let bjjStartDate: String?
    let bio: String?
    let isPremium: Bool?
    let premiumUntil: String?
    let createdAt: String?
    let updatedAt: String?
}

struct Technique: Identifiable, Codable {
    let id: String
    let userId: String
    let name: String
    let nameEn: String?
    let categoryId: String?
    let category: String?
    let techniqueType: String?
    let description: String?
    let videoUrl: String?
    let videoType: String?
    let tags: [String]?
    let difficulty: String?
    let masteryLevel: String?
    let createdAt: String?
    let updatedAt: String?
}

enum MasteryLevel: String, CaseIterable {
    case learning
    case learned
    case favorite

    var label: String {
        switch self {
        case .learning: return "学習中"
        case .learned: return "習得"
        case .favorite: return "得意技"
        }
    }
}

struct Flow: Identifiable, Codable {
    let id: String
    let userId: String
    let name: String
    let description: String?
    let tags: [String]?
    let flowData: FlowData?
    let isFavorite: Bool?
    let createdAt: String?
    let updatedAt: String?
}

struct FlowData: Codable {
    var nodes: [FlowNodeData]
    var edges: [FlowEdgeData]

    init(nodes: [FlowNodeData], edges: [FlowEdgeData]) {
        self.nodes = nodes
        self.edges = edges
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        if let nodes = try? container.decode([FlowNodeData].self, forKey: .nodes),
           let edges = try? container.decode([FlowEdgeData].self, forKey: .edges) {
            self.nodes = nodes
            self.edges = edges
            return
        }

        let rawNodes = (try? container.decode([FlowNodeRaw].self, forKey: .nodes)) ?? []
        let rawEdges = (try? container.decode([FlowEdgeRaw].self, forKey: .edges)) ?? []
        self.nodes = rawNodes.map { $0.asNodeData() }
        self.edges = rawEdges.map { $0.asEdgeData() }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        let payloadNodes = nodes.map { $0.toPayload() }
        let payloadEdges = edges.map { $0.toPayload() }
        try container.encode(payloadNodes, forKey: .nodes)
        try container.encode(payloadEdges, forKey: .edges)
    }

    private enum CodingKeys: String, CodingKey {
        case nodes
        case edges
    }
}

struct FlowNodePayload: Codable {
    let id: String
    let type: String?
    let position: FlowNodePosition
    let data: FlowNodePayloadData
}

struct FlowNodePosition: Codable {
    let x: Double
    let y: Double
}

struct FlowNodePayloadData: Codable {
    let label: String?
    let type: String?
    let rawType: String?
    let techniqueId: String?
}

struct FlowEdgePayload: Codable {
    let id: String
    let source: String
    let target: String
    let type: String?
    let data: FlowEdgePayloadData?
}

struct FlowEdgePayloadData: Codable {
    let label: String?
    let edgeType: String?
}

struct FlowNodeRaw: Decodable {
    let id: String
    let type: String?
    let position: FlowNodePosition?
    let positionX: Double?
    let positionY: Double?
    let data: FlowNodeRawData?

    func asNodeData() -> FlowNodeData {
        let x = position?.x ?? positionX ?? 160
        let y = position?.y ?? positionY ?? 200
        let label = data?.label
        let rawType = data?.rawType ?? data?.type ?? type ?? "technique"
        return FlowNodeData(
            id: id,
            type: rawType,
            label: label,
            techniqueId: data?.techniqueId,
            positionX: x,
            positionY: y
        )
    }
}

struct FlowNodeRawData: Decodable {
    let label: String?
    let type: String?
    let rawType: String?
    let techniqueId: String?
}

struct FlowEdgeRaw: Decodable {
    let id: String
    let source: String
    let target: String
    let label: String?
    let type: String?
    let data: FlowEdgeRawData?

    func asEdgeData() -> FlowEdgeData {
        let edgeType = data?.edgeType ?? type ?? "default"
        let labelValue = data?.label ?? label
        return FlowEdgeData(
            id: id,
            source: source,
            target: target,
            label: labelValue,
            edgeType: edgeType
        )
    }
}

struct FlowEdgeRawData: Decodable {
    let label: String?
    let edgeType: String?
}

struct FlowNodeData: Identifiable, Codable {
    let id: String
    var type: String
    var label: String?
    var techniqueId: String?
    var positionX: Double
    var positionY: Double

    func toPayload() -> FlowNodePayload {
        FlowNodePayload(
            id: id,
            type: "technique",
            position: FlowNodePosition(x: positionX, y: positionY),
            data: FlowNodePayloadData(
                label: label,
                type: type,
                rawType: type,
                techniqueId: techniqueId
            )
        )
    }
}

struct FlowEdgeData: Identifiable, Codable {
    let id: String
    var source: String
    var target: String
    var label: String?
    var edgeType: String

    func toPayload() -> FlowEdgePayload {
        FlowEdgePayload(
            id: id,
            source: source,
            target: target,
            type: "labeled",
            data: FlowEdgePayloadData(label: label, edgeType: edgeType)
        )
    }
}

struct TrainingLog: Identifiable, Codable {
    let id: String
    let userId: String
    let trainingDate: String
    let startTime: String?
    let endTime: String?
    let durationMinutes: Int?
    let notes: String?
    let content: String?
    let condition: Int?
    let sparringRounds: Int?
    let createdAt: String?
    let updatedAt: String?
    let techniques: [Technique]?
    let flows: [Flow]?
    let videoUrls: [String]?
}

struct Group: Identifiable, Codable {
    let id: String
    let name: String
    let description: String?
    let iconUrl: String?
    let inviteCode: String?
    let createdBy: String
    let createdAt: String?
    let updatedAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case iconUrl = "icon_url"
        case inviteCode = "invite_code"
        case createdBy = "created_by"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct GroupMember: Identifiable, Codable {
    let id: String
    let groupId: String
    let userId: String
    let role: String
    let joinedAt: String
    let user: Profile?

    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case userId = "user_id"
        case role
        case joinedAt = "joined_at"
        case user
    }
}

struct SharedTechnique: Identifiable, Codable {
    let id: String
    let name: String
    let nameEn: String?
    let category: String?
    let techniqueType: String?
    let description: String?
    let videoUrl: String?
    let videoType: String?
    let tags: [String]?
    let difficulty: String?
    let masteryLevel: String?
}

struct SharedFlow: Identifiable, Codable {
    let id: String
    let groupId: String
    let createdBy: String
    let name: String
    let flowData: FlowData
    let techniqueIds: [String]
    let expiresAt: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case createdBy = "created_by"
        case name
        case flowData = "flow_data"
        case techniqueIds = "technique_ids"
        case expiresAt = "expires_at"
        case createdAt = "created_at"
    }
}

struct SharedTechniqueEntry: Identifiable, Codable {
    let id: String
    let groupId: String
    let createdBy: String
    let sourceTechniqueId: String?
    let technique: SharedTechnique
    let expiresAt: String?
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id
        case groupId = "group_id"
        case createdBy = "created_by"
        case sourceTechniqueId = "source_technique_id"
        case technique
        case expiresAt = "expires_at"
        case createdAt = "created_at"
    }
}

// MARK: - Extensions

extension Technique {
    var techniqueTypeJapanese: String {
        guard let type = techniqueType else { return "" }
        switch type.lowercased() {
        case "guard": return "ガード"
        case "pass": return "パス"
        case "submission": return "サブミッション"
        case "sweep": return "スイープ"
        case "escape": return "エスケープ"
        case "takedown": return "テイクダウン"
        case "throw": return "投げ技"
        case "position": return "ポジション"
        case "defense": return "ディフェンス"
        case "transition": return "トランジション"
        case "other": return "その他"
        default: return type
        }
    }
}

// MARK: - Simple Local Storage

/// Simple JSON-based local storage that doesn't require CoreData setup
class SimpleLocalStorage {
    static let shared = SimpleLocalStorage()

    private let fileManager = FileManager.default
    private let documentsDirectory: URL

    private init() {
        documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    // MARK: - File Paths

    private var techniquesFile: URL {
        documentsDirectory.appendingPathComponent("techniques.json")
    }

    private var flowsFile: URL {
        documentsDirectory.appendingPathComponent("flows.json")
    }

    private var trainingLogsFile: URL {
        documentsDirectory.appendingPathComponent("training_logs.json")
    }

    private func profileFile(for userId: String) -> URL {
        documentsDirectory.appendingPathComponent("profile_\(userId).json")
    }

    // MARK: - Technique Operations

    func saveTechnique(_ technique: Technique) async throws {
        var techniques = try await fetchTechniques()
        if let index = techniques.firstIndex(where: { $0.id == technique.id }) {
            techniques[index] = technique
        } else {
            techniques.append(technique)
        }
        try saveToFile(techniques, to: techniquesFile)
    }

    func fetchTechniques(userId: String? = nil) async throws -> [Technique] {
        guard fileManager.fileExists(atPath: techniquesFile.path) else {
            return []
        }

        let techniques: [Technique] = try loadFromFile(techniquesFile)

        if let userId = userId {
            return techniques.filter { $0.userId == userId }
        }

        return techniques
    }

    func deleteTechnique(id: String) async throws {
        var techniques = try await fetchTechniques()
        techniques.removeAll { $0.id == id }
        try saveToFile(techniques, to: techniquesFile)
    }

    // MARK: - Flow Operations

    func saveFlow(_ flow: Flow) async throws {
        var flows = try await fetchFlows()
        if let index = flows.firstIndex(where: { $0.id == flow.id }) {
            flows[index] = flow
        } else {
            flows.append(flow)
        }
        try saveToFile(flows, to: flowsFile)
    }

    func fetchFlows(userId: String? = nil) async throws -> [Flow] {
        guard fileManager.fileExists(atPath: flowsFile.path) else {
            return []
        }

        let flows: [Flow] = try loadFromFile(flowsFile)

        if let userId = userId {
            return flows.filter { $0.userId == userId }
        }

        return flows
    }

    func deleteFlow(id: String) async throws {
        var flows = try await fetchFlows()
        flows.removeAll { $0.id == id }
        try saveToFile(flows, to: flowsFile)
    }

    // MARK: - Training Log Operations

    func saveTrainingLog(_ log: TrainingLog) async throws {
        var logs = try await fetchTrainingLogs()
        if let index = logs.firstIndex(where: { $0.id == log.id }) {
            logs[index] = log
        } else {
            logs.append(log)
        }
        try saveToFile(logs, to: trainingLogsFile)
    }

    func fetchTrainingLogs(userId: String? = nil) async throws -> [TrainingLog] {
        guard fileManager.fileExists(atPath: trainingLogsFile.path) else {
            return []
        }

        let logs: [TrainingLog] = try loadFromFile(trainingLogsFile)

        if let userId = userId {
            return logs.filter { $0.userId == userId }
        }

        return logs
    }

    func deleteTrainingLog(id: String) async throws {
        var logs = try await fetchTrainingLogs()
        logs.removeAll { $0.id == id }
        try saveToFile(logs, to: trainingLogsFile)
    }

    // MARK: - Profile Operations

    func saveProfile(_ profile: Profile) async throws {
        let file = profileFile(for: profile.id)
        try saveToFile(profile, to: file)
        print("✅ [DEBUG] Profile saved to: \(file.path)")
    }

    func fetchProfile(userId: String) async throws -> Profile? {
        let file = profileFile(for: userId)
        guard fileManager.fileExists(atPath: file.path) else {
            print("⚠️ [DEBUG] Profile file not found: \(file.path)")
            return nil
        }

        let profile: Profile = try loadFromFile(file)
        print("✅ [DEBUG] Profile loaded from: \(file.path)")
        return profile
    }

    // MARK: - Helper Methods

    private func saveToFile<T: Encodable>(_ data: T, to url: URL) throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        let jsonData = try encoder.encode(data)
        try jsonData.write(to: url, options: .atomic)
    }

    private func loadFromFile<T: Decodable>(_ url: URL) throws -> T {
        let data = try Data(contentsOf: url)
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(T.self, from: data)
    }

    // MARK: - Sync Support

    private var syncMetadataFile: URL {
        documentsDirectory.appendingPathComponent("sync_metadata.json")
    }

    struct SyncMetadata: Codable {
        var techniqueSyncDates: [String: Date] = [:]
        var flowSyncDates: [String: Date] = [:]
        var logSyncDates: [String: Date] = [:]
    }

    func markAsSynced(techniqueId: String) async throws {
        var metadata = try loadSyncMetadata()
        metadata.techniqueSyncDates[techniqueId] = Date()
        try saveSyncMetadata(metadata)
    }

    func fetchUnsyncedTechniques() async throws -> [Technique] {
        let techniques = try await fetchTechniques()
        let metadata = try loadSyncMetadata()

        return techniques.filter { technique in
            guard let syncDate = metadata.techniqueSyncDates[technique.id] else {
                return true // Never synced
            }

            // Check if updated after last sync
            guard let updatedAt = technique.updatedAt,
                  let updateDate = ISO8601DateFormatter().date(from: updatedAt) else {
                return false
            }

            return updateDate > syncDate
        }
    }

    private func loadSyncMetadata() throws -> SyncMetadata {
        guard fileManager.fileExists(atPath: syncMetadataFile.path) else {
            return SyncMetadata()
        }

        return try loadFromFile(syncMetadataFile)
    }

    private func saveSyncMetadata(_ metadata: SyncMetadata) throws {
        try saveToFile(metadata, to: syncMetadataFile)
    }
}
