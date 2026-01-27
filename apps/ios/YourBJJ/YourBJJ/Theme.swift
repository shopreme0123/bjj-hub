import SwiftUI

struct BeltTheme {
    let belt: BeltColor

    var background: Color {
        Color(hex: theme.bg)
    }

    var backgroundGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(hex: theme.bg),
                Color(hex: theme.bgGradient)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    var card: Color {
        Color(hex: theme.card)
    }

    var cardBorder: Color {
        Color(hex: theme.cardBorder)
    }

    var textPrimary: Color {
        Color(hex: theme.text)
    }

    var textMuted: Color {
        Color(hex: theme.textMuted)
    }

    var primary: Color {
        Color(hex: theme.primary)
    }

    var primaryLight: Color {
        Color(hex: theme.primaryLight)
    }

    var gradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: theme.gradientStart), Color(hex: theme.gradientEnd)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    var meshGradient: LinearGradient {
        LinearGradient(
            colors: [
                Color(hex: theme.gradientStart).opacity(0.8),
                Color(hex: theme.gradientEnd).opacity(0.6),
                Color(hex: theme.primary).opacity(0.4)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    var beltGradient: LinearGradient {
        LinearGradient(
            colors: [Color(hex: theme.beltLight), Color(hex: theme.beltMain), Color(hex: theme.beltDark)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    var beltStripeColor: Color {
        Color(hex: theme.beltStripe)
    }

    var beltShadow: Color {
        Color.black.opacity(theme.beltShadow)
    }

    var accentGlow: Color {
        Color(hex: theme.primary).opacity(0.12)
    }

    var subtleTexture: Color {
        Color.white.opacity(0.03)
    }

    private var theme: BeltThemeDefinition {
        beltThemes[belt] ?? beltThemes[.white]!
    }
}

struct BeltThemeDefinition {
    let primary: String
    let primaryLight: String
    let gradientStart: String
    let gradientEnd: String
    let bg: String
    let bgGradient: String
    let card: String
    let cardBorder: String
    let text: String
    let textMuted: String
    let beltMain: String
    let beltLight: String
    let beltDark: String
    let beltStripe: String
    let beltShadow: Double
}

let beltThemes: [BeltColor: BeltThemeDefinition] = [
    .white: BeltThemeDefinition(
        primary: "#475569",
        primaryLight: "#64748b",
        gradientStart: "#64748b",
        gradientEnd: "#94a3b8",
        bg: "#f8fafc",
        bgGradient: "#f1f5f9",
        card: "#ffffff",
        cardBorder: "#e2e8f0",
        text: "#0f172a",
        textMuted: "#64748b",
        beltMain: "#e2e8f0",
        beltLight: "#f8fafc",
        beltDark: "#cbd5e1",
        beltStripe: "#0f172a",
        beltShadow: 0.20
    ),
    .blue: BeltThemeDefinition(
        primary: "#2563eb",
        primaryLight: "#3b82f6",
        gradientStart: "#3b82f6",
        gradientEnd: "#60a5fa",
        bg: "#f8fafc",
        bgGradient: "#eff6ff",
        card: "#ffffff",
        cardBorder: "#dbeafe",
        text: "#0f172a",
        textMuted: "#64748b",
        beltMain: "#2563eb",
        beltLight: "#3b82f6",
        beltDark: "#1d4ed8",
        beltStripe: "#0f172a",
        beltShadow: 0.32
    ),
    .purple: BeltThemeDefinition(
        primary: "#7c3aed",
        primaryLight: "#8b5cf6",
        gradientStart: "#8b5cf6",
        gradientEnd: "#a78bfa",
        bg: "#f8fafc",
        bgGradient: "#faf5ff",
        card: "#ffffff",
        cardBorder: "#e9d5ff",
        text: "#0f172a",
        textMuted: "#64748b",
        beltMain: "#7c3aed",
        beltLight: "#8b5cf6",
        beltDark: "#6d28d9",
        beltStripe: "#0f172a",
        beltShadow: 0.32
    ),
    .brown: BeltThemeDefinition(
        primary: "#92400e",
        primaryLight: "#b45309",
        gradientStart: "#b45309",
        gradientEnd: "#d97706",
        bg: "#f8fafc",
        bgGradient: "#fffbeb",
        card: "#ffffff",
        cardBorder: "#fed7aa",
        text: "#0f172a",
        textMuted: "#64748b",
        beltMain: "#92400e",
        beltLight: "#b45309",
        beltDark: "#78350f",
        beltStripe: "#0f172a",
        beltShadow: 0.32
    ),
    .black: BeltThemeDefinition(
        primary: "#09090b",
        primaryLight: "#18181b",
        gradientStart: "#18181b",
        gradientEnd: "#3f3f46",
        bg: "#fafafa",
        bgGradient: "#f4f4f5",
        card: "#ffffff",
        cardBorder: "#e4e4e7",
        text: "#09090b",
        textMuted: "#71717a",
        beltMain: "#18181b",
        beltLight: "#27272a",
        beltDark: "#09090b",
        beltStripe: "#fafafa",
        beltShadow: 0.45
    )
]
