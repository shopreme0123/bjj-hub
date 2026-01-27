import SwiftUI
import PhotosUI
import AVKit
import UIKit

struct IdentifiableTechniqueVideo: Identifiable {
    let id = UUID()
    let url: URL
    var title: String
}

struct TechniqueVideoURLWrapper: Identifiable {
    let id = UUID()
    let url: URL
}

struct TechniqueFormView: View {
    @ObservedObject var viewModel: AppViewModel
    let initialTechnique: Technique?

    @Environment(\.dismiss) private var dismiss

    @State private var name: String = ""
    @State private var nameEn: String = ""
    @State private var category: String = ""
    @State private var techniqueType: String = "submission"
    @State private var descriptionText: String = ""
    @State private var videoUrl: String = ""
    @State private var selectedVideoItems: [PhotosPickerItem] = []
    @State private var localVideos: [IdentifiableTechniqueVideo] = []
    @State private var selectedPlaybackURL: URL?
    @State private var isLoadingVideos = false

    // Combine default and custom categories from AppViewModel
    private var categories: [TechniqueCategory] {
        let defaultCats = TechniqueCategory.defaultCategories
        let customCats = viewModel.customCategories

        print("🔍 [DEBUG] Default categories: \(defaultCats.count)")
        print("🔍 [DEBUG] Custom categories from AppViewModel: \(customCats.count)")

        let result = defaultCats + customCats
        print("🔍 [DEBUG] Total categories available: \(result.count)")

        return result
    }

    private let types: [(id: String, label: String)] = [
        ("submission", "サブミッション"),
        ("sweep", "スイープ"),
        ("pass", "パス"),
        ("escape", "エスケープ"),
        ("takedown", "テイクダウン"),
        ("position", "ポジション"),
        ("guard", "ガード"),
        ("throw", "投げ技"),
        ("defense", "ディフェンス"),
        ("transition", "トランジション"),
        ("other", "その他")
    ]

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack(spacing: 0) {
                    Button(action: { dismiss() }) {
                        Text("戻る")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text(initialTechnique == nil ? "技を追加" : "技を編集")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: { Task { await save() } }) {
                        Text("保存")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? theme.textMuted : theme.primary)
                            .frame(width: 70, alignment: .trailing)
                    }
                    .padding(.trailing, 4)
                    .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(theme.card)
                .overlay(
                    Rectangle()
                        .fill(theme.cardBorder)
                        .frame(height: 1),
                    alignment: .bottom
                )

                // Form Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Basic Info Section
                        VStack(alignment: .leading, spacing: 16) {
                            SectionHeader(title: "基本情報", theme: theme)

                            CustomTextField(
                                title: "技名",
                                text: $name,
                                theme: theme,
                                placeholder: "例: 腕十字"
                            )

                            CustomTextField(
                                title: "英語名",
                                text: $nameEn,
                                theme: theme,
                                placeholder: "例: Armbar"
                            )

                            // Category Picker
                            VStack(alignment: .leading, spacing: 10) {
                                Text("カテゴリ")
                                    .font(.app(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.textPrimary)

                                Picker("カテゴリ", selection: $category) {
                                    Text("未選択").tag("")
                                    ForEach(categories) { cat in
                                        Text("\(cat.icon) \(cat.name)").tag(cat.name)
                                    }
                                }
                                .pickerStyle(.menu)
                                .padding(14)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                            }

                            // Technique Type Selector
                            VStack(alignment: .leading, spacing: 8) {
                                Text("タイプ")
                                    .font(.app(size: 13, weight: .medium))
                                    .foregroundStyle(theme.textMuted)

                                FlowLayout(spacing: 8) {
                                    ForEach(types, id: \.id) { type in
                                        TypeChip(
                                            label: type.label,
                                            isSelected: techniqueType == type.id,
                                            theme: theme,
                                            action: { techniqueType = type.id }
                                        )
                                    }
                                }
                            }
                        }

                        // Details Section
                        VStack(alignment: .leading, spacing: 16) {
                            SectionHeader(title: "詳細", theme: theme)

                            CustomTextEditor(
                                title: "説明",
                                text: $descriptionText,
                                theme: theme,
                                placeholder: "技の詳細な説明..."
                            )

                            // Local Video Section
                            VStack(alignment: .leading, spacing: 10) {
                                Text("自分の動画")
                                    .font(.app(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.textPrimary)
                                Text("最大10件")
                                    .font(.app(size: 12, weight: .medium))
                                    .foregroundStyle(theme.textMuted)

                                PhotosPicker(
                                    selection: $selectedVideoItems,
                                    maxSelectionCount: 10,
                                    matching: .videos
                                ) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "video.badge.plus")
                                            .font(.app(size: 14, weight: .semibold))
                                        Text("動画を選択")
                                            .font(.app(size: 15, weight: .semibold))
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 14)
                                    .background(theme.card)
                                    .foregroundStyle(theme.textPrimary)
                                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .stroke(theme.cardBorder, lineWidth: 1)
                                    )
                                }

                                if isLoadingVideos {
                                    HStack {
                                        ProgressView()
                                            .scaleEffect(0.8)
                                        Text("動画を読み込み中...")
                                            .font(.app(size: 13, weight: .medium))
                                            .foregroundStyle(theme.textMuted)
                                    }
                                    .padding(.vertical, 8)
                                }

                                if !localVideos.isEmpty {
                                    ForEach($localVideos) { $video in
                                        HStack(spacing: 12) {
                                            TechniqueFormVideoThumbnailView(url: video.url, theme: theme)
                                                .frame(width: 80, height: 45)
                                                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))

                                            TextField("動画名", text: $video.title)
                                                .font(.app(size: 14, weight: .medium))
                                                .textInputAutocapitalization(.never)

                                            Spacer()

                                            Button(action: {
                                                selectedPlaybackURL = video.url
                                            }) {
                                                Image(systemName: "play.circle.fill")
                                                    .font(.system(size: 24))
                                                    .foregroundStyle(theme.primary)
                                            }

                                            Button(role: .destructive) {
                                                localVideos.removeAll { $0.id == video.id }
                                            } label: {
                                                Image(systemName: "trash")
                                                    .foregroundStyle(.red)
                                            }
                                        }
                                    }
                                }
                            }

                            CustomTextField(
                                title: "YouTube URL",
                                text: $videoUrl,
                                theme: theme,
                                placeholder: "https://youtube.com/..."
                            )
                        }

                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 60)
                }
            }

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
        }
        .sheet(item: Binding(
            get: { selectedPlaybackURL.map { TechniqueVideoURLWrapper(url: $0) } },
            set: { selectedPlaybackURL = $0?.url }
        )) { wrapper in
            VideoPlayer(player: AVPlayer(url: wrapper.url))
                .ignoresSafeArea()
        }
        .onAppear {
            if let technique = initialTechnique {
                name = technique.name
                nameEn = technique.nameEn ?? ""

                // Convert old English category IDs to Japanese names
                let rawCategory = technique.category ?? ""
                category = convertCategoryToJapanese(rawCategory)

                techniqueType = technique.techniqueType ?? "submission"
                descriptionText = technique.description ?? ""
                videoUrl = technique.videoUrl ?? ""
                // Load existing local videos if available
                let savedURLs = LocalVideoStore.techniqueVideoURLs(for: technique.id)
                let savedTitles = LocalVideoStore.techniqueVideoTitles(for: technique.id)
                localVideos = savedURLs.enumerated().map { index, url in
                    let title = index < savedTitles.count ? savedTitles[index] : ""
                    return IdentifiableTechniqueVideo(url: url, title: title)
                }
            }
        }
        .onChange(of: selectedVideoItems) { oldValue, newValue in
            Task {
                isLoadingVideos = true
                print("📹 [DEBUG] Selected video items changed: \(newValue.count) items")

                let newItems = newValue.filter { newItem in
                    !oldValue.contains(where: { $0.itemIdentifier == newItem.itemIdentifier })
                }

                for item in newItems {
                    if let movie = try? await item.loadTransferable(type: Movie.self) {
                        print("📹 [DEBUG] Loaded video: \(movie.url.path)")
                        localVideos.append(IdentifiableTechniqueVideo(url: movie.url, title: ""))
                    }
                }

                print("📹 [DEBUG] Total videos after loading: \(localVideos.count)")
                isLoadingVideos = false
            }
        }
    }

    // Convert old English category IDs to Japanese names
    private func convertCategoryToJapanese(_ rawCategory: String) -> String {
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

    private func save() async {
        let form = TechniqueForm(
            name: name,
            nameEn: nameEn.isEmpty ? nil : nameEn,
            category: category.isEmpty ? nil : category,
            techniqueType: techniqueType,
            description: descriptionText.isEmpty ? nil : descriptionText,
            videoUrl: videoUrl.isEmpty ? nil : videoUrl,
            tags: nil,
            masteryLevel: nil
        )

        if let technique = initialTechnique {
            print("💾 [DEBUG] Saving technique: \(technique.id)")
            print("💾 [DEBUG] Selected videos count: \(localVideos.count)")

            let videoURLs = localVideos.map { $0.url }
            let videoTitles = localVideos.map { $0.title }

            if localVideos.isEmpty {
                print("🗑️ [DEBUG] Deleting videos for technique: \(technique.id)")
                LocalVideoStore.deleteTechniqueVideos(for: technique.id)
                print("✅ [DEBUG] Videos deleted")
            } else {
                print("💾 [DEBUG] Saving \(localVideos.count) videos for technique: \(technique.id)")
                do {
                    try LocalVideoStore.saveTechniqueVideos(from: videoURLs, titles: videoTitles, techniqueId: technique.id)
                    print("✅ [DEBUG] Videos saved successfully")
                } catch {
                    print("❌ [DEBUG] Failed to save videos: \(error)")
                }
            }

            await viewModel.updateTechnique(techniqueId: technique.id, form: form)
        } else {
            if let newTechnique = await viewModel.createTechnique(form: form) {
                print("💾 [DEBUG] Created new technique: \(newTechnique.id)")
                print("💾 [DEBUG] Selected videos count: \(localVideos.count)")

                // Save local video if selected
                if !localVideos.isEmpty {
                    let videoURLs = localVideos.map { $0.url }
                    let videoTitles = localVideos.map { $0.title }
                    print("💾 [DEBUG] Saving \(localVideos.count) videos for new technique")
                    do {
                        try LocalVideoStore.saveTechniqueVideos(from: videoURLs, titles: videoTitles, techniqueId: newTechnique.id)
                        print("✅ [DEBUG] Videos saved successfully for new technique")
                    } catch {
                        print("❌ [DEBUG] Failed to save videos: \(error)")
                    }
                }
            }
        }

        dismiss()
    }
}

// MARK: - Supporting Views

private struct SectionHeader: View {
    let title: String
    let theme: BeltTheme

    var body: some View {
        Text(title)
            .font(.app(size: 16, weight: .bold))
            .foregroundStyle(theme.textPrimary)
            .padding(.bottom, 4)
    }
}

private struct CustomTextField: View {
    let title: String
    @Binding var text: String
    let theme: BeltTheme
    let placeholder: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)

            TextField(placeholder, text: $text)
                .font(.app(size: 15, weight: .medium))
                .foregroundStyle(theme.textPrimary)
                .padding(14)
                .background(theme.card)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(theme.cardBorder, lineWidth: 1)
                )
        }
    }
}

private struct CustomTextEditor: View {
    let title: String
    @Binding var text: String
    let theme: BeltTheme
    let placeholder: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(.app(size: 15, weight: .medium))
                        .foregroundStyle(theme.textMuted.opacity(0.5))
                        .padding(.horizontal, 18)
                        .padding(.vertical, 14)
                }

                TextEditor(text: $text)
                    .font(.app(size: 15, weight: .medium))
                    .foregroundStyle(theme.textPrimary)
                    .scrollContentBackground(.hidden)
                    .frame(height: 120)
                    .padding(10)
            }
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
        }
    }
}

private struct TypeChip: View {
    let label: String
    let isSelected: Bool
    let theme: BeltTheme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(isSelected ? .white : theme.textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(isSelected ? theme.primary : theme.card)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(isSelected ? theme.primary.opacity(0.3) : theme.cardBorder, lineWidth: isSelected ? 2 : 1)
                )
                .shadow(
                    color: isSelected ? theme.primary.opacity(0.2) : Color.clear,
                    radius: isSelected ? 4 : 0,
                    x: 0,
                    y: isSelected ? 2 : 0
                )
        }
        .buttonStyle(.plain)
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

private struct TechniqueFormVideoThumbnailView: View {
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
                ProgressView()
                    .scaleEffect(0.7)
                    .tint(theme.primary)
            } else {
                Image(systemName: "video.slash")
                    .font(.system(size: 20))
                    .foregroundStyle(theme.textMuted)
            }
        }
        .background(theme.card)
        .task {
            isLoading = true
            thumbnail = await VideoThumbnailGenerator.thumbnail(for: url)
            isLoading = false
        }
    }
}

struct Movie: Transferable {
    let url: URL

    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(contentType: .movie) { movie in
            SentTransferredFile(movie.url)
        } importing: { received in
            let copy = URL.documentsDirectory.appending(path: "movie-\(UUID().uuidString).mov")
            try FileManager.default.copyItem(at: received.file, to: copy)
            return Self.init(url: copy)
        }
    }
}
