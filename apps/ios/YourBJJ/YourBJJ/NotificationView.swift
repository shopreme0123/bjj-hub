import SwiftUI

struct NotificationView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Image(systemName: "bell.badge")
                    .font(.app(size: 36, weight: .semibold))
                    .foregroundStyle(Color(hex: "#64748b"))

                Text("通知は準備中です")
                    .font(.app(size: 16, weight: .semibold))

                Text("今後、練習リマインドや更新情報をお届けします。")
                    .font(.app(size: 12, weight: .medium))
                    .foregroundStyle(Color.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                Spacer()
            }
            .padding(.top, 24)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color(hex: "#f8fafc"))
            .navigationTitle("通知")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
        }
    }
}
