import Foundation
import CoreData

class PersistenceController {
    static let shared = PersistenceController()

    let container: NSPersistentContainer

    private init() {
        container = NSPersistentContainer(name: "YourBJJ")

        // Create the Core Data model programmatically
        let model = NSManagedObjectModel()

        // Technique Entity
        let techniqueEntity = NSEntityDescription()
        techniqueEntity.name = "TechniqueEntity"
        techniqueEntity.managedObjectClassName = NSStringFromClass(TechniqueEntity.self)

        let techniqueAttributes: [(String, NSAttributeType, Bool)] = [
            ("id", .stringAttributeType, false),
            ("userId", .stringAttributeType, true),
            ("name", .stringAttributeType, false),
            ("nameEn", .stringAttributeType, true),
            ("category", .stringAttributeType, true),
            ("techniqueType", .stringAttributeType, true),
            ("descriptionText", .stringAttributeType, true),
            ("videoUrl", .stringAttributeType, true),
            ("videoType", .stringAttributeType, true),
            ("createdAt", .dateAttributeType, false),
            ("updatedAt", .dateAttributeType, false),
            ("syncedAt", .dateAttributeType, true),
            ("isDeleted", .booleanAttributeType, false)
        ]

        techniqueEntity.properties = techniqueAttributes.map { name, type, optional in
            let attribute = NSAttributeDescription()
            attribute.name = name
            attribute.attributeType = type
            attribute.isOptional = optional
            if name == "isDeleted" {
                attribute.defaultValue = false
            }
            return attribute
        }

        // Flow Entity
        let flowEntity = NSEntityDescription()
        flowEntity.name = "FlowEntity"
        flowEntity.managedObjectClassName = NSStringFromClass(FlowEntity.self)

        let flowAttributes: [(String, NSAttributeType, Bool)] = [
            ("id", .stringAttributeType, false),
            ("userId", .stringAttributeType, true),
            ("name", .stringAttributeType, false),
            ("descriptionText", .stringAttributeType, true),
            ("flowDataJson", .stringAttributeType, true),
            ("isFavorite", .booleanAttributeType, false),
            ("createdAt", .dateAttributeType, false),
            ("updatedAt", .dateAttributeType, false),
            ("syncedAt", .dateAttributeType, true),
            ("isDeleted", .booleanAttributeType, false)
        ]

        flowEntity.properties = flowAttributes.map { name, type, optional in
            let attribute = NSAttributeDescription()
            attribute.name = name
            attribute.attributeType = type
            attribute.isOptional = optional
            if name == "isDeleted" || name == "isFavorite" {
                attribute.defaultValue = false
            }
            return attribute
        }

        // TrainingLog Entity
        let logEntity = NSEntityDescription()
        logEntity.name = "TrainingLogEntity"
        logEntity.managedObjectClassName = NSStringFromClass(TrainingLogEntity.self)

        let logAttributes: [(String, NSAttributeType, Bool)] = [
            ("id", .stringAttributeType, false),
            ("userId", .stringAttributeType, true),
            ("trainingDate", .dateAttributeType, false),
            ("startTime", .stringAttributeType, true),
            ("endTime", .stringAttributeType, true),
            ("durationMinutes", .integer32AttributeType, false),
            ("notes", .stringAttributeType, true),
            ("content", .stringAttributeType, true),
            ("condition", .integer16AttributeType, false),
            ("sparringRounds", .integer16AttributeType, false),
            ("createdAt", .dateAttributeType, false),
            ("updatedAt", .dateAttributeType, false),
            ("syncedAt", .dateAttributeType, true),
            ("isDeleted", .booleanAttributeType, false),
            ("techniqueIds", .stringAttributeType, true),
            ("flowIds", .stringAttributeType, true)
        ]

        logEntity.properties = logAttributes.map { name, type, optional in
            let attribute = NSAttributeDescription()
            attribute.name = name
            attribute.attributeType = type
            attribute.isOptional = optional
            if name == "isDeleted" {
                attribute.defaultValue = false
            } else if name == "durationMinutes" || name == "condition" || name == "sparringRounds" {
                attribute.defaultValue = 0
            }
            return attribute
        }

        // Profile Entity
        let profileEntity = NSEntityDescription()
        profileEntity.name = "ProfileEntity"
        profileEntity.managedObjectClassName = NSStringFromClass(ProfileEntity.self)

        let profileAttributes: [(String, NSAttributeType, Bool)] = [
            ("id", .stringAttributeType, false),
            ("displayName", .stringAttributeType, true),
            ("avatarUrl", .stringAttributeType, true),
            ("beltColor", .stringAttributeType, true),
            ("beltStripes", .integer16AttributeType, false),
            ("bjjStartDate", .stringAttributeType, true),
            ("bio", .stringAttributeType, true),
            ("isPremium", .booleanAttributeType, false),
            ("premiumUntil", .stringAttributeType, true),
            ("createdAt", .dateAttributeType, false),
            ("updatedAt", .dateAttributeType, false),
            ("syncedAt", .dateAttributeType, true)
        ]

        profileEntity.properties = profileAttributes.map { name, type, optional in
            let attribute = NSAttributeDescription()
            attribute.name = name
            attribute.attributeType = type
            attribute.isOptional = optional
            if name == "isPremium" {
                attribute.defaultValue = false
            } else if name == "beltStripes" {
                attribute.defaultValue = 0
            }
            return attribute
        }

        model.entities = [techniqueEntity, flowEntity, logEntity, profileEntity]

        // Replace the container's model
        let description = NSPersistentStoreDescription()
        description.type = NSSQLiteStoreType
        description.shouldMigrateStoreAutomatically = true
        description.shouldInferMappingModelAutomatically = true

        let newContainer = NSPersistentContainer(name: "YourBJJ", managedObjectModel: model)
        newContainer.persistentStoreDescriptions = [description]

        newContainer.loadPersistentStores { _, error in
            if let error = error {
                fatalError("Failed to load Core Data stack: \(error)")
            }
        }

        newContainer.viewContext.automaticallyMergesChangesFromParent = true
        newContainer.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

        container = newContainer
    }

    var context: NSManagedObjectContext {
        container.viewContext
    }

    func save() {
        let context = container.viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                print("Failed to save context: \(error)")
            }
        }
    }
}
