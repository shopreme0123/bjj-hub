import SwiftUI
import UIKit

struct HomeView: View {
    @ObservedObject var viewModel: AppViewModel
    var onOpenSettings: (() -> Void)?
    var onOpenDiary: (() -> Void)?
    var onSelectLog: ((TrainingLog) -> Void)?
    var onOpenTechniques: (() -> Void)?
    var onSelectTechnique: ((Technique) -> Void)?

    private let weekdays = ["月", "火", "水", "木", "金", "土", "日"]

    @State private var isAppearing = false

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            // Gradient background
            theme.backgroundGradient
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.profile == nil {
                // Show loading screen when initially loading data
                LoadingView(theme: theme)
            } else {
                VStack(spacing: 0) {
                    SectionHeaderView(title: "ホーム", theme: theme)
                        .padding(.top, 16)

                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 24) {
                            HeaderView(
                                profileName: viewModel.profileName,
                                avatarUrl: viewModel.profile?.avatarUrl,
                                localAvatarURL: localAvatarURL,
                                theme: theme,
                                isAppearing: isAppearing,
                                onOpenSettings: { onOpenSettings?() }
                            )
                        .padding(.top, 4)
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 20)
                        .animation(.easeOut(duration: 0.5).delay(0.3), value: isAppearing)

                        BeltCardView(
                            theme: theme,
                            beltColor: viewModel.beltColor,
                            stripes: viewModel.beltStripes,
                            stats: stats,
                            isAppearing: isAppearing
                        )
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)
                        .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.4), value: isAppearing)

                        WeeklyPracticeView(
                            weekdays: weekdays,
                            practice: viewModel.weeklyPractice,
                            theme: theme,
                            onTap: { onOpenDiary?() }
                        )
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)
                        .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.5), value: isAppearing)

                        if !viewModel.isPremium {
                            AdBannerView(theme: theme, placement: .home)
                                .opacity(isAppearing ? 1 : 0)
                                .offset(y: isAppearing ? 0 : 30)
                                .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.55), value: isAppearing)
                        }

                        RecentTrainingView(
                            logs: viewModel.recentLogs,
                            theme: theme,
                            onOpenAll: { onOpenDiary?() },
                            onSelect: { log in onSelectLog?(log) }
                        )
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)
                        .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.6), value: isAppearing)

                        TechniqueLibraryView(
                            techniques: viewModel.recentTechniques,
                            theme: theme,
                            onOpenAll: { onOpenTechniques?() },
                            onSelect: { technique in onSelectTechnique?(technique) }
                        )
                        .opacity(isAppearing ? 1 : 0)
                        .offset(y: isAppearing ? 0 : 30)
                        .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.7), value: isAppearing)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                        .padding(.bottom, 96)
                    }
                    .overlay(alignment: .top) {
                        if !SupabaseConfig.isConfigured {
                            ConfigBanner(text: "Supabase設定が未入力です")
                                .padding(.horizontal, 16)
                                .padding(.top, 4)
                        }
                    }
                }
            }
        }
        .onAppear {
            isAppearing = true
        }
    }

    private var stats: [StatItem] {
        [
            StatItem(value: String(viewModel.techniqueCount), label: "登録技数"),
            StatItem(value: String(viewModel.trainingDayCount), label: "練習日数")
        ]
    }

    private var localAvatarURL: URL? {
        guard let userId = viewModel.userId else { return nil }
        return LocalAvatarStore.avatarURL(for: userId)
    }
}

private struct LoadingView: View {
    let theme: BeltTheme
    @State private var isAnimating = false

    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .stroke(theme.cardBorder, lineWidth: 3)
                    .frame(width: 60, height: 60)

                Circle()
                    .trim(from: 0, to: 0.7)
                    .stroke(theme.primary, lineWidth: 3)
                    .frame(width: 60, height: 60)
                    .rotationEffect(Angle(degrees: isAnimating ? 360 : 0))
                    .animation(.linear(duration: 1.0).repeatForever(autoreverses: false), value: isAnimating)
            }

            Text("読み込み中...")
                .font(.body(14, weight: .medium))
                .foregroundStyle(theme.textMuted)
        }
        .onAppear {
            isAnimating = true
        }
    }
}

private struct ConfigBanner: View {
    let text: String

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.app(size: 12, weight: .semibold))
            Text(text)
                .font(.app(size: 12, weight: .semibold))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color(hex: "#fff7ed"))
        .foregroundStyle(Color(hex: "#c2410c"))
        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}

private struct HeaderView: View {
    let profileName: String
    let avatarUrl: String?
    let localAvatarURL: URL?
    let theme: BeltTheme
    let isAppearing: Bool
    let onOpenSettings: () -> Void

    var body: some View {
        HStack {
            HStack(spacing: 12) {
                AvatarView(name: profileName, avatarUrl: avatarUrl, localAvatarURL: localAvatarURL, theme: theme)
                    .scaleEffect(isAppearing ? 1.0 : 0.8)
                    .opacity(isAppearing ? 1 : 0)

                VStack(alignment: .leading, spacing: 3) {
                    Text("おかえりなさい")
                        .font(.caption(11))
                        .foregroundStyle(theme.textMuted)
                    Text(profileName)
                        .font(.title(15, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                }
            }

            Spacer()

            HStack(spacing: 10) {
                IconCircleButton(systemName: "gearshape", theme: theme, action: onOpenSettings)
            }
        }
        .padding(14)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 12, y: 4)
    }
}

private struct AvatarView: View {
    let name: String
    let avatarUrl: String?
    let localAvatarURL: URL?
    let theme: BeltTheme

    var body: some View {
        ZStack {
            if let localAvatarURL {
                AsyncImage(url: localAvatarURL) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    theme.gradient
                }
            } else if let url = avatarURL {
                AsyncImage(url: url) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    theme.gradient
                }
            } else {
                theme.gradient
            }
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
        .overlay(
            Text(String(name.prefix(1)))
                .font(.app(size: 14, weight: .bold))
                .foregroundStyle(.white)
                .opacity(avatarURL == nil ? 1 : 0)
        )
    }

    private var avatarURL: URL? {
        guard let raw = avatarUrl?.trimmingCharacters(in: .whitespacesAndNewlines), !raw.isEmpty else {
            return nil
        }
        if let url = URL(string: raw), url.scheme != nil {
            return url
        }
        return URL(string: "https://\(raw)")
    }
}

private struct IconCircleButton: View {
    let systemName: String
    let theme: BeltTheme
    let action: () -> Void
    @State private var isPressed = false

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.app(size: 16, weight: .semibold))
                .foregroundStyle(theme.primary)
                .frame(width: 38, height: 38)
                .background(
                    ZStack {
                        theme.background
                        theme.primary.opacity(isPressed ? 0.12 : 0.08)
                    }
                )
                .clipShape(RoundedRectangle(cornerRadius: 13, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 13, style: .continuous)
                        .stroke(theme.cardBorder.opacity(0.5), lineWidth: 1)
                )
                .scaleEffect(isPressed ? 0.92 : 1.0)
                .animation(.easeInOut(duration: 0.15), value: isPressed)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in isPressed = true }
                .onEnded { _ in isPressed = false }
        )
    }
}

private struct BeltCardView: View {
    let theme: BeltTheme
    let beltColor: BeltColor
    let stripes: Int
    let stats: [StatItem]
    let isAppearing: Bool

    var body: some View {
        VStack(spacing: 20) {
            VStack(spacing: 10) {
                BeltStripView(theme: theme, beltColor: beltColor, stripes: stripes)
                    .glowEffect(color: theme.primary.opacity(0.3), radius: 16)
                Text(beltLabel)
                    .font(.display(17, weight: .heavy))
                    .foregroundStyle(theme.textPrimary)
                Text("ストライプ\(stripes)")
                    .font(.caption(12))
                    .foregroundStyle(theme.textMuted)
            }

            Divider()
                .background(theme.cardBorder)
                .opacity(0.6)

            HStack(spacing: 0) {
                ForEach(Array(stats.enumerated()), id: \.element.id) { index, item in
                    StatChip(value: item.value, label: item.label, theme: theme)
                        .frame(maxWidth: .infinity)
                        .opacity(isAppearing ? 1 : 0)
                        .scaleEffect(isAppearing ? 1.0 : 0.8)

                    if index < stats.count - 1 {
                        Rectangle()
                            .fill(theme.cardBorder.opacity(0.6))
                            .frame(width: 1, height: 34)
                            .padding(.horizontal, 6)
                    }
                }
            }
            .padding(.horizontal, 8)
        }
        .padding(18)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .cardShadow(radius: 16, y: 6)
    }

    private var beltLabel: String {
        switch beltColor {
        case .white: return "白帯"
        case .blue: return "青帯"
        case .purple: return "紫帯"
        case .brown: return "茶帯"
        case .black: return "黒帯"
        }
    }
}

private struct BeltStripView: View {
    let theme: BeltTheme
    let beltColor: BeltColor
    let stripes: Int

    var body: some View {
        HStack(spacing: 0) {
            // Left side of belt
            Rectangle()
                .fill(theme.beltGradient)
                .frame(width: 120, height: 28)
                .cornerRadius(4, corners: [.topLeft, .bottomLeft])
                .overlay(
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.25), Color.clear, Color.black.opacity(0.15)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                )
                .overlay(
                    // Fabric texture simulation
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.clear, Color.white.opacity(0.03), Color.clear],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                )

            // Stripe section
            Rectangle()
                .fill(stripeAreaColor)
                .frame(width: stripeWidth, height: 28)
                .overlay(
                    HStack(spacing: stripeSpacing) {
                        ForEach(0..<max(stripes, 0), id: \.self) { _ in
                            Rectangle()
                                .fill(stripeColor)
                                .frame(width: stripeMarkWidth)
                                .shadow(color: Color.black.opacity(0.2), radius: 1, x: 0, y: 1)
                        }
                    }
                )
                .overlay(
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.15), Color.clear, Color.black.opacity(0.12)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                )

            // Right side of belt
            Rectangle()
                .fill(theme.beltGradient)
                .frame(width: 22, height: 28)
                .cornerRadius(4, corners: [.topRight, .bottomRight])
                .overlay(
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [Color.white.opacity(0.2), Color.clear, Color.black.opacity(0.12)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                )
        }
        .shadow(color: Color.black.opacity(0.15), radius: 8, x: 0, y: 4)
        .shadow(color: Color.black.opacity(0.08), radius: 2, x: 0, y: 1)
    }

    private var stripeAreaColor: LinearGradient {
        if beltColor == .black {
            // Red stripe area for black belt
            return LinearGradient(
                colors: [Color(hex: "#c41e3a"), Color(hex: "#8b1a2a")],
                startPoint: .top,
                endPoint: .bottom
            )
        } else {
            // Create gradient for other belts
            let baseColor = theme.beltStripeColor
            return LinearGradient(
                colors: [baseColor.opacity(0.9), baseColor, baseColor.opacity(0.95)],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }

    private var stripeColor: Color {
        // White stripes for all belts (including black belt on red background)
        Color.white.opacity(0.95)
    }

    private var stripeWidth: CGFloat {
        switch beltColor {
        case .black:
            return stripes >= 5 ? 96 : 80
        default:
            return 64
        }
    }

    private var stripeMarkWidth: CGFloat {
        beltColor == .black ? 8 : 6
    }

    private var stripeSpacing: CGFloat {
        beltColor == .black ? 6 : 5
    }
}

private struct StatItem: Identifiable {
    let id = UUID()
    let value: String
    let label: String
}

private struct StatChip: View {
    let value: String
    let label: String
    let theme: BeltTheme

    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.app(size: 16, weight: .bold))
                .foregroundStyle(theme.textPrimary)
            Text(label)
                .font(.app(size: 11, weight: .medium))
                .foregroundStyle(theme.textMuted)
        }
    }
}

private struct WeeklyPracticeView: View {
    let weekdays: [String]
    let practice: [Bool]
    let theme: BeltTheme
    let onTap: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            headerView
            practiceGrid
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .contentShape(Rectangle())
        .onTapGesture {
            onTap()
        }
    }

    private var headerView: some View {
        HStack {
            Text("今週の練習")
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)
            Spacer()
            Text("\(practice.filter { $0 }.count)回")
                .font(.app(size: 12, weight: .semibold))
                .foregroundStyle(theme.textMuted)
        }
    }

    private var practiceGrid: some View {
        HStack(spacing: 0) {
            ForEach(Array(weekdays.enumerated()), id: \.offset) { index, day in
                PracticeDayView(
                    day: day,
                    practiced: practice[safe: index] == true,
                    theme: theme
                )
                .frame(maxWidth: .infinity)
            }
        }
        .padding(.horizontal, 6)
    }
}

private struct PracticeDayView: View {
    let day: String
    let practiced: Bool
    let theme: BeltTheme

    var body: some View {
        VStack(spacing: 6) {
            Text(day)
                .font(.app(size: 10, weight: .medium))
                .foregroundStyle(theme.textMuted)

            ZStack {
                Circle()
                    .fill(practiced ? theme.primary : theme.cardBorder)
                    .frame(width: 24, height: 24)

                if practiced {
                    Image(systemName: "checkmark")
                        .font(.app(size: 10, weight: .bold))
                        .foregroundStyle(.white)
                }
            }
        }
    }
}

private struct RecentTrainingView: View {
    let logs: [TrainingLog]
    let theme: BeltTheme
    let onOpenAll: () -> Void
    let onSelect: (TrainingLog) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("最近の練習")
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                Button(action: onOpenAll) {
                    Text("すべて見る →")
                        .font(.app(size: 12, weight: .semibold))
                        .foregroundStyle(theme.primary)
                }
            }

            VStack(spacing: 10) {
                ForEach(logs) { log in
                    TrainingLogButton(log: log, theme: theme) {
                        onSelect(log)
                    }
                }
            }
        }
    }
}

private struct TechniqueLibraryView: View {
    let techniques: [Technique]
    let theme: BeltTheme
    let onOpenAll: () -> Void
    let onSelect: (Technique) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("技ライブラリ")
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                Button(action: onOpenAll) {
                    Text("すべて見る →")
                        .font(.app(size: 12, weight: .semibold))
                        .foregroundStyle(theme.primary)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(techniques) { technique in
                        TechniqueCardButton(technique: technique, theme: theme) {
                            onSelect(technique)
                        }
                    }
                }
                .padding(.vertical, 2)
            }
        }
    }
}

private struct TechniqueThumbnailView: View {
    let technique: Technique
    let theme: BeltTheme
    @State private var localImage: Image?

    var body: some View {
        ZStack {
            if let localImage {
                localImage
                    .resizable()
                    .scaledToFill()
            } else if let youtubeURL = youtubeThumbnailURL {
                AsyncImage(url: youtubeURL) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    theme.card
                }
            } else {
                theme.card
            }

            Image(systemName: "play.circle.fill")
                .font(.app(size: 28))
                .foregroundStyle(theme.primary)
        }
        .frame(width: 116, height: 68)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .onAppear {
            guard let url = LocalVideoStore.techniqueVideoURLs(for: technique.id).first else { return }
            Task {
                if let uiImage = await VideoThumbnailGenerator.thumbnail(for: url) {
                    localImage = Image(uiImage: uiImage)
                }
            }
        }
    }

    private var youtubeThumbnailURL: URL? {
        guard let raw = technique.videoUrl?.trimmingCharacters(in: .whitespacesAndNewlines), !raw.isEmpty else {
            return nil
        }
        let url = URL(string: raw) ?? URL(string: "https://\(raw)")
        guard let url, let host = url.host?.lowercased() else { return nil }
        var videoId: String?

        if host.contains("youtu.be") {
            videoId = url.path.split(separator: "/").first.map(String.init)
        } else if host.contains("youtube.com") {
            let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
            let queryId = components?.queryItems?.first(where: { $0.name == "v" })?.value
            if let queryId, !queryId.isEmpty {
                videoId = queryId
            } else if url.path.contains("/embed/") {
                videoId = url.path.split(separator: "/").last.map(String.init)
            }
        }

        guard let videoId, !videoId.isEmpty else { return nil }
        return URL(string: "https://img.youtube.com/vi/\(videoId)/hqdefault.jpg")
    }
}

private struct TrainingLogButton: View {
    let log: TrainingLog
    let theme: BeltTheme
    let action: () -> Void
    @State private var isPressed = false

    var body: some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.easeInOut(duration: 0.1)) {
                    isPressed = false
                }
                action()
            }
        }) {
            HStack(spacing: 12) {
                Text(String(log.trainingDate.suffix(2)))
                    .font(.app(size: 12, weight: .bold))
                    .frame(width: 32, height: 32)
                    .background(theme.card)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1)
                    )

                VStack(alignment: .leading, spacing: 4) {
                    Text(log.content ?? log.notes ?? "練習")
                        .font(.app(size: 13, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                        .lineLimit(1)
                    Text(log.durationMinutes.map { "\($0)min" } ?? "")
                        .font(.app(size: 11, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textMuted)
            }
            .padding(10)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
    }
}

private struct TechniqueCardButton: View {
    let technique: Technique
    let theme: BeltTheme
    let action: () -> Void
    @State private var isPressed = false

    var body: some View {
        Button(action: {
            withAnimation(.easeInOut(duration: 0.1)) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation(.easeInOut(duration: 0.1)) {
                    isPressed = false
                }
                action()
            }
        }) {
            VStack(spacing: 8) {
                TechniqueThumbnailView(technique: technique, theme: theme)

                Text(technique.name)
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                    .lineLimit(1)

                Text(technique.techniqueTypeJapanese)
                    .font(.app(size: 10, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }
            .padding(10)
            .frame(width: 150)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
            .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
