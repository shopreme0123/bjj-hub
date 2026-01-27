//
//  ContentView.swift
//  BJJHub
//
//  Created by Shogo Nakajima on 2026/01/13.
//

import SwiftUI

struct ContentView: View {
    @State private var showLaunchScreen = true

    var body: some View {
        ZStack {
            MainTabView()

            if showLaunchScreen {
                LaunchScreen()
                    .transition(.opacity)
                    .zIndex(1)
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                withAnimation(.easeOut(duration: 0.5)) {
                    showLaunchScreen = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
