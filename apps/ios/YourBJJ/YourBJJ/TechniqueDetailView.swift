import SwiftUI
import PhotosUI
import AVKit

struct TechniqueDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var viewModel: AppViewModel
    let technique: Technique

    @State private var showEdit = false
    @State private var showDeleteConfirm = false
    @State private var showActionSheet = false
    @State private var localVideoURLs: [URL] = []
    @State private var localVideoTitles: [String] = []
    @State private var selectedPlaybackURL: URL?

    // Get the latest technique from viewModel to reflect updates
    private var currentTechnique: Technique {
        viewModel.techniques.first(where: { $0.id == technique.id }) ?? technique
    }

    // Convert old English category IDs to Japanese names for display
    private var displayCategory: String? {
        guard let rawCategory = currentTechnique.category, !rawCategory.isEmpty else {
            return nil
        }

        let mapping: [String: String] = [
            "guard": "ガード（ボトム）",
            "top": "トップポジション",
            "stand": "スタンド",
            "leglock": "レッグロック",
            "turtle": "タートル",
            "back": "バック"
        ]

        // If it's an English ID, convert to Japanese name
        if let japaneseName = mapping[rawCategory] {
            return japaneseName
        }

        // Otherwise return as-is (already Japanese or custom category)
        return rawCategory
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack(alignment: .top, spacing: 8) {
                        Text(currentTechnique.name)
                            .font(.app(size: 24, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                            .lineSpacing(6)

                        Spacer()

                        Button(action: { showActionSheet = true }) {
                            Image(systemName: "ellipsis.circle")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundStyle(theme.textPrimary)
                        }
                        .pressEffect()
                    }

                    if let nameEn = currentTechnique.nameEn, !nameEn.isEmpty {
                        Text(nameEn)
                            .font(.app(size: 15, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.bottom, 4)

                // Category and Type section
                VStack(alignment: .leading, spacing: 12) {
                    // Category
                    if let category = displayCategory {
                        HStack(spacing: 8) {
                            Text("カテゴリ")
                                .font(.app(size: 11, weight: .semibold))
                                .foregroundStyle(theme.textMuted)
                                .textCase(.uppercase)

                            Text(category)
                                .font(.app(size: 13, weight: .medium))
                                .foregroundStyle(theme.textPrimary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                        }
                    }

                    // Type
                    if !currentTechnique.techniqueTypeJapanese.isEmpty {
                        HStack(spacing: 8) {
                            Text("タイプ")
                                .font(.app(size: 11, weight: .semibold))
                                .foregroundStyle(theme.textMuted)
                                .textCase(.uppercase)

                            Text(currentTechnique.techniqueTypeJapanese)
                                .font(.app(size: 13, weight: .medium))
                                .foregroundStyle(theme.textPrimary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 5)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                if let description = currentTechnique.description, !description.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("説明")
                            .font(.app(size: 13, weight: .bold))
                            .foregroundStyle(theme.textPrimary)

                        Text(description)
                            .font(.app(size: 14, weight: .medium))
                            .foregroundStyle(theme.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(14)
                    .background(theme.card)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1)
                    )
                }

                if let videoURL = videoURL, let thumbnailURL = youtubeThumbnailURL {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("YouTube動画")
                            .font(.app(size: 13, weight: .bold))
                            .foregroundStyle(theme.textPrimary)

                        Link(destination: videoURL) {
                            ZStack {
                                AsyncImage(url: thumbnailURL) { image in
                                    image
                                        .resizable()
                                        .scaledToFill()
                                } placeholder: {
                                    Rectangle()
                                        .fill(theme.card)
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 180)
                                .clipped()

                                Image(systemName: "play.circle.fill")
                                    .font(.app(size: 36, weight: .semibold))
                                    .foregroundStyle(.white)
                                    .shadow(radius: 6)
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1)
                            )
                        }
                    }
                }

                if !localVideoURLs.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("自分の動画")
                            .font(.app(size: 13, weight: .bold))
                            .foregroundStyle(theme.textPrimary)

                        ForEach(Array(localVideoURLs.enumerated()), id: \.offset) { index, url in
                            VStack(alignment: .leading, spacing: 6) {
                                LocalVideoThumbnailView(
                                    url: url,
                                    theme: theme
                                )
                                Text(displayTitle(for: index))
                                    .font(.app(size: 12, weight: .medium))
                                    .foregroundStyle(theme.textMuted)
                            }
                            .contentShape(Rectangle())
                            .onTapGesture {
                                selectedPlaybackURL = url
                            }
                        }
                    }
                }

            }
            .padding(.horizontal, 20)
            .padding(.top, 32)
            .padding(.bottom, 96)
            }
            .background(theme.background)

            // Error Popup
            if viewModel.showErrorPopup, let errorMessage = viewModel.errorMessage {
                ErrorPopup(
                    message: errorMessage,
                    theme: theme,
                    onDismiss: { viewModel.dismissError() }
                )
                .transition(.move(edge: .top).combined(with: .opacity))
                .zIndex(99999)
            }

            if showActionSheet {
                TechniqueActionSheet(
                    theme: theme,
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
        .sheet(isPresented: $showEdit, onDismiss: {
            // Reload local video URL after editing
            localVideoURLs = LocalVideoStore.techniqueVideoURLs(for: currentTechnique.id)
            localVideoTitles = LocalVideoStore.techniqueVideoTitles(for: currentTechnique.id)
        }) {
            TechniqueFormView(viewModel: viewModel, initialTechnique: currentTechnique)
        }
        .fullScreenCover(item: Binding(
            get: { selectedPlaybackURL.map { TechniqueDetailVideoURLWrapper(url: $0) } },
            set: { selectedPlaybackURL = $0?.url }
        )) { wrapper in
            VideoPlayerView(url: wrapper.url)
        }
        .alert("削除しますか？", isPresented: $showDeleteConfirm) {
            Button("削除", role: .destructive) {
                Task {
                    await viewModel.deleteTechnique(techniqueId: currentTechnique.id)
                    dismiss()
                }
            }
            Button("キャンセル", role: .cancel) {}
        }
        .onAppear {
            viewModel.recordTechniqueView(currentTechnique.id)
            localVideoURLs = LocalVideoStore.techniqueVideoURLs(for: currentTechnique.id)
            localVideoTitles = LocalVideoStore.techniqueVideoTitles(for: currentTechnique.id)
        }
    }

    private var videoURL: URL? {
        guard let raw = currentTechnique.videoUrl?.trimmingCharacters(in: .whitespacesAndNewlines), !raw.isEmpty else {
            return nil
        }
        if let url = URL(string: raw), url.scheme != nil {
            return url
        }
        return URL(string: "https://\(raw)")
    }

    private var youtubeThumbnailURL: URL? {
        guard let url = videoURL, let host = url.host else { return nil }
        let lowerHost = host.lowercased()
        var videoId: String?

        if lowerHost.contains("youtu.be") {
            videoId = url.path.split(separator: "/").first.map(String.init)
        } else if lowerHost.contains("youtube.com") {
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

private struct TechniqueActionSheet: View {
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
                            Text("技メニュー")
                                .font(.app(size: 16, weight: .bold))
                                .foregroundStyle(theme.textPrimary)
                            Text("操作を選択してください")
                                .font(.app(size: 12, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }

                        VStack(spacing: 10) {
                            TechniqueActionRow(
                                theme: theme,
                                title: "編集",
                                subtitle: "技の情報を編集する",
                                systemImage: "pencil",
                                action: onEdit
                            )

                            TechniqueActionRow(
                                theme: theme,
                                title: "削除",
                                subtitle: "この技を削除する",
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

private struct TechniqueActionRow: View {
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

private struct TechniqueDetailVideoURLWrapper: Identifiable {
    let id = UUID()
    let url: URL
}

private struct LocalVideoSection: View {
    let theme: BeltTheme
    let localVideoURL: URL?
    @Binding var selectedVideoItem: PhotosPickerItem?
    let onPlay: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("自分の動画")
                .font(.app(size: 12, weight: .medium))
                .foregroundStyle(theme.textMuted)

            if let localVideoURL {
                VideoThumbnailView(
                    url: localVideoURL,
                    theme: theme,
                    onPlay: onPlay,
                    onDelete: onDelete
                )
            } else {
                PhotosPicker(selection: $selectedVideoItem, matching: .videos) {
                    HStack(spacing: 8) {
                        Image(systemName: "video.badge.plus")
                        Text("端末の動画を追加")
                            .font(.app(size: 13, weight: .semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(theme.card)
                    .foregroundStyle(theme.textPrimary)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1)
                    )
                }
            }
        }
    }
}

private struct VideoThumbnailView: View {
    let url: URL
    let theme: BeltTheme
    let onPlay: () -> Void
    let onDelete: () -> Void
    @State private var image: Image?

    var body: some View {
        ZStack(alignment: .topTrailing) {
            Button(action: onPlay) {
                ZStack {
                    if let image {
                        image
                            .resizable()
                            .scaledToFill()
                    } else {
                        Rectangle()
                            .fill(theme.card)
                    }
                    Image(systemName: "play.circle.fill")
                        .font(.app(size: 36, weight: .semibold))
                        .foregroundStyle(.white)
                        .shadow(radius: 6)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 180)
                .clipped()
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(theme.cardBorder, lineWidth: 1)
                )
            }
            .buttonStyle(.plain)

            Button(action: onDelete) {
                Image(systemName: "xmark.circle.fill")
                    .font(.app(size: 24, weight: .semibold))
                    .foregroundStyle(.white, .red)
                    .shadow(radius: 4)
            }
            .buttonStyle(.plain)
            .padding(8)
        }
        .onAppear {
            Task {
                if let uiImage = await VideoThumbnailGenerator.thumbnail(for: url) {
                    image = Image(uiImage: uiImage)
                }
            }
        }
    }
}

private struct LocalVideoThumbnailView: View {
    let url: URL
    let theme: BeltTheme
    @State private var image: Image?

    var body: some View {
        ZStack {
            if let image {
                image
                    .resizable()
                    .scaledToFill()
            } else {
                Rectangle()
                    .fill(theme.card)
            }

            Image(systemName: "play.circle.fill")
                .font(.app(size: 36, weight: .semibold))
                .foregroundStyle(.white)
                .shadow(radius: 6)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 180)
        .clipped()
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .onAppear {
            Task {
                if let uiImage = await VideoThumbnailGenerator.thumbnail(for: url) {
                    image = Image(uiImage: uiImage)
                }
            }
        }
    }
}


private struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing)
        for (index, subview) in subviews.enumerated() {
            let position = result.positions[index]
            subview.place(at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y), proposal: .unspecified)
        }
    }

    struct FlowResult {
        var size: CGSize
        var positions: [CGPoint]

        init(in width: CGFloat, subviews: Subviews, spacing: CGFloat) {
            var positions: [CGPoint] = []
            var size: CGSize = .zero
            var currentX: CGFloat = 0
            var currentY: CGFloat = 0
            var lineHeight: CGFloat = 0

            for subview in subviews {
                let subviewSize = subview.sizeThatFits(.unspecified)

                // Check if we need to wrap to next line
                if currentX > 0 && currentX + subviewSize.width > width {
                    currentX = 0
                    currentY += lineHeight + spacing
                    lineHeight = 0
                }

                positions.append(CGPoint(x: currentX, y: currentY))
                currentX += subviewSize.width + spacing
                lineHeight = max(lineHeight, subviewSize.height)
                size.width = max(size.width, currentX - spacing)
            }

            size.height = currentY + lineHeight
            size.width = width
            self.size = size
            self.positions = positions
        }
    }
}
