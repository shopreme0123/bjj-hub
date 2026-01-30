import SwiftUI
import WebKit

struct TermsView: View {
    @Environment(\.dismiss) private var dismiss
    let theme: BeltTheme

    var body: some View {
        ZStack {
            theme.backgroundGradient
                .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Text("利用規約")
                        .font(.display(20, weight: .heavy))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)
                            .frame(width: 36, height: 36)
                            .background(theme.card)
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)

                WebView(url: URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
            }
        }
    }
}
