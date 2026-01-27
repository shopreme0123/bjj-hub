import Foundation

struct TrainingLogForm {
    let trainingDate: String
    let startTime: String?
    let endTime: String?
    let durationMinutes: Int?
    let content: String?
    let notes: String?
    let condition: Int?
    let videoUrls: [String]?

    var payload: [String: Any] {
        var payload: [String: Any] = [
            "training_date": trainingDate
        ]
        if let startTime { payload["start_time"] = startTime }
        if let endTime { payload["end_time"] = endTime }
        if let durationMinutes { payload["duration_minutes"] = durationMinutes }
        if let content { payload["content"] = content }
        if let notes { payload["notes"] = notes }
        if let condition { payload["condition"] = condition }
        if let videoUrls { payload["video_urls"] = videoUrls }
        return payload
    }
}
