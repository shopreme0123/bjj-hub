import SwiftUI
import GoogleMobileAds

enum AdPlacement {
    case techniques
    case diary

    var adUnitId: String {
        // TODO: Replace with production Ad Unit IDs.
        return "ca-app-pub-3940256099942544/2934735716"
    }
}

struct AdBannerView: View {
    let theme: BeltTheme
    let placement: AdPlacement

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

            AdMobBannerView(adUnitId: placement.adUnitId)
                .frame(height: 50)
                .frame(maxWidth: .infinity)
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

    func makeUIView(context: Context) -> GADBannerView {
        let bannerView = GADBannerView(adSize: GADAdSizeBanner)
        bannerView.adUnitID = adUnitId
        bannerView.rootViewController = UIApplication.shared.rootViewController
        bannerView.load(GADRequest())
        return bannerView
    }

    func updateUIView(_ uiView: GADBannerView, context: Context) {
        if uiView.adUnitID != adUnitId {
            uiView.adUnitID = adUnitId
            uiView.load(GADRequest())
        }
        uiView.rootViewController = UIApplication.shared.rootViewController
    }
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
