import Foundation

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

    private var profileFile: URL {
        documentsDirectory.appendingPathComponent("profile.json")
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
        try saveToFile(profile, to: profileFile)
    }

    func fetchProfile(userId: String) async throws -> Profile? {
        guard fileManager.fileExists(atPath: profileFile.path) else {
            return nil
        }

        let profile: Profile = try loadFromFile(profileFile)

        return profile.id == userId ? profile : nil
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
