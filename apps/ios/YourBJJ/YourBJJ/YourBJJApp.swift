//
//  YourBJJApp.swift
//  YourBJJ
//
//  Created by Shogo Nakajima on 2026/01/13.
//

import SwiftUI
import GoogleMobileAds

@main
struct YourBJJApp: App {
    @StateObject private var viewModel = AppViewModel()

    init() {
        if let appId = Bundle.main.object(forInfoDictionaryKey: "GADApplicationIdentifier") as? String,
           !appId.isEmpty {
            // Simulators are in test mode by default. For real devices, AdMob will log test device IDs.
            GADMobileAds.sharedInstance().start(completionHandler: nil)
        } else {
            print("⚠️ [DEBUG] Missing GADApplicationIdentifier in Info.plist")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
                .onOpenURL { url in
                    handleAuthCallback(url: url)
                }
        }
    }

    private func handleAuthCallback(url: URL) {
        print("✅ [DEBUG] URL received: \(url.absoluteString)")

        // URLスキームのチェック（host や path がない場合もある）
        guard url.scheme == "yourbjj" else {
            print("⚠️ [DEBUG] Invalid scheme: \(url.scheme ?? "nil")")
            return
        }

        // fragmentからトークンを取得
        if let fragment = url.fragment {
            print("✅ [DEBUG] Fragment found: \(fragment)")
            let params = fragment.split(separator: "&").reduce(into: [String: String]()) { dict, pair in
                let parts = pair.split(separator: "=", maxSplits: 1)
                if parts.count == 2 {
                    dict[String(parts[0])] = String(parts[1])
                }
            }

            if let accessToken = params["access_token"],
               let refreshToken = params["refresh_token"],
               let expiresInStr = params["expires_in"],
               let expiresIn = Int(expiresInStr) {

                print("✅ [DEBUG] Tokens extracted successfully")

                // ユーザーIDとメールアドレスをトークンから抽出
                Task {
                    do {
                        // access_tokenをデコードしてユーザー情報を取得
                        let tokenParts = accessToken.split(separator: ".")
                        if tokenParts.count > 1 {
                            let payloadData = String(tokenParts[1])
                                .replacingOccurrences(of: "-", with: "+")
                                .replacingOccurrences(of: "_", with: "/")

                            // Base64パディング
                            var paddedPayload = payloadData
                            while paddedPayload.count % 4 != 0 {
                                paddedPayload += "="
                            }

                            if let data = Data(base64Encoded: paddedPayload),
                               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                               let userId = json["sub"] as? String,
                               let email = json["email"] as? String {

                                let expiresAt = Date().addingTimeInterval(TimeInterval(expiresIn))
                                let session = AuthSession(
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    userId: userId,
                                    email: email,
                                    expiresAt: expiresAt
                                )

                                // メインスレッドでセッションを保存
                                await MainActor.run {
                                    SessionStore.save(session)
                                    viewModel.session = session
                                    print("✅ [DEBUG] Session saved and view model updated")
                                }
                            }
                        }
                    }
                }
            }
        } else {
            print("⚠️ [DEBUG] No fragment found in URL")
        }
    }
}
