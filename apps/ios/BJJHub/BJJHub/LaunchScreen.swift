import SwiftUI

struct LaunchScreen: View {
    @State private var isAnimating = false
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                colors: [
                    Color(hex: "#1a1a1a"),
                    Color(hex: "#2d2d2d")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 24) {
                // App icon with animation
                Image("LaunchIcon")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 120, height: 120)
                    .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
                    .shadow(color: Color.black.opacity(0.3), radius: 20, x: 0, y: 10)
                    .scaleEffect(isAnimating ? 1.0 : 0.8)
                    .opacity(opacity)

                // App name
                Text("Your BJJ")
                    .font(.app(size: 32, weight: .bold))
                    .foregroundStyle(.white)
                    .opacity(opacity)

                // Tagline
                Text("Train. Track. Improve.")
                    .font(.app(size: 14, weight: .medium))
                    .foregroundStyle(Color.white.opacity(0.7))
                    .opacity(opacity)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.8, dampingFraction: 0.7)) {
                isAnimating = true
            }
            withAnimation(.easeIn(duration: 0.6)) {
                opacity = 1
            }
        }
    }
}

#Preview {
    LaunchScreen()
}
