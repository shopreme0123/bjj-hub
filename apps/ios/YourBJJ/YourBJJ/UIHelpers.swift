import SwiftUI
import UIKit

extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        let r, g, b: UInt64
        switch cleaned.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: 1)
    }
}

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

extension Font {
    static func app(size: CGFloat, weight: Font.Weight? = nil, design: Font.Design = .default) -> Font {
        let scaled = size * 1.08
        if let weight {
            return .system(size: scaled, weight: weight, design: design)
        }
        return .system(size: scaled, design: design)
    }

    // Display fonts - for headlines and impactful text
    static func display(_ size: CGFloat, weight: Font.Weight = .heavy) -> Font {
        .system(size: size * 1.12, weight: weight, design: .rounded)
    }

    // Title fonts - for section headers
    static func title(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size * 1.10, weight: weight, design: .default)
    }

    // Body fonts - for regular content
    static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size * 1.06, weight: weight, design: .default)
    }

    // Caption fonts - for subtle text
    static func caption(_ size: CGFloat, weight: Font.Weight = .medium) -> Font {
        .system(size: size * 1.04, weight: weight, design: .default)
    }
}

// Enhanced shadow modifiers
extension View {
    func cardShadow(color: Color = .black.opacity(0.08), radius: CGFloat = 12, y: CGFloat = 4) -> some View {
        self
            .shadow(color: color.opacity(0.5), radius: radius * 0.5, x: 0, y: y * 0.5)
            .shadow(color: color, radius: radius, x: 0, y: y)
    }

    func glowEffect(color: Color, radius: CGFloat = 20) -> some View {
        self
            .shadow(color: color.opacity(0.3), radius: radius, x: 0, y: 0)
            .shadow(color: color.opacity(0.2), radius: radius * 1.5, x: 0, y: 0)
    }

    func subtleShadow(color: Color = .black.opacity(0.04), radius: CGFloat = 8, y: CGFloat = 2) -> some View {
        self.shadow(color: color, radius: radius, x: 0, y: y)
    }
}

// Animated press effect
extension View {
    func pressEffect() -> some View {
        self.buttonStyle(PressEffectButtonStyle())
    }
}

struct PressEffectButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

private struct RoundedCorner: Shape {
    var radius: CGFloat
    var corners: UIRectCorner

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(roundedRect: rect, byRoundingCorners: corners, cornerRadii: CGSize(width: radius, height: radius))
        return Path(path.cgPath)
    }
}

// Noise texture overlay
struct NoiseTexture: View {
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(0..<50, id: \.self) { _ in
                    Circle()
                        .fill(Color.white.opacity(Double.random(in: 0.01...0.03)))
                        .frame(width: CGFloat.random(in: 1...2), height: CGFloat.random(in: 1...2))
                        .position(
                            x: CGFloat.random(in: 0...geometry.size.width),
                            y: CGFloat.random(in: 0...geometry.size.height)
                        )
                }
            }
            .allowsHitTesting(false)
        }
    }
}
