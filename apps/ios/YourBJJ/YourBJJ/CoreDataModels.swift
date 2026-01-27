import Foundation
import CoreData

// MARK: - Core Data Entities

@objc(TechniqueEntity)
public class TechniqueEntity: NSManagedObject {
    @NSManaged public var id: String
    @NSManaged public var userId: String?
    @NSManaged public var name: String
    @NSManaged public var nameEn: String?
    @NSManaged public var category: String?
    @NSManaged public var techniqueType: String?
    @NSManaged public var descriptionText: String?
    @NSManaged public var videoUrl: String?
    @NSManaged public var videoType: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var syncedAt: Date?
    @NSManaged public var isDeleted: Bool
}

extension TechniqueEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<TechniqueEntity> {
        return NSFetchRequest<TechniqueEntity>(entityName: "TechniqueEntity")
    }

    func toTechnique() -> Technique {
        Technique(
            id: id,
            userId: userId ?? "",
            name: name,
            nameEn: nameEn,
            categoryId: nil,
            category: category,
            techniqueType: techniqueType,
            description: descriptionText,
            videoUrl: videoUrl,
            videoType: videoType,
            tags: nil,
            difficulty: nil,
            masteryLevel: nil,
            createdAt: ISO8601DateFormatter().string(from: createdAt),
            updatedAt: ISO8601DateFormatter().string(from: updatedAt)
        )
    }

    func updateFrom(technique: Technique) {
        name = technique.name
        nameEn = technique.nameEn
        category = technique.category
        techniqueType = technique.techniqueType
        descriptionText = technique.description
        videoUrl = technique.videoUrl
        videoType = technique.videoType
        updatedAt = Date()
    }
}

@objc(FlowEntity)
public class FlowEntity: NSManagedObject {
    @NSManaged public var id: String
    @NSManaged public var userId: String?
    @NSManaged public var name: String
    @NSManaged public var descriptionText: String?
    @NSManaged public var flowDataJson: String?
    @NSManaged public var isFavorite: Bool
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var syncedAt: Date?
    @NSManaged public var isDeleted: Bool
}

extension FlowEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<FlowEntity> {
        return NSFetchRequest<FlowEntity>(entityName: "FlowEntity")
    }

    func toFlow() -> Flow? {
        var flowData: FlowData?
        if let json = flowDataJson,
           let data = json.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(FlowData.self, from: data) {
            flowData = decoded
        }

        return Flow(
            id: id,
            userId: userId ?? "",
            name: name,
            description: descriptionText,
            tags: nil,
            flowData: flowData,
            isFavorite: isFavorite,
            createdAt: ISO8601DateFormatter().string(from: createdAt),
            updatedAt: ISO8601DateFormatter().string(from: updatedAt)
        )
    }

    func updateFrom(flow: Flow) {
        name = flow.name
        descriptionText = flow.description
        isFavorite = flow.isFavorite ?? false

        if let flowData = flow.flowData,
           let encoded = try? JSONEncoder().encode(flowData),
           let json = String(data: encoded, encoding: .utf8) {
            flowDataJson = json
        }

        updatedAt = Date()
    }
}

@objc(TrainingLogEntity)
public class TrainingLogEntity: NSManagedObject {
    @NSManaged public var id: String
    @NSManaged public var userId: String?
    @NSManaged public var trainingDate: Date
    @NSManaged public var startTime: String?
    @NSManaged public var endTime: String?
    @NSManaged public var durationMinutes: Int32
    @NSManaged public var notes: String?
    @NSManaged public var content: String?
    @NSManaged public var condition: Int16
    @NSManaged public var sparringRounds: Int16
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var syncedAt: Date?
    @NSManaged public var isDeleted: Bool
    @NSManaged public var techniqueIds: String? // JSON array of technique IDs
    @NSManaged public var flowIds: String? // JSON array of flow IDs
}

extension TrainingLogEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<TrainingLogEntity> {
        return NSFetchRequest<TrainingLogEntity>(entityName: "TrainingLogEntity")
    }

    func toTrainingLog(techniques: [Technique]?, flows: [Flow]?) -> TrainingLog {
        let dateFormatter = ISO8601DateFormatter()
        let dateOnlyFormatter = DateFormatter()
        dateOnlyFormatter.dateFormat = "yyyy-MM-dd"

        return TrainingLog(
            id: id,
            userId: userId ?? "",
            trainingDate: dateOnlyFormatter.string(from: trainingDate),
            startTime: startTime,
            endTime: endTime,
            durationMinutes: durationMinutes > 0 ? Int(durationMinutes) : nil,
            notes: notes,
            content: content,
            condition: condition > 0 ? Int(condition) : nil,
            sparringRounds: sparringRounds > 0 ? Int(sparringRounds) : nil,
            createdAt: dateFormatter.string(from: createdAt),
            updatedAt: dateFormatter.string(from: updatedAt),
            techniques: techniques,
            flows: flows,
            videoUrls: nil
        )
    }

    func updateFrom(log: TrainingLog) {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        if let date = dateFormatter.date(from: log.trainingDate) {
            trainingDate = date
        }

        startTime = log.startTime
        endTime = log.endTime
        durationMinutes = Int32(log.durationMinutes ?? 0)
        notes = log.notes
        content = log.content
        condition = Int16(log.condition ?? 0)
        sparringRounds = Int16(log.sparringRounds ?? 0)
        updatedAt = Date()
    }
}

@objc(ProfileEntity)
public class ProfileEntity: NSManagedObject {
    @NSManaged public var id: String
    @NSManaged public var displayName: String?
    @NSManaged public var avatarUrl: String?
    @NSManaged public var beltColor: String?
    @NSManaged public var beltStripes: Int16
    @NSManaged public var bjjStartDate: String?
    @NSManaged public var bio: String?
    @NSManaged public var isPremium: Bool
    @NSManaged public var premiumUntil: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
    @NSManaged public var syncedAt: Date?
}

extension ProfileEntity {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<ProfileEntity> {
        return NSFetchRequest<ProfileEntity>(entityName: "ProfileEntity")
    }

    func toProfile() -> Profile {
        let dateFormatter = ISO8601DateFormatter()

        return Profile(
            id: id,
            displayName: displayName,
            avatarUrl: avatarUrl,
            beltColor: beltColor.flatMap { BeltColor(rawValue: $0) },
            beltStripes: beltStripes > 0 ? Int(beltStripes) : nil,
            bjjStartDate: bjjStartDate,
            bio: bio,
            isPremium: isPremium,
            premiumUntil: premiumUntil,
            createdAt: dateFormatter.string(from: createdAt),
            updatedAt: dateFormatter.string(from: updatedAt)
        )
    }

    func updateFrom(profile: Profile) {
        displayName = profile.displayName
        avatarUrl = profile.avatarUrl
        beltColor = profile.beltColor?.rawValue
        beltStripes = Int16(profile.beltStripes ?? 0)
        bjjStartDate = profile.bjjStartDate
        bio = profile.bio
        isPremium = profile.isPremium ?? false
        premiumUntil = profile.premiumUntil
        updatedAt = Date()
    }
}
