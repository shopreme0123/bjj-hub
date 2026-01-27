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
        }
    }
}
