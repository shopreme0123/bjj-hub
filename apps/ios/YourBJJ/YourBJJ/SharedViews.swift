import SwiftUI

struct SectionHeaderView: View {
    let title: String
    let theme: BeltTheme

    var body: some View {
        HStack {
            Text(title)
                .font(.app(size: 22, weight: .bold))
                .foregroundStyle(theme.textPrimary)
            Spacer()
        }
        .padding(.horizontal, 16)
    }
}

struct SearchField: View {
    @Binding var query: String
    let theme: BeltTheme
    let placeholder: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textMuted)
            TextField(placeholder, text: $query)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
        }
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .padding(.horizontal, 16)
    }
}

struct EmptyStateView: View {
    let message: String
    let subtitle: String?
    let theme: BeltTheme
    @State private var isAnimating = false

    init(message: String, subtitle: String? = "新しい技を追加して練習を記録しましょう", theme: BeltTheme) {
        self.message = message
        self.subtitle = subtitle
        self.theme = theme
    }

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(theme.primary.opacity(0.08))
                    .frame(width: 80, height: 80)
                    .scaleEffect(isAnimating ? 1.1 : 1.0)
                    .opacity(isAnimating ? 0.5 : 0.8)

                Image(systemName: "figure.wrestling")
                    .font(.system(size: 32, weight: .semibold))
                    .foregroundStyle(theme.primary.opacity(0.6))
                    .offset(y: isAnimating ? -4 : 0)
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true)) {
                    isAnimating = true
                }
            }

            VStack(spacing: 6) {
                Text(message)
                    .font(.body(15, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption(12, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                        .multilineTextAlignment(.center)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

struct ErrorPopup: View {
    let message: String
    let theme: BeltTheme
    let onDismiss: () -> Void
    @State private var isVisible = false
    @State private var offset: CGFloat = -100

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.app(size: 16, weight: .semibold))
                    .foregroundStyle(.white)

                Text(message)
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineLimit(6)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)

                Spacer()

                Button(action: onDismiss) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.app(size: 20, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.8))
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.red)
                    .shadow(color: Color.black.opacity(0.3), radius: 12, x: 0, y: 6)
            )
            .padding(.horizontal, 16)
            .padding(.top, 60)
            .offset(y: offset)
            .opacity(isVisible ? 1 : 0)

            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.clear)
        .allowsHitTesting(true)
        .onAppear {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                offset = 0
                isVisible = true
            }

            // Auto-dismiss after 6 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 6.0) {
                dismiss()
            }
        }
    }

    private func dismiss() {
        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            offset = -100
            isVisible = false
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
            onDismiss()
        }
    }
}
