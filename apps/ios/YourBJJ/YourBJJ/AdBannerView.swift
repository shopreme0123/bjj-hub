import SwiftUI
import GoogleMobileAds

enum AdPlacement {
    case techniques
    case diary

    var adUnitId: String {
        #if DEBUG
        // Use Google test ads in debug builds to avoid policy violations.
        return "ca-app-pub-3940256099942544/2934735716"
        #else
        switch self {
        case .techniques:
            return "ca-app-pub-3394335051689473/4947424829"
        case .diary:
            return "ca-app-pub-3394335051689473/3101525531"
        }
        #endif
    }
}

struct AdBannerView: View {
    let theme: BeltTheme
    let placement: AdPlacement
    @State private var loadState: LoadState = .loading

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text("広告")
                    .font(.app(size: 11, weight: .bold))
                    .foregroundStyle(theme.textMuted)
                Spacer()
                Text("プレミアムで非表示")
                    .font(.app(size: 10, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }

            ZStack {
                AdMobBannerView(adUnitId: placement.adUnitId, loadState: $loadState)
                    .frame(height: 50)
                    .frame(maxWidth: .infinity)

                switch loadState {
                case .loading:
                    Text("広告読み込み中...")
                        .font(.caption(11, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                case .failed:
                    Text("広告を読み込めませんでした")
                        .font(.caption(11, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                case .loaded:
                    EmptyView()
                }
            }
        }
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}

private struct AdMobBannerView: UIViewRepresentable {
    let adUnitId: String
    @Binding var loadState: LoadState

    func makeUIView(context: Context) -> GADBannerView {
        let bannerView = GADBannerView(adSize: GADAdSizeBanner)
        bannerView.adUnitID = adUnitId
        bannerView.rootViewController = UIApplication.shared.rootViewController
        bannerView.delegate = context.coordinator
        context.coordinator.setLoading()
        bannerView.load(GADRequest())
        return bannerView
    }

    func updateUIView(_ uiView: GADBannerView, context: Context) {
        if uiView.adUnitID != adUnitId {
            uiView.adUnitID = adUnitId
            context.coordinator.setLoading()
            uiView.load(GADRequest())
        }
        uiView.rootViewController = UIApplication.shared.rootViewController
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(loadState: $loadState)
    }

    final class Coordinator: NSObject, GADBannerViewDelegate {
        private static var didPresentInspector = false
        private let loadState: Binding<LoadState>

        init(loadState: Binding<LoadState>) {
            self.loadState = loadState
        }

        func setLoading() {
            DispatchQueue.main.async {
                self.loadState.wrappedValue = .loading
            }
        }

        func bannerViewDidReceiveAd(_ bannerView: GADBannerView) {
            DispatchQueue.main.async {
                self.loadState.wrappedValue = .loaded
            }
            #if DEBUG
            print("📣 [AdMob] Banner received. If you need the test device ID, Ad Inspector will open once.")
            guard !Self.didPresentInspector else { return }
            Self.didPresentInspector = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                guard let rootVC = bannerView.rootViewController else { return }
                GADMobileAds.sharedInstance().presentAdInspector(from: rootVC) { error in
                    if let error {
                        print("⚠️ [AdMob] Ad Inspector failed: \(error.localizedDescription)")
                    }
                }
            }
            #endif
        }

        func bannerView(_ bannerView: GADBannerView, didFailToReceiveAdWithError error: Error) {
            DispatchQueue.main.async {
                self.loadState.wrappedValue = .failed(error.localizedDescription)
            }
            print("⚠️ [AdMob] Failed to load banner: \(error.localizedDescription)")
        }
    }
}

private enum LoadState: Equatable {
    case loading
    case loaded
    case failed(String)
}

private extension UIApplication {
    var rootViewController: UIViewController? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }?
            .rootViewController
    }
}
