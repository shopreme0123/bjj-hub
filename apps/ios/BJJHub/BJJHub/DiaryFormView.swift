import SwiftUI
import PhotosUI
import AVFoundation
import UIKit

// Wrapper to give each video URL a stable identifier
struct IdentifiableVideo: Identifiable {
    let id = UUID()
    let url: URL
    var title: String
}

struct DiaryFormView: View {
    @ObservedObject var viewModel: AppViewModel
    let initialLog: TrainingLog?
    let initialDate: String?

    @Environment(\.dismiss) private var dismiss

    @State private var date: Date
    @State private var startTime: Date?
    @State private var endTime: Date?
    @State private var useTimeEntry = false
    @State private var durationMinutes = ""
    @State private var content = ""
    @State private var notes = ""
    @State private var condition: Double = 3
    @State private var selectedVideoItems: [PhotosPickerItem] = []
    @State private var identifiableVideos: [IdentifiableVideo] = []
    @State private var isLoadingVideos = false

    init(viewModel: AppViewModel, initialLog: TrainingLog?, initialDate: String?) {
        self.viewModel = viewModel
        self.initialLog = initialLog
        self.initialDate = initialDate

        // Initialize date based on initialDate or use today
        if let initialDate {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "yyyy-MM-dd"
            _date = State(initialValue: dateFormatter.date(from: initialDate) ?? Date())
            print("📅 [DEBUG DiaryFormView init] Set date from initialDate: \(initialDate)")
        } else {
            _date = State(initialValue: Date())
            print("📅 [DEBUG DiaryFormView init] Set date to today")
        }
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Button(action: { dismiss() }) {
                        Text("戻る")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text(initialLog == nil ? "記録を追加" : "記録を編集")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: { Task { await save() } }) {
                        Text("保存")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(isLoadingVideos ? theme.textMuted : theme.primary)
                            .frame(width: 70, alignment: .trailing)
                    }
                    .padding(.trailing, 4)
                    .disabled(isLoadingVideos)
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

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        VStack(alignment: .leading, spacing: 16) {
                            DiarySectionHeader(title: "基本", theme: theme)

                            DiaryLabeledCard(title: "日付", theme: theme) {
                                DatePicker("", selection: $date, displayedComponents: .date)
                                    .labelsHidden()
                                    .datePickerStyle(.compact)
                            }

                            DiaryLabeledCard(title: "時刻で入力", theme: theme) {
                                Toggle("", isOn: $useTimeEntry)
                                    .labelsHidden()
                                    .tint(theme.primary)
                            }

                            if useTimeEntry {
                                DiaryLabeledCard(title: "開始時刻", theme: theme) {
                                    DatePicker("", selection: Binding(
                                        get: { startTime ?? date },
                                        set: { startTime = $0 }
                                    ), displayedComponents: .hourAndMinute)
                                    .labelsHidden()
                                    .datePickerStyle(.compact)
                                }

                                DiaryLabeledCard(title: "終了時刻", theme: theme) {
                                    DatePicker("", selection: Binding(
                                        get: { endTime ?? date },
                                        set: { endTime = $0 }
                                    ), displayedComponents: .hourAndMinute)
                                    .labelsHidden()
                                    .datePickerStyle(.compact)
                                }

                                if let start = startTime, let end = endTime, end > start {
                                    let minutes = Int(end.timeIntervalSince(start) / 60)
                                    Text("練習時間: \(minutes)分")
                                        .font(.app(size: 13, weight: .medium))
                                        .foregroundStyle(theme.primary)
                                }
                            } else {
                                DiaryTextField(
                                    title: "練習時間 (分)",
                                    text: $durationMinutes,
                                    theme: theme
                                )
                                .keyboardType(.numberPad)
                            }

                            VStack(alignment: .leading, spacing: 10) {
                                HStack {
                                    Text("コンディション")
                                        .font(.app(size: 14, weight: .semibold))
                                        .foregroundStyle(theme.textPrimary)
                                    Spacer()
                                    Text(conditionLabel)
                                        .font(.app(size: 12, weight: .medium))
                                        .foregroundStyle(theme.textMuted)
                                }
                                DiaryCard(theme: theme) {
                                    Slider(value: $condition, in: 1...5, step: 1)
                                        .tint(theme.primary)
                                }
                            }
                        }

                        VStack(alignment: .leading, spacing: 16) {
                            DiarySectionHeader(title: "内容", theme: theme)
                            DiaryTextEditor(title: "練習内容", text: $content, theme: theme)
                        }

                        VStack(alignment: .leading, spacing: 16) {
                            DiarySectionHeader(title: "メモ", theme: theme)
                            DiaryTextEditor(title: "メモ", text: $notes, theme: theme)
                        }

                        VStack(alignment: .leading, spacing: 12) {
                            DiarySectionHeader(title: "動画", theme: theme)
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

                            ForEach($identifiableVideos) { $identifiableVideo in
                                HStack(spacing: 12) {
                                    DiaryFormVideoThumbnailView(url: identifiableVideo.url, theme: theme)
                                        .frame(width: 80, height: 45)
                                        .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))

                                    VStack(alignment: .leading, spacing: 2) {
                                        TextField("動画名", text: $identifiableVideo.title)
                                            .font(.app(size: 14, weight: .medium))
                                            .textInputAutocapitalization(.never)
                                    }

                                    Spacer()

                                    Button(role: .destructive) {
                                        withAnimation {
                                            print("🗑️ [DEBUG DiaryFormView] Removing video with ID: \(identifiableVideo.id)")
                                            print("📹 [DEBUG DiaryFormView] Video filename: \(identifiableVideo.url.lastPathComponent)")
                                            print("📹 [DEBUG DiaryFormView] Before removal count: \(identifiableVideos.count)")
                                            identifiableVideos.removeAll { $0.id == identifiableVideo.id }
                                            print("📹 [DEBUG DiaryFormView] After removal count: \(identifiableVideos.count)")
                                            print("📹 [DEBUG DiaryFormView] Remaining videos: \(identifiableVideos.map { $0.url.lastPathComponent })")
                                        }
                                    } label: {
                                        Image(systemName: "trash")
                                            .foregroundStyle(.red)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 60)
                }
            }
        }
        .onChange(of: selectedVideoItems) { oldValue, newValue in
            Task {
                isLoadingVideos = true

                // 新しく選択された動画のみを追加（既存のidentifiableVideosは保持）
                let newItems = newValue.filter { newItem in
                    !oldValue.contains(where: { $0.itemIdentifier == newItem.itemIdentifier })
                }

                print("📹 [DEBUG DiaryFormView] onChange triggered")
                print("📹 [DEBUG DiaryFormView] Old items count: \(oldValue.count)")
                print("📹 [DEBUG DiaryFormView] New items count: \(newValue.count)")
                print("📹 [DEBUG DiaryFormView] Loading \(newItems.count) new videos")
                print("📹 [DEBUG DiaryFormView] Current videos before adding: \(identifiableVideos.count)")

                for item in newItems {
                    if let movie = try? await item.loadTransferable(type: Movie.self) {
                        let identifiableVideo = IdentifiableVideo(url: movie.url, title: "")
                        identifiableVideos.append(identifiableVideo)
                        print("📹 [DEBUG DiaryFormView] Added video: \(movie.url.lastPathComponent) with ID: \(identifiableVideo.id)")
                    }
                }
                print("📹 [DEBUG DiaryFormView] Total videos after adding: \(identifiableVideos.count)")

                isLoadingVideos = false
            }
        }
        .onAppear {
            print("📹 [DEBUG DiaryFormView] onAppear called")

            // PhotosPickerの選択状態をクリア（モーダル再オープン時の問題を防ぐ）
            selectedVideoItems = []
            print("📹 [DEBUG DiaryFormView] Cleared selectedVideoItems")

            if let log = initialLog {
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd"
                if let parsed = dateFormatter.date(from: log.trainingDate) {
                    date = parsed
                }

                if let startTimeStr = log.startTime, let endTimeStr = log.endTime {
                    let timeFormatter = DateFormatter()
                    timeFormatter.dateFormat = "HH:mm:ss"

                    if let startParsed = timeFormatter.date(from: startTimeStr),
                       let endParsed = timeFormatter.date(from: endTimeStr) {
                        let calendar = Calendar.current
                        startTime = calendar.date(
                            bySettingHour: calendar.component(.hour, from: startParsed),
                            minute: calendar.component(.minute, from: startParsed),
                            second: 0,
                            of: date
                        )
                        endTime = calendar.date(
                            bySettingHour: calendar.component(.hour, from: endParsed),
                            minute: calendar.component(.minute, from: endParsed),
                            second: 0,
                            of: date
                        )
                        useTimeEntry = true
                    }
                } else if let duration = log.durationMinutes {
                    durationMinutes = String(duration)
                    useTimeEntry = false
                }

                content = log.content ?? ""
                notes = log.notes ?? ""
                if let value = log.condition {
                    condition = Double(value)
                }

                // 既存の動画をローカルストレージから読み込む
                let savedVideoURLs = LocalVideoStore.diaryVideoURLs(for: log.id)
                print("📹 [DEBUG DiaryFormView] Loading existing videos from storage: \(savedVideoURLs.count)")
                let savedTitles = LocalVideoStore.diaryVideoTitles(for: log.id)
                identifiableVideos = savedVideoURLs.enumerated().map { index, url in
                    let title = index < savedTitles.count ? savedTitles[index] : ""
                    return IdentifiableVideo(url: url, title: title)
                }
                print("📹 [DEBUG DiaryFormView] Loaded identifiable videos: \(identifiableVideos.count)")
            }
        }
    }

    private func save() async {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        let dateString = dateFormatter.string(from: date)

        var startTimeStr: String?
        var endTimeStr: String?
        var duration: Int?

        if useTimeEntry, let start = startTime, let end = endTime, end > start {
            let timeFormatter = DateFormatter()
            timeFormatter.dateFormat = "HH:mm:ss"
            startTimeStr = timeFormatter.string(from: start)
            endTimeStr = timeFormatter.string(from: end)
            duration = Int(end.timeIntervalSince(start) / 60)
        } else if !durationMinutes.isEmpty {
            duration = Int(durationMinutes)
        }

        let conditionValue = Int(condition)

        // identifiableVideosからURLの配列を取得
        let videoUrls = identifiableVideos.map { $0.url }
        let videoTitles = identifiableVideos.map { $0.title }

        print("💾 [DEBUG DiaryFormView] startTime: \(startTimeStr ?? "nil"), endTime: \(endTimeStr ?? "nil")")
        print("💾 [DEBUG DiaryFormView] condition: \(conditionValue)")
        print("💾 [DEBUG DiaryFormView] identifiableVideos count: \(identifiableVideos.count)")
        print("💾 [DEBUG DiaryFormView] videoUrls count: \(videoUrls.count)")
        print("💾 [DEBUG DiaryFormView] videoTitles count: \(videoTitles.count)")

        // videoUrlsは空配列のままで保存（実際のファイルはLocalVideoStoreに保存される）
        // 動画の有無は LocalVideoStore で管理するため、ここでは常に空配列を送る
        let form = TrainingLogForm(
            trainingDate: dateString,
            startTime: startTimeStr,
            endTime: endTimeStr,
            durationMinutes: duration,
            content: content.isEmpty ? nil : content,
            notes: notes.isEmpty ? nil : notes,
            condition: conditionValue,
            videoUrls: nil  // 動画はLocalVideoStoreで管理するため、DBには保存しない
        )

        if let log = initialLog {
            print("💾 [DEBUG DiaryFormView] Updating log: \(log.id)")

            // 動画をローカルストレージに保存
            do {
                if videoUrls.isEmpty {
                    print("🗑️ [DEBUG DiaryFormView] Deleting videos for log: \(log.id)")
                    LocalVideoStore.deleteDiaryVideos(for: log.id)
                } else {
                    print("💾 [DEBUG DiaryFormView] Saving \(videoUrls.count) videos for log: \(log.id)")
                    try LocalVideoStore.saveDiaryVideos(from: videoUrls, titles: videoTitles, logId: log.id)
                    print("✅ [DEBUG DiaryFormView] Videos saved successfully")
                }
            } catch {
                print("❌ [DEBUG DiaryFormView] Failed to save videos: \(error)")
            }

            await viewModel.updateTrainingLog(logId: log.id, form: form)
        } else {
            print("💾 [DEBUG DiaryFormView] Creating new log")

            if let newLog = await viewModel.createTrainingLog(form: form) {
                // 新規作成の場合、作成後に動画を保存
                if !videoUrls.isEmpty {
                    print("💾 [DEBUG DiaryFormView] Saving \(videoUrls.count) videos for new log: \(newLog.id)")
                    do {
                        try LocalVideoStore.saveDiaryVideos(from: videoUrls, titles: videoTitles, logId: newLog.id)
                        print("✅ [DEBUG DiaryFormView] Videos saved successfully for new log")
                    } catch {
                        print("❌ [DEBUG DiaryFormView] Failed to save videos for new log: \(error)")
                    }
                }
            }
        }

        dismiss()
    }

    private var conditionLabel: String {
        switch Int(condition) {
        case 1: return "低め"
        case 2: return "やや低め"
        case 3: return "普通"
        case 4: return "良い"
        case 5: return "最高"
        default: return "普通"
        }
    }
}

private struct DiarySectionHeader: View {
    let title: String
    let theme: BeltTheme

    var body: some View {
        Text(title)
            .font(.app(size: 16, weight: .bold))
            .foregroundStyle(theme.textPrimary)
            .padding(.bottom, 4)
    }
}

private struct DiaryCard<Content: View>: View {
    let theme: BeltTheme
    let content: Content

    init(theme: BeltTheme, @ViewBuilder content: () -> Content) {
        self.theme = theme
        self.content = content()
    }

    var body: some View {
        content
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )
    }
}

private struct DiaryLabeledCard<Content: View>: View {
    let title: String
    let theme: BeltTheme
    let content: Content

    init(title: String, theme: BeltTheme, @ViewBuilder content: () -> Content) {
        self.title = title
        self.theme = theme
        self.content = content()
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)
            DiaryCard(theme: theme) {
                content
            }
        }
    }
}

private struct DiaryTextField: View {
    let title: String
    @Binding var text: String
    let theme: BeltTheme

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)
            TextField(title, text: $text)
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

private struct DiaryTextEditor: View {
    let title: String
    @Binding var text: String
    let theme: BeltTheme

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.app(size: 14, weight: .semibold))
                .foregroundStyle(theme.textPrimary)

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(title)
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

private struct DiaryFormVideoThumbnailView: View {
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
