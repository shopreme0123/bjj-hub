import Foundation

struct TechniqueForm {
    var name: String
    var nameEn: String?
    var category: String?
    var techniqueType: String
    var description: String?
    var videoUrl: String?
    var tags: [String]?
    var masteryLevel: String?

    var payload: [String: Any] {
        var payload: [String: Any] = [
            "name": name,
            "technique_type": techniqueType,
            "video_type": "youtube"
        ]
        payload["name_en"] = nameEn
        payload["category"] = category
        payload["description"] = description
        payload["video_url"] = videoUrl
        if let tags { payload["tags"] = tags }
        if let masteryLevel { payload["mastery_level"] = masteryLevel }
        return payload
    }
}
