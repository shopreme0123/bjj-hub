import SwiftUI
import AVKit
import UIKit

struct DiaryDetailView: View {
    @ObservedObject var viewModel: AppViewModel
    let log: TrainingLog

    @State private var showEdit = false
    @State private var showDeleteConfirm = false
    @State private var showActionSheet = false
    @State private var selectedVideoURL: URL?
    @State private var localVideoURLs: [URL] = []
    @State private var localVideoTitles: [String] = []
    @Environment(\.dismiss) private var dismiss

    // Get the latest log from viewModel to reflect updates
    private var currentLog: TrainingLog {
        viewModel.trainingLogs.first(where: { $0.id == log.id }) ?? log
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Date header with gradient background
                    VStack(spacing: 8) {
                        Text(formattedDate)
                            .font(.app(size: 24, weight: .heavy))
                            .foregroundStyle(.white)

                        HStack(spacing: 16) {
                            if let startTime = currentLog.startTime, let endTime = currentLog.endTime {
                                Label("\(formatTime(startTime)) - \(formatTime(endTime))", systemImage: "clock.fill")
                                    .font(.app(size: 13, weight: .semibold))
                                    .foregroundStyle(.white.opacity(0.9))
                            } else if let duration = currentLog.durationMinutes {
                                Label("\(duration)分", systemImage: "clock.fill")
                                    .font(.app(size: 13, weight: .semibold))
                                    .foregroundStyle(.white.opacity(0.9))
                            }

                            if let condition = currentLog.condition {
                                Label(conditionLabel(condition), systemImage: conditionIcon(condition))
                                    .font(.app(size: 13, weight: .semibold))
                                    .foregroundStyle(.white.opacity(0.9))
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 24)
                    .background(
                        LinearGradient(
                            colors: [theme.primary, theme.primary.opacity(0.8)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay(alignment: .topTrailing) {
                        Button(action: { showActionSheet = true }) {
                            Image(systemName: "ellipsis.circle")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundStyle(.white)
                                .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                                .padding(12)
                        }
                        .pressEffect()
                    }
                    .padding(.horizontal, 16)

                    // Content section
                    if let content = currentLog.content, !content.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: "text.alignleft")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("練習内容")
                                    .font(.app(size: 14, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            Text(content)
                                .font(.app(size: 14, weight: .medium))
                                .foregroundStyle(theme.textPrimary)
                                .lineSpacing(4)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(16)
                        .background(theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )
                        .padding(.horizontal, 16)
                    }

                    // Notes section
                    if let notes = currentLog.notes, !notes.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: "note.text")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("メモ")
                                    .font(.app(size: 14, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            Text(notes)
                                .font(.app(size: 14, weight: .medium))
                                .foregroundStyle(theme.textPrimary)
                                .lineSpacing(4)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(16)
                        .background(theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )
                        .padding(.horizontal, 16)
                    }

                    // Videos section
                    if !localVideoURLs.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "video.fill")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("動画 (\(localVideoURLs.count))")
                                    .font(.app(size: 14, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }
                            .padding(.horizontal, 16)

                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 12) {
                                    ForEach(Array(localVideoURLs.enumerated()), id: \.offset) { index, url in
                                        Button(action: {
                                            selectedVideoURL = url
                                        }) {
                                            VStack(spacing: 8) {
                                                ZStack {
                                                    DiaryDetailVideoThumbnailView(url: url, theme: theme)
                                                        .frame(width: 160, height: 90)
                                                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                                                    Image(systemName: "play.circle.fill")
                                                        .font(.system(size: 40, weight: .semibold))
                                                        .foregroundStyle(.white)
                                                        .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                                                }

                                                Text(displayTitle(for: index))
                                                    .font(.app(size: 12, weight: .medium))
                                                    .foregroundStyle(theme.textMuted)
                                            }
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, 16)
                            }
                        }
                    }
                }
                .padding(.top, 28)
                .padding(.bottom, 96)
            }
            .background(theme.background)
        }
        .sheet(isPresented: $showEdit, onDismiss: {
            // Reload videos after editing
            localVideoURLs = LocalVideoStore.diaryVideoURLs(for: currentLog.id)
            localVideoTitles = LocalVideoStore.diaryVideoTitles(for: currentLog.id)
        }) {
            DiaryFormView(viewModel: viewModel, initialLog: currentLog, initialDate: nil)
        }
        .fullScreenCover(item: Binding(
            get: { selectedVideoURL.map { VideoURLWrapper(url: $0) } },
            set: { selectedVideoURL = $0?.url }
        )) { wrapper in
            VideoPlayerView(url: wrapper.url)
        }
        .alert("削除しますか？", isPresented: $showDeleteConfirm) {
            Button("削除", role: .destructive) {
                Task {
                    // Delete videos first
                    LocalVideoStore.deleteDiaryVideos(for: currentLog.id)
                    await viewModel.deleteTrainingLog(logId: currentLog.id)
                    dismiss()
                }
            }
            Button("キャンセル", role: .cancel) {}
        }
        .overlay {
            if showActionSheet {
                DiaryActionSheet(
                    theme: BeltTheme(belt: viewModel.beltColor),
                    onEdit: {
                        showActionSheet = false
                        showEdit = true
                    },
                    onDelete: {
                        showActionSheet = false
                        showDeleteConfirm = true
                    },
                    onDismiss: { showActionSheet = false }
                )
                .zIndex(100000)
            }
        }
        .onAppear {
            // Load videos from local storage
            localVideoURLs = LocalVideoStore.diaryVideoURLs(for: currentLog.id)
            localVideoTitles = LocalVideoStore.diaryVideoTitles(for: currentLog.id)
            print("📹 [DEBUG DiaryDetailView] Loaded \(localVideoURLs.count) videos for log: \(currentLog.id)")
        }
        .onChange(of: currentLog.id) {
            // Reload videos when log changes
            localVideoURLs = LocalVideoStore.diaryVideoURLs(for: currentLog.id)
            localVideoTitles = LocalVideoStore.diaryVideoTitles(for: currentLog.id)
            print("📹 [DEBUG DiaryDetailView] Reloaded \(localVideoURLs.count) videos for log: \(currentLog.id)")
        }
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let date = formatter.date(from: currentLog.trainingDate) else {
            return currentLog.trainingDate
        }

        formatter.dateFormat = "M月d日 (E)"
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: date)
    }

    private func conditionLabel(_ condition: Int) -> String {
        switch condition {
        case 1: return "低め"
        case 2: return "やや低め"
        case 3: return "普通"
        case 4: return "良い"
        case 5: return "最高"
        default: return "普通"
        }
    }

    private func conditionIcon(_ condition: Int) -> String {
        switch condition {
        case 1: return "battery.25"
        case 2: return "battery.50"
        case 3: return "battery.75"
        case 4, 5: return "battery.100"
        default: return "battery.75"
        }
    }

    private func formatTime(_ timeString: String) -> String {
        let components = timeString.split(separator: ":")
        guard components.count >= 2 else { return timeString }
        return "\(components[0]):\(components[1])"
    }

    private func displayTitle(for index: Int) -> String {
        if index < localVideoTitles.count {
            let title = localVideoTitles[index].trimmingCharacters(in: .whitespacesAndNewlines)
            if !title.isEmpty {
                return title
            }
        }
        return "動画 \(index + 1)"
    }
}

private struct DiaryActionSheet: View {
    let theme: BeltTheme
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onDismiss: () -> Void

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                Color.black.opacity(0.35)
                    .ignoresSafeArea()
                    .onTapGesture { onDismiss() }

                VStack(spacing: 0) {
                    Spacer()

                    VStack(spacing: 16) {
                        RoundedRectangle(cornerRadius: 3, style: .continuous)
                            .fill(theme.cardBorder)
                            .frame(width: 36, height: 5)
                            .padding(.top, 8)

                        VStack(spacing: 6) {
                            Text("日記メニュー")
                                .font(.app(size: 16, weight: .bold))
                                .foregroundStyle(theme.textPrimary)
                            Text("操作を選択してください")
                                .font(.app(size: 12, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }

                        VStack(spacing: 10) {
                            DiaryActionRow(
                                theme: theme,
                                title: "編集",
                                subtitle: "日記の内容を編集する",
                                systemImage: "pencil",
                                action: onEdit
                            )

                            DiaryActionRow(
                                theme: theme,
                                title: "削除",
                                subtitle: "この日記を削除する",
                                systemImage: "trash",
                                action: onDelete,
                                isDestructive: true
                            )
                        }

                        Button(action: onDismiss) {
                            Text("キャンセル")
                                .font(.app(size: 14, weight: .semibold))
                                .frame(maxWidth: .infinity)
                                .padding(12)
                                .foregroundStyle(theme.textMuted)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                        }
                        .pressEffect()
                        .padding(.bottom, 6)
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                    .frame(maxWidth: .infinity)
                    .background(theme.background)
                    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 22, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.2), radius: 18, x: 0, y: 8)
                    .padding(.horizontal, 16)
                    .padding(.bottom, proxy.safeAreaInsets.bottom + 12)
                }
            }
        }
    }
}

private struct DiaryActionRow: View {
    let theme: BeltTheme
    let title: String
    let subtitle: String
    let systemImage: String
    let action: () -> Void
    var isDestructive: Bool = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.app(size: 18, weight: .semibold))
                    .foregroundStyle(isDestructive ? .white : theme.primary)
                    .frame(width: 34, height: 34)
                    .background(isDestructive ? Color.red.opacity(0.85) : theme.primary.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.app(size: 14, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                    Text(subtitle)
                        .font(.app(size: 12, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                }

                Spacer()
            }
            .padding(14)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
        }
        .pressEffect()
    }
}

struct VideoURLWrapper: Identifiable {
    let id = UUID()
    let url: URL
}

private struct DiaryDetailVideoThumbnailView: View {
    let url: URL
    let theme: BeltTheme

    @State private var thumbnail: UIImage?
    @State private var isLoading = true

    var body: some View {
        ZStack {
            if let thumbnail {
                Image(uiImage: thumbnail)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else if isLoading {
                ZStack {
                    theme.primary.opacity(0.1)
                    ProgressView()
                        .scaleEffect(0.9)
                        .tint(theme.primary)
                }
            } else {
                ZStack {
                    theme.primary.opacity(0.1)
                    Image(systemName: "video.slash")
                        .font(.system(size: 24))
                        .foregroundStyle(theme.textMuted)
                }
            }
        }
        .task {
            isLoading = true
            thumbnail = await VideoThumbnailGenerator.thumbnail(for: url)
            isLoading = false
        }
    }
}

struct VideoPlayerView: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VideoPlayer(player: AVPlayer(url: url))
                .ignoresSafeArea()

            VStack {
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 32, weight: .semibold))
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.3), radius: 4, x: 0, y: 2)
                    }
                    .padding(.trailing, 16)
                    .padding(.top, 36)
                }
                Spacer()
            }
        }
    }
}
