import SwiftUI
import WebKit

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) private var dismiss
    let theme: BeltTheme

    var body: some View {
        ZStack {
            theme.backgroundGradient
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("プライバシーポリシー")
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

                // WebView
                WebView(url: URL(string: "https://your-bjj-docs.vercel.app")!)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
            }
        }
    }
}

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.backgroundColor = .clear
        webView.isOpaque = false
        webView.scrollView.backgroundColor = .clear
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        let request = URLRequest(url: url)
        webView.load(request)
    }
}
