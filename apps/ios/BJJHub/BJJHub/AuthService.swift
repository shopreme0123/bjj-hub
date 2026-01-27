import Foundation

struct AuthSession: Codable {
    let accessToken: String
    let refreshToken: String
    let userId: String
    let email: String
    let expiresAt: Date?
}

struct AuthResponse: Decodable {
    let accessToken: String
    let refreshToken: String
    let expiresIn: Int
    let tokenType: String
    let user: AuthUser
}

struct AuthUser: Decodable {
    let id: String
    let email: String
}

struct AuthErrorResponse: Decodable {
    let error: String?
    let errorDescription: String?
    let message: String?
}

struct AuthError: LocalizedError {
    let message: String
    let statusCode: Int?
    let responseBody: String?

    var errorDescription: String? {
        message
    }
}

final class SupabaseAuthService {
    private let baseURL: URL
    private let anonKey: String

    init(url: String = SupabaseConfig.url, anonKey: String = SupabaseConfig.anonKey) {
        self.baseURL = URL(string: url) ?? URL(string: "https://invalid.local")!
        self.anonKey = anonKey
    }

    func signIn(email: String, password: String) async throws -> AuthSession {
        guard let url = URL(string: "auth/v1/token?grant_type=password", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")

        let payload = ["email": email, "password": password]
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError(message: "ログインに失敗しました (無効なレスポンス)", statusCode: nil, responseBody: nil)
        }

        if !(200...299).contains(httpResponse.statusCode) {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            if let errorPayload = try? decoder.decode(AuthErrorResponse.self, from: data) {
                let baseMessage = errorPayload.errorDescription ?? errorPayload.message ?? errorPayload.error ?? "ログインに失敗しました"
                let body = String(data: data, encoding: .utf8)
                let detail = body?.isEmpty == false ? " \(body ?? "")" : ""
                let message = "\(baseMessage) (status \(httpResponse.statusCode))\(detail)"
                throw AuthError(message: message, statusCode: httpResponse.statusCode, responseBody: body)
            }
            let body = String(data: data, encoding: .utf8) ?? ""
            let detail = body.isEmpty ? "" : " \(body)"
            throw AuthError(message: "ログインに失敗しました (\(httpResponse.statusCode))\(detail)", statusCode: httpResponse.statusCode, responseBody: body)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let authResponse = try decoder.decode(AuthResponse.self, from: data)

        let expiresAt = Date().addingTimeInterval(TimeInterval(authResponse.expiresIn))
        return AuthSession(
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            userId: authResponse.user.id,
            email: authResponse.user.email,
            expiresAt: expiresAt
        )
    }

    func refreshSession(refreshToken: String) async throws -> AuthSession {
        guard let url = URL(string: "auth/v1/token?grant_type=refresh_token", relativeTo: baseURL) else {
            throw URLError(.badURL)
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue(anonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")

        let payload = ["refresh_token": refreshToken]
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError(message: "トークンの更新に失敗しました", statusCode: nil, responseBody: nil)
        }

        if !(200...299).contains(httpResponse.statusCode) {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw AuthError(message: "トークンの更新に失敗しました (\(httpResponse.statusCode))", statusCode: httpResponse.statusCode, responseBody: body)
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let authResponse = try decoder.decode(AuthResponse.self, from: data)

        let expiresAt = Date().addingTimeInterval(TimeInterval(authResponse.expiresIn))
        return AuthSession(
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            userId: authResponse.user.id,
            email: authResponse.user.email,
            expiresAt: expiresAt
        )
    }
}

final class SessionStore {
    private static let key = "bjjhub.session"

    static func load() -> AuthSession? {
        guard let data = UserDefaults.standard.data(forKey: key) else {
            return nil
        }
        return try? JSONDecoder().decode(AuthSession.self, from: data)
    }

    static func save(_ session: AuthSession) {
        if let data = try? JSONEncoder().encode(session) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }

    static func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}
