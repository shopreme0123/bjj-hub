import Foundation
import UserNotifications
import Combine

final class NotificationsManager: ObservableObject {
    @Published var isAuthorized = false

    func requestAuthorization() async {
        do {
            let granted = try await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])
            await MainActor.run {
                isAuthorized = granted
            }
        } catch {
            await MainActor.run {
                isAuthorized = false
            }
        }
    }
}
