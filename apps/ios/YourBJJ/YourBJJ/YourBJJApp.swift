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
    init() {
        if let appId = Bundle.main.object(forInfoDictionaryKey: "GADApplicationIdentifier") as? String,
           !appId.isEmpty {
            GADMobileAds.sharedInstance().start(completionHandler: nil)
        } else {
            print("⚠️ [DEBUG] Missing GADApplicationIdentifier in Info.plist")
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    handleAuthCallback(url: url)
                }
        }
    }

    private func handleAuthCallback(url: URL) {
        guard url.scheme == "yourbjj",
              url.host == "auth",
              url.path == "/callback" else {
            return
        }

        // URLからトークンを抽出してセッションに保存
        // Supabaseの確認メールリンクをクリックすると、
        // yourbjj://auth/callback#access_token=xxx&refresh_token=xxx のようなURLで戻ってきます
        print("✅ [DEBUG] Auth callback received: \(url.absoluteString)")

        // fragmentからトークンを取得
        if let fragment = url.fragment {
            let params = fragment.split(separator: "&").reduce(into: [String: String]()) { dict, pair in
                let parts = pair.split(separator: "=", maxSplits: 1)
                if parts.count == 2 {
                    dict[String(parts[0])] = String(parts[1])
                }
            }

            if let accessToken = params["access_token"],
               let refreshToken = params["refresh_token"] {
                print("✅ [DEBUG] Tokens extracted from callback")
                // ここでセッションを保存する処理を追加
                // 現時点では、ユーザーが再度ログインする必要があります
            }
        }
    }
}
