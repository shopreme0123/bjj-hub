import Foundation

struct SupabaseError: LocalizedError {
    let statusCode: Int
    let responseBody: String

    var errorDescription: String? {
        "Supabase error \(statusCode): \(responseBody)"
    }
}

struct SupabaseConfig {
    static let url = "https://hizjdfztqofmrivexzpy.supabase.co"
    static let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpempkZnp0cW9mbXJpdmV4enB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMTI0NDEsImV4cCI6MjA4Mjc4ODQ0MX0.HJmd4GtnPSa1W6lCo68krs5LyeFvJa3mAM198vMfH0k"

    static var isConfigured: Bool {
        !url.contains("<") && !anonKey.contains("<")
    }
}

final class SupabaseService {
    private let baseURL: URL
    private let anonKey: String

    init(url: String = SupabaseConfig.url, anonKey: String = SupabaseConfig.anonKey) {
        self.baseURL = URL(string: url) ?? URL(string: "https://invalid.local")!
        self.anonKey = anonKey
    }

    func fetchProfile(userId: String, accessToken: String?) async throws -> Profile? {
        let profiles: [Profile] = try await fetch(table: "profiles", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "id", value: "eq.\(userId)")
        ], accessToken: accessToken)
        return profiles.first
    }

    func fetchProfiles(userIds: [String], accessToken: String?) async throws -> [Profile] {
        let trimmedIds = userIds.filter { !$0.isEmpty }
        guard !trimmedIds.isEmpty else { return [] }
        let ids = trimmedIds.joined(separator: ",")
        return try await fetch(table: "profiles", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "id", value: "in.(\(ids))")
        ], accessToken: accessToken)
    }

    func fetchTechniques(userId: String, accessToken: String?) async throws -> [Technique] {
        try await fetch(table: "techniques", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ], accessToken: accessToken)
    }

    func fetchFlows(userId: String, accessToken: String?) async throws -> [Flow] {
        try await fetch(table: "flows", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ], accessToken: accessToken)
    }

    func fetchTrainingLogs(userId: String, accessToken: String?) async throws -> [TrainingLog] {
        try await fetch(table: "training_logs", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "order", value: "training_date.desc")
        ], accessToken: accessToken)
    }

    func updateProfile(userId: String, accessToken: String?, updates: [String: Any]) async throws {
        guard let url = URL(string: "rest/v1/profiles?id=eq.\(userId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: updates, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }
    }

    func createTechnique(userId: String, accessToken: String?, payload: [String: Any]) async throws -> Technique {
        guard let url = URL(string: "rest/v1/techniques", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var body = payload
        body["user_id"] = userId
        body.removeValue(forKey: "video_type")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        request.setValue("application/vnd.pgrst.object+json", forHTTPHeaderField: "Accept")
        request.setValue("application/vnd.pgrst.object+json", forHTTPHeaderField: "Accept")

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let techniques = try decoder.decode([Technique].self, from: data)
        guard let technique = techniques.first else {
            throw URLError(.cannotParseResponse)
        }
        return technique
    }

    func updateTechnique(techniqueId: String, accessToken: String?, updates: [String: Any]) async throws {
        guard let url = URL(string: "rest/v1/techniques?id=eq.\(techniqueId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        print("🌐 [DEBUG] Updating technique")
        print("🌐 [DEBUG] URL: \(url.absoluteString)")
        print("🌐 [DEBUG] Has accessToken: \(accessToken != nil)")
        print("🌐 [DEBUG] Updates: \(updates)")

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            print("🌐 [DEBUG] Authorization header set")
        }
        request.setValue("representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: updates, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ [DEBUG] Response is not HTTPURLResponse")
            throw URLError(.badServerResponse)
        }

        print("🌐 [DEBUG] Response status: \(httpResponse.statusCode)")
        if let responseString = String(data: data, encoding: .utf8) {
            print("🌐 [DEBUG] Response body: \(responseString)")
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            print("❌ [DEBUG] Bad status code: \(httpResponse.statusCode)")
            throw URLError(.badServerResponse)
        }
    }

    func deleteTechnique(techniqueId: String, accessToken: String?) async throws {
        guard let url = URL(string: "rest/v1/techniques?id=eq.\(techniqueId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }
    }

    func deleteFlow(flowId: String, accessToken: String?) async throws {
        guard let url = URL(string: "rest/v1/flows?id=eq.\(flowId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }
    }

    func createTrainingLog(userId: String, accessToken: String?, payload: [String: Any]) async throws -> TrainingLog {
        guard let url = URL(string: "rest/v1/training_logs", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var body = payload
        body["user_id"] = userId

        print("📝 [DEBUG] createTrainingLog - URL: \(url)")
        print("📝 [DEBUG] createTrainingLog - Body: \(body)")

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: body, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ [DEBUG] createTrainingLog - No HTTP response")
            throw URLError(.badServerResponse)
        }

        print("📝 [DEBUG] createTrainingLog - Status code: \(httpResponse.statusCode)")

        if !(200...299).contains(httpResponse.statusCode) {
            let body = String(data: data, encoding: .utf8) ?? ""
            print("❌ [DEBUG] createTrainingLog - Error response: \(body)")
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let responseString = String(data: data, encoding: .utf8) ?? ""
        print("✅ [DEBUG] createTrainingLog - Response: \(responseString)")

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let logs = try decoder.decode([TrainingLog].self, from: data)
        guard let log = logs.first else {
            print("❌ [DEBUG] createTrainingLog - No log in response")
            throw URLError(.cannotParseResponse)
        }
        return log
    }

    func updateTrainingLog(logId: String, accessToken: String?, updates: [String: Any]) async throws {
        guard let url = URL(string: "rest/v1/training_logs?id=eq.\(logId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: updates, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }
    }

    func deleteTrainingLog(logId: String, accessToken: String?) async throws {
        guard let url = URL(string: "rest/v1/training_logs?id=eq.\(logId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func fetchGroups(userId: String, accessToken: String?) async throws -> [Group] {
        print("🔍 [DEBUG] fetchGroups - userId: \(userId)")

        let memberships: [GroupMember] = try await fetchGroupMembersRaw(
            userId: userId,
            accessToken: accessToken
        )

        print("✅ [DEBUG] fetchGroups - memberships count: \(memberships.count)")

        let groupIds = memberships.map { $0.groupId }
        if groupIds.isEmpty {
            print("⚠️ [DEBUG] fetchGroups - no group memberships found")
            return []
        }

        print("🔍 [DEBUG] fetchGroups - group IDs: \(groupIds)")

        let ids = groupIds.joined(separator: ",")
        do {
            let groups: [Group] = try await fetch(table: "groups", query: [
                URLQueryItem(name: "select", value: "*"),
                URLQueryItem(name: "id", value: "in.(\(ids))")
            ], accessToken: accessToken)
            print("✅ [DEBUG] fetchGroups - groups count: \(groups.count)")
            return groups
        } catch {
            let raw: [Group] = try await fetchGroupsRaw(groupIds: groupIds, accessToken: accessToken)
            print("✅ [DEBUG] fetchGroups - groups count (raw): \(raw.count)")
            return raw
        }
    }

    private func fetchGroupMembersRaw(userId: String, accessToken: String?) async throws -> [GroupMember] {
        var components = URLComponents(url: baseURL.appendingPathComponent("rest/v1/group_members"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "select", value: "id,group_id,user_id,role,joined_at"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "order", value: "joined_at.desc")
        ]

        guard let url = components?.url else { throw URLError(.badURL) }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let json = (try? JSONSerialization.jsonObject(with: data, options: [])) as? [[String: Any]] ?? []
        return json.compactMap { dict in
            guard let id = dict["id"] as? String else { return nil }
            guard let groupId = dict["group_id"] as? String else { return nil }
            let userId = dict["user_id"] as? String ?? ""
            let role = dict["role"] as? String ?? "member"
            let joinedAt = dict["joined_at"] as? String ?? ISO8601DateFormatter().string(from: Date())

            return GroupMember(
                id: id,
                groupId: groupId,
                userId: userId,
                role: role,
                joinedAt: joinedAt,
                user: nil
            )
        }
    }

    private func fetchGroupsRaw(groupIds: [String], accessToken: String?) async throws -> [Group] {
        let ids = groupIds.joined(separator: ",")
        var components = URLComponents(url: baseURL.appendingPathComponent("rest/v1/groups"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "id", value: "in.(\(ids))")
        ]
        guard let url = components?.url else { throw URLError(.badURL) }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let json = (try? JSONSerialization.jsonObject(with: data, options: [])) as? [[String: Any]] ?? []
        return json.compactMap { dict in
            guard let id = dict["id"] as? String else { return nil }
            let name = dict["name"] as? String ?? ""
            let description = dict["description"] as? String
            let iconUrl = dict["icon_url"] as? String
            let inviteCode = dict["invite_code"] as? String
            let createdBy = dict["created_by"] as? String ?? ""
            let createdAt = dict["created_at"] as? String
            let updatedAt = dict["updated_at"] as? String

            return Group(
                id: id,
                name: name,
                description: description,
                iconUrl: iconUrl,
                inviteCode: inviteCode,
                createdBy: createdBy,
                createdAt: createdAt,
                updatedAt: updatedAt
            )
        }
    }

    func createGroup(userId: String, accessToken: String?, name: String, description: String?) async throws -> Group {
        guard let url = URL(string: "rest/v1/groups", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let inviteCode = Self.generateInviteCode()
        var payload: [String: Any] = [
            "name": name,
            "invite_code": inviteCode,
            "created_by": userId
        ]
        payload["description"] = description

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let body = String(data: data, encoding: .utf8) ?? ""
        var group: Group?

        if let json = try? JSONSerialization.jsonObject(with: data, options: []) {
            if let dict = json as? [String: Any] {
                group = groupFromCreatePayload(dict: dict, fallbackName: name, fallbackDescription: description, fallbackInviteCode: inviteCode, fallbackCreatedBy: userId)
            } else if let array = json as? [[String: Any]], let first = array.first {
                group = groupFromCreatePayload(dict: first, fallbackName: name, fallbackDescription: description, fallbackInviteCode: inviteCode, fallbackCreatedBy: userId)
            }
        }

        if let group {
            _ = try await addGroupMember(groupId: group.id, userId: userId, accessToken: accessToken, role: "admin")
            return group
        }

        let trimmedBody = body.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedBody.isEmpty || trimmedBody == "null" || trimmedBody == "[]" {
            let fetched: [Group] = try await fetch(table: "groups", query: [
                URLQueryItem(name: "select", value: "*"),
                URLQueryItem(name: "invite_code", value: "eq.\(inviteCode)")
            ], accessToken: accessToken)
            if let fetchedGroup = fetched.first {
                _ = try await addGroupMember(groupId: fetchedGroup.id, userId: userId, accessToken: accessToken, role: "admin")
                return fetchedGroup
            }
        }

        throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: "decode failed | body: \(body)")
    }

    func addGroupMember(groupId: String, userId: String, accessToken: String?, role: String) async throws -> GroupMember {
        guard let url = URL(string: "rest/v1/group_members", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let payload: [String: Any] = [
            "group_id": groupId,
            "user_id": userId,
            "role": role
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let body = String(data: data, encoding: .utf8) ?? ""
        var member: GroupMember?

        if let json = try? JSONSerialization.jsonObject(with: data, options: []) {
            if let dict = json as? [String: Any] {
                member = memberFromPayload(dict: dict, fallbackGroupId: groupId, fallbackUserId: userId, fallbackRole: role)
            } else if let array = json as? [[String: Any]], let first = array.first {
                member = memberFromPayload(dict: first, fallbackGroupId: groupId, fallbackUserId: userId, fallbackRole: role)
            }
        }

        if let member {
            return member
        }

        let trimmedBody = body.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmedBody.isEmpty || trimmedBody == "null" || trimmedBody == "[]" {
            return GroupMember(
                id: UUID().uuidString,
                groupId: groupId,
                userId: userId,
                role: role,
                joinedAt: ISO8601DateFormatter().string(from: Date()),
                user: nil
            )
        }

        throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: "decode failed | body: \(body)")
    }

    private func groupFromCreatePayload(
        dict: [String: Any],
        fallbackName: String,
        fallbackDescription: String?,
        fallbackInviteCode: String,
        fallbackCreatedBy: String
    ) -> Group? {
        guard let id = dict["id"] as? String else { return nil }
        let name = dict["name"] as? String ?? fallbackName
        let description = dict["description"] as? String ?? fallbackDescription
        let iconUrl = dict["icon_url"] as? String
        let inviteCode = dict["invite_code"] as? String ?? fallbackInviteCode
        let createdBy = dict["created_by"] as? String ?? fallbackCreatedBy
        let createdAt = dict["created_at"] as? String
        let updatedAt = dict["updated_at"] as? String

        return Group(
            id: id,
            name: name,
            description: description,
            iconUrl: iconUrl,
            inviteCode: inviteCode,
            createdBy: createdBy,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }

    private func memberFromPayload(
        dict: [String: Any],
        fallbackGroupId: String,
        fallbackUserId: String,
        fallbackRole: String
    ) -> GroupMember? {
        guard let id = dict["id"] as? String else { return nil }
        let groupId = dict["group_id"] as? String ?? fallbackGroupId
        let userId = dict["user_id"] as? String ?? fallbackUserId
        let role = dict["role"] as? String ?? fallbackRole
        let joinedAt = dict["joined_at"] as? String ?? ISO8601DateFormatter().string(from: Date())

        return GroupMember(
            id: id,
            groupId: groupId,
            userId: userId,
            role: role,
            joinedAt: joinedAt,
            user: nil
        )
    }

    func joinGroup(userId: String, accessToken: String?, inviteCode: String) async throws -> Group {
        let groups: [Group] = try await fetch(table: "groups", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "invite_code", value: "eq.\(inviteCode)")
        ], accessToken: accessToken)

        guard let group = groups.first else { throw URLError(.cannotFindHost) }
        _ = try await addGroupMember(groupId: group.id, userId: userId, accessToken: accessToken, role: "member")
        return group
    }

    func fetchGroupMembers(groupId: String, accessToken: String?) async throws -> [GroupMember] {
        var components = URLComponents(url: baseURL.appendingPathComponent("rest/v1/group_members"), resolvingAgainstBaseURL: false)
        components?.queryItems = [
            URLQueryItem(name: "select", value: "id,group_id,user_id,role,joined_at"),
            URLQueryItem(name: "group_id", value: "eq.\(groupId)"),
            URLQueryItem(name: "order", value: "joined_at.desc")
        ]

        guard let url = components?.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let json = (try? JSONSerialization.jsonObject(with: data, options: [])) as? [[String: Any]] ?? []
        return json.compactMap { dict in
            guard let id = dict["id"] as? String else { return nil }
            let groupId = dict["group_id"] as? String ?? groupId
            let userId = dict["user_id"] as? String ?? ""
            let role = dict["role"] as? String ?? "member"
            let joinedAt = dict["joined_at"] as? String ?? ISO8601DateFormatter().string(from: Date())
            return GroupMember(
                id: id,
                groupId: groupId,
                userId: userId,
                role: role,
                joinedAt: joinedAt,
                user: nil
            )
        }
    }

    func updateGroup(groupId: String, name: String, description: String?, accessToken: String?) async throws -> Group {
        guard let url = URL(string: "rest/v1/groups", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        components?.queryItems = [
            URLQueryItem(name: "id", value: "eq.\(groupId)"),
            URLQueryItem(name: "select", value: "*")
        ]

        guard let finalURL = components?.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: finalURL)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")

        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var payload: [String: Any] = ["name": name]
        if let description {
            payload["description"] = description
        }
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let groups: [Group] = try JSONDecoder().decode([Group].self, from: data)
        guard let updated = groups.first else {
            throw URLError(.cannotParseResponse)
        }

        return updated
    }

    func uploadAvatar(userId: String, accessToken: String?, data: Data) async throws -> String {
        let fileName = "\(userId).jpg"
        guard let url = URL(string: "storage/v1/object/avatars/\(fileName)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")
        request.setValue("true", forHTTPHeaderField: "x-upsert")
        request.httpBody = data

        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: responseData, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: (response as? HTTPURLResponse)?.statusCode ?? 0, responseBody: body)
        }

        return "\(baseURL.absoluteString)/storage/v1/object/public/avatars/\(fileName)"
    }

    func uploadGroupIcon(groupId: String, accessToken: String?, data: Data) async throws -> String {
        let fileName = "\(groupId).jpg"
        guard let url = URL(string: "storage/v1/object/group-icons/\(fileName)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("image/jpeg", forHTTPHeaderField: "Content-Type")
        request.setValue("true", forHTTPHeaderField: "x-upsert")
        request.httpBody = data

        let (responseData, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: responseData, encoding: .utf8) ?? ""
            throw SupabaseError(statusCode: (response as? HTTPURLResponse)?.statusCode ?? 0, responseBody: body)
        }

        return "\(baseURL.absoluteString)/storage/v1/object/public/group-icons/\(fileName)"
    }

    func updateGroupIcon(groupId: String, iconUrl: String, accessToken: String?) async throws -> Group {
        guard let url = URL(string: "rest/v1/groups", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        components?.queryItems = [
            URLQueryItem(name: "id", value: "eq.\(groupId)"),
            URLQueryItem(name: "select", value: "*")
        ]

        guard let finalURL = components?.url else {
            throw URLError(.badURL)
        }

        print("🧾 [DEBUG] updateGroupIcon DB: url=\(finalURL.absoluteString)")
        print("🧾 [DEBUG] updateGroupIcon DB: iconUrl=\(iconUrl)")

        var request = URLRequest(url: finalURL)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")

        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let payload: [String: Any] = ["icon_url": iconUrl]
        request.httpBody = try JSONSerialization.data(withJSONObject: payload)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            print("❌ [DEBUG] updateGroupIcon DB: non-http response")
            throw URLError(.badServerResponse)
        }

        print("🧾 [DEBUG] updateGroupIcon DB: status=\(httpResponse.statusCode)")

        guard (200...299).contains(httpResponse.statusCode) else {
            let body = String(data: data, encoding: .utf8) ?? ""
            print("❌ [DEBUG] updateGroupIcon DB failed: \(httpResponse.statusCode) \(body)")
            throw URLError(.badServerResponse)
        }

        let responseBody = String(data: data, encoding: .utf8) ?? ""
        print("🧾 [DEBUG] updateGroupIcon DB response: \(responseBody)")

        let groups: [Group] = try JSONDecoder().decode([Group].self, from: data)
        guard let updated = groups.first else {
            print("❌ [DEBUG] updateGroupIcon DB: no groups in response")
            throw URLError(.cannotParseResponse)
        }

        print("✅ [DEBUG] updateGroupIcon DB: success")
        return updated
    }

    func leaveGroup(groupId: String, userId: String, accessToken: String?) async throws {
        guard let url = URL(string: "rest/v1/group_members", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var components = URLComponents(url: url, resolvingAgainstBaseURL: true)
        components?.queryItems = [
            URLQueryItem(name: "group_id", value: "eq.\(groupId)"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)")
        ]

        guard let finalURL = components?.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: finalURL)
        request.httpMethod = "DELETE"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")

        if let token = accessToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let (_, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    private static func generateInviteCode() -> String {
        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        return String((0..<6).compactMap { _ in letters.randomElement() })
    }

    func createFlow(userId: String, accessToken: String?, name: String) async throws -> Flow {
        guard let url = URL(string: "rest/v1/flows", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let payload: [String: Any] = [
            "user_id": userId,
            "name": name,
            "is_favorite": false,
            "flow_data": ["nodes": [], "edges": []]
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let flows = try decoder.decode([Flow].self, from: data)
        guard let flow = flows.first else {
            throw URLError(.cannotParseResponse)
        }
        return flow
    }

    func updateFlowData(flowId: String, accessToken: String?, flowData: FlowData) async throws {
        guard let url = URL(string: "rest/v1/flows?id=eq.\(flowId)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let encoder = JSONEncoder()
        let flowDataJson = try encoder.encode(flowData)
        let flowObject = try JSONSerialization.jsonObject(with: flowDataJson, options: [])

        let payload: [String: Any] = [
            "flow_data": flowObject
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func upsertTechnique(userId: String, accessToken: String?, technique: Technique) async throws {
        guard let url = URL(string: "rest/v1/techniques?on_conflict=id", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var payload: [String: Any] = [
            "id": technique.id,
            "user_id": userId,
            "name": technique.name,
            "technique_type": technique.techniqueType ?? "other"
        ]
        payload["name_en"] = technique.nameEn
        payload["category"] = technique.category
        payload["description"] = technique.description
        payload["video_url"] = technique.videoUrl
        payload["tags"] = technique.tags
        payload["mastery_level"] = technique.masteryLevel

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func upsertFlow(userId: String, accessToken: String?, flow: Flow) async throws {
        guard let url = URL(string: "rest/v1/flows?on_conflict=id", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let encoder = JSONEncoder()
        let flowDataJson = try encoder.encode(flow.flowData ?? FlowData(nodes: [], edges: []))
        let flowObject = try JSONSerialization.jsonObject(with: flowDataJson, options: [])

        let payload: [String: Any] = [
            "id": flow.id,
            "user_id": userId,
            "name": flow.name,
            "is_favorite": flow.isFavorite ?? false,
            "flow_data": flowObject
        ]

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func upsertTrainingLog(userId: String, accessToken: String?, log: TrainingLog) async throws {
        guard let url = URL(string: "rest/v1/training_logs?on_conflict=id", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var payload: [String: Any] = [
            "id": log.id,
            "user_id": userId,
            "training_date": log.trainingDate
        ]
        payload["start_time"] = log.startTime
        payload["end_time"] = log.endTime
        payload["duration_minutes"] = log.durationMinutes
        payload["content"] = log.content
        payload["notes"] = log.notes
        payload["condition"] = log.condition
        payload["video_urls"] = log.videoUrls

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("resolution=merge-duplicates", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    // MARK: - Shared Flows

    func createSharedFlow(
        groupId: String,
        userId: String,
        accessToken: String?,
        name: String,
        flowData: FlowData,
        techniqueIds: [String],
        expiresAt: String?
    ) async throws -> SharedFlow {
        guard let url = URL(string: "rest/v1/shared_flows", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let encoder = JSONEncoder()
        let flowDataJson = try encoder.encode(flowData)
        let flowObject = try JSONSerialization.jsonObject(with: flowDataJson, options: [])
        var payload: [String: Any] = [
            "group_id": groupId,
            "created_by": userId,
            "name": name,
            "flow_data": flowObject,
            "technique_ids": techniqueIds
        ]
        if let expiresAt {
            payload["expires_at"] = expiresAt
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let shared = try decoder.decode([SharedFlow].self, from: data)
        guard let result = shared.first else { throw URLError(.cannotParseResponse) }
        return result
    }

    func fetchSharedFlows(groupId: String, accessToken: String?, nowIso: String) async throws -> [SharedFlow] {
        try await fetch(table: "shared_flows", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "group_id", value: "eq.\(groupId)"),
            URLQueryItem(name: "or", value: "(expires_at.is.null,expires_at.gt.\(nowIso))"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ], accessToken: accessToken)
    }

    func createSharedTechnique(
        groupId: String,
        userId: String,
        accessToken: String?,
        technique: SharedTechnique,
        sourceTechniqueId: String?,
        expiresAt: String?
    ) async throws -> SharedTechniqueEntry {
        guard let url = URL(string: "rest/v1/shared_techniques", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let encoder = JSONEncoder()
        let techniqueJson = try encoder.encode(technique)
        let techniqueObject = try JSONSerialization.jsonObject(with: techniqueJson, options: [])

        var payload: [String: Any] = [
            "group_id": groupId,
            "created_by": userId,
            "technique": techniqueObject
        ]
        if let sourceTechniqueId {
            payload["source_technique_id"] = sourceTechniqueId
        }
        if let expiresAt {
            payload["expires_at"] = expiresAt
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let shared = try decoder.decode([SharedTechniqueEntry].self, from: data)
        guard let result = shared.first else { throw URLError(.cannotParseResponse) }
        return result
    }

    func updateSharedTechnique(
        id: String,
        accessToken: String?,
        technique: SharedTechnique,
        expiresAt: String?
    ) async throws -> SharedTechniqueEntry {
        guard let url = URL(string: "rest/v1/shared_techniques?id=eq.\(id)", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        let encoder = JSONEncoder()
        let techniqueJson = try encoder.encode(technique)
        let techniqueObject = try JSONSerialization.jsonObject(with: techniqueJson, options: [])

        var payload: [String: Any] = [
            "technique": techniqueObject
        ]
        if let expiresAt {
            payload["expires_at"] = expiresAt
        } else {
            payload["expires_at"] = NSNull()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "PATCH"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        }
        request.setValue("return=representation", forHTTPHeaderField: "Prefer")

        request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let shared = try decoder.decode([SharedTechniqueEntry].self, from: data)
        guard let result = shared.first else { throw URLError(.cannotParseResponse) }
        return result
    }

    func fetchSharedTechniques(groupId: String, accessToken: String?, nowIso: String) async throws -> [SharedTechniqueEntry] {
        try await fetch(table: "shared_techniques", query: [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "group_id", value: "eq.\(groupId)"),
            URLQueryItem(name: "or", value: "(expires_at.is.null,expires_at.gt.\(nowIso))"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ], accessToken: accessToken)
    }

    private func fetch<T: Decodable>(table: String, query: [URLQueryItem], accessToken: String?) async throws -> T {
        var components = URLComponents(url: baseURL.appendingPathComponent("rest/v1/\(table)"), resolvingAgainstBaseURL: false)
        components?.queryItems = query

        guard let url = components?.url else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")

        print("🌐 [DEBUG] Fetching \(table)")
        print("🌐 [DEBUG] URL: \(url)")
        print("🌐 [DEBUG] Has accessToken: \(accessToken != nil)")

        if let accessToken, !accessToken.isEmpty {
            request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
            print("🌐 [DEBUG] Authorization header set with token: \(accessToken.prefix(20))...")
        } else {
            print("⚠️ [DEBUG] No Authorization header set (accessToken is nil or empty)")
        }

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }

        print("🌐 [DEBUG] Response status: \(httpResponse.statusCode)")

        if !(200...299).contains(httpResponse.statusCode) {
            let body = String(data: data, encoding: .utf8) ?? ""
            print("❌ [DEBUG] Error response body: \(body)")
            throw SupabaseError(statusCode: httpResponse.statusCode, responseBody: body)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(T.self, from: data)
    }
}
