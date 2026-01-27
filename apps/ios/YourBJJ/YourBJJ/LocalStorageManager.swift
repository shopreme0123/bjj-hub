import Foundation
import CoreData

class LocalStorageManager {
    static let shared = LocalStorageManager()
    private let persistence = PersistenceController.shared

    private init() {}

    // MARK: - Technique Operations

    func saveTechnique(_ technique: Technique) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", technique.id)

            let existing = try context.fetch(fetchRequest).first

            if let entity = existing {
                entity.updateFrom(technique: technique)
            } else {
                let entity = TechniqueEntity(context: context)
                entity.id = technique.id
                entity.userId = technique.userId
                entity.createdAt = Date()
                entity.isDeleted = false
                entity.updateFrom(technique: technique)
            }

            try context.save()
        }
    }

    func fetchTechniques(userId: String? = nil) async throws -> [Technique] {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            var predicates: [NSPredicate] = [NSPredicate(format: "isDeleted == NO")]

            if let userId = userId {
                predicates.append(NSPredicate(format: "userId == %@", userId))
            }

            fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
            fetchRequest.sortDescriptors = [NSSortDescriptor(key: "updatedAt", ascending: false)]

            let entities = try context.fetch(fetchRequest)
            return entities.map { $0.toTechnique() }
        }
    }

    func deleteTechnique(id: String) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)

            if let entity = try context.fetch(fetchRequest).first {
                entity.isDeleted = true
                entity.updatedAt = Date()
                try context.save()
            }
        }
    }

    // MARK: - Flow Operations

    func saveFlow(_ flow: Flow) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<FlowEntity> = FlowEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", flow.id)

            let existing = try context.fetch(fetchRequest).first

            if let entity = existing {
                entity.updateFrom(flow: flow)
            } else {
                let entity = FlowEntity(context: context)
                entity.id = flow.id
                entity.userId = flow.userId
                entity.createdAt = Date()
                entity.isDeleted = false
                entity.updateFrom(flow: flow)
            }

            try context.save()
        }
    }

    func fetchFlows(userId: String? = nil) async throws -> [Flow] {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<FlowEntity> = FlowEntity.fetchRequest()
            var predicates: [NSPredicate] = [NSPredicate(format: "isDeleted == NO")]

            if let userId = userId {
                predicates.append(NSPredicate(format: "userId == %@", userId))
            }

            fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
            fetchRequest.sortDescriptors = [NSSortDescriptor(key: "updatedAt", ascending: false)]

            let entities = try context.fetch(fetchRequest)
            return entities.compactMap { $0.toFlow() }
        }
    }

    func deleteFlow(id: String) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<FlowEntity> = FlowEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)

            if let entity = try context.fetch(fetchRequest).first {
                entity.isDeleted = true
                entity.updatedAt = Date()
                try context.save()
            }
        }
    }

    // MARK: - Training Log Operations

    func saveTrainingLog(_ log: TrainingLog) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<TrainingLogEntity> = TrainingLogEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", log.id)

            let existing = try context.fetch(fetchRequest).first

            if let entity = existing {
                entity.updateFrom(log: log)

                // Store technique and flow IDs as JSON
                if let techniques = log.techniques {
                    let ids = techniques.map { $0.id }
                    if let jsonData = try? JSONEncoder().encode(ids),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        entity.techniqueIds = jsonString
                    }
                }

                if let flows = log.flows {
                    let ids = flows.map { $0.id }
                    if let jsonData = try? JSONEncoder().encode(ids),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        entity.flowIds = jsonString
                    }
                }
            } else {
                let entity = TrainingLogEntity(context: context)
                entity.id = log.id
                entity.userId = log.userId
                entity.createdAt = Date()
                entity.isDeleted = false
                entity.updateFrom(log: log)

                // Store technique and flow IDs
                if let techniques = log.techniques {
                    let ids = techniques.map { $0.id }
                    if let jsonData = try? JSONEncoder().encode(ids),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        entity.techniqueIds = jsonString
                    }
                }

                if let flows = log.flows {
                    let ids = flows.map { $0.id }
                    if let jsonData = try? JSONEncoder().encode(ids),
                       let jsonString = String(data: jsonData, encoding: .utf8) {
                        entity.flowIds = jsonString
                    }
                }
            }

            try context.save()
        }
    }

    func fetchTrainingLogs(userId: String? = nil) async throws -> [TrainingLog] {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<TrainingLogEntity> = TrainingLogEntity.fetchRequest()
            var predicates: [NSPredicate] = [NSPredicate(format: "isDeleted == NO")]

            if let userId = userId {
                predicates.append(NSPredicate(format: "userId == %@", userId))
            }

            fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
            fetchRequest.sortDescriptors = [NSSortDescriptor(key: "trainingDate", ascending: false)]

            let entities = try context.fetch(fetchRequest)

            // Load related techniques and flows
            var logs: [TrainingLog] = []
            for entity in entities {
                var techniques: [Technique]?
                var flows: [Flow]?

                // Decode technique IDs and fetch
                if let techniqueIdsJson = entity.techniqueIds,
                   let jsonData = techniqueIdsJson.data(using: .utf8),
                   let ids = try? JSONDecoder().decode([String].self, from: jsonData) {
                    techniques = try await self.fetchTechniquesByIds(ids, context: context)
                }

                // Decode flow IDs and fetch
                if let flowIdsJson = entity.flowIds,
                   let jsonData = flowIdsJson.data(using: .utf8),
                   let ids = try? JSONDecoder().decode([String].self, from: jsonData) {
                    flows = try await self.fetchFlowsByIds(ids, context: context)
                }

                logs.append(entity.toTrainingLog(techniques: techniques, flows: flows))
            }

            return logs
        }
    }

    func deleteTrainingLog(id: String) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<TrainingLogEntity> = TrainingLogEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", id)

            if let entity = try context.fetch(fetchRequest).first {
                entity.isDeleted = true
                entity.updatedAt = Date()
                try context.save()
            }
        }
    }

    // MARK: - Profile Operations

    func saveProfile(_ profile: Profile) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<ProfileEntity> = ProfileEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", profile.id)

            let existing = try context.fetch(fetchRequest).first

            if let entity = existing {
                entity.updateFrom(profile: profile)
            } else {
                let entity = ProfileEntity(context: context)
                entity.id = profile.id
                entity.createdAt = Date()
                entity.updateFrom(profile: profile)
            }

            try context.save()
        }
    }

    func fetchProfile(userId: String) async throws -> Profile? {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<ProfileEntity> = ProfileEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", userId)

            return try context.fetch(fetchRequest).first?.toProfile()
        }
    }

    // MARK: - Helper Methods

    private func fetchTechniquesByIds(_ ids: [String], context: NSManagedObjectContext) async throws -> [Technique] {
        let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id IN %@ AND isDeleted == NO", ids)
        let entities = try context.fetch(fetchRequest)
        return entities.map { $0.toTechnique() }
    }

    private func fetchFlowsByIds(_ ids: [String], context: NSManagedObjectContext) async throws -> [Flow] {
        let fetchRequest: NSFetchRequest<FlowEntity> = FlowEntity.fetchRequest()
        fetchRequest.predicate = NSPredicate(format: "id IN %@ AND isDeleted == NO", ids)
        let entities = try context.fetch(fetchRequest)
        return entities.compactMap { $0.toFlow() }
    }

    // MARK: - Sync Operations

    func markAsSynced(techniqueId: String) async throws {
        let context = persistence.context
        try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "id == %@", techniqueId)

            if let entity = try context.fetch(fetchRequest).first {
                entity.syncedAt = Date()
                try context.save()
            }
        }
    }

    func fetchUnsyncedTechniques() async throws -> [Technique] {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "syncedAt == nil OR updatedAt > syncedAt")

            let entities = try context.fetch(fetchRequest)
            return entities.map { $0.toTechnique() }
        }
    }

    func fetchDeletedTechniques() async throws -> [String] {
        let context = persistence.context
        return try await context.perform {
            let fetchRequest: NSFetchRequest<TechniqueEntity> = TechniqueEntity.fetchRequest()
            fetchRequest.predicate = NSPredicate(format: "isDeleted == YES AND (syncedAt == nil OR updatedAt > syncedAt)")

            let entities = try context.fetch(fetchRequest)
            return entities.map { $0.id }
        }
    }
}
