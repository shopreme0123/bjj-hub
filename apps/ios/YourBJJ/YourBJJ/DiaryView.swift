import SwiftUI

struct DiaryView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var showAdd = false
    @State private var selectedLog: TrainingLog?
    @State private var currentMonth = Date()
    let selectedLogId: String?
    @State private var hasOpenedInitialLog = false
    @State private var selectedDateForSheet: SelectedDate?
    @State private var selectedDateForNewLog: String?

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        VStack(spacing: 0) {
            VStack(spacing: 12) {
                HStack {
                    SectionHeaderView(title: "日記", theme: theme)
                    Spacer()
                    Button(action: { showAdd = true }) {
                        Image(systemName: "plus")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.primary)
                            .frame(width: 32, height: 32)
                            .background(theme.primary.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                    .padding(.trailing, 16)
                }

                CalendarSection(
                theme: theme,
                currentMonth: $currentMonth,
                dateCounts: Dictionary(grouping: viewModel.trainingLogs, by: { $0.trainingDate })
                    .mapValues { $0.count },
                onDateTap: { dateString in
                    print("📅 [DEBUG DiaryView] Date tapped: \(dateString)")
                    print("📅 [DEBUG DiaryView] Current training logs count: \(viewModel.trainingLogs.count)")

                    // .sheet(item:)を使うため、SelectedDateオブジェクトを作成
                    selectedDateForSheet = SelectedDate(dateString: dateString)
                }
            )
            }
            .padding(.top, 16)

            if !viewModel.isPremium {
                AdBannerView(theme: theme, placement: .diary)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
            }

            ScrollView(showsIndicators: false) {
                VStack(spacing: 10) {
                    if viewModel.isLoading {
                        VStack(spacing: 16) {
                            ProgressView()
                                .scaleEffect(1.2)
                                .tint(theme.primary)
                            Text("読み込み中...")
                                .font(.app(size: 14, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }
                        .padding(.top, 60)
                    } else if viewModel.trainingLogs.isEmpty {
                        EmptyStateView(message: "まだ練習が記録されていません", theme: theme)
                    } else {
                        ForEach(groupedLogs, id: \.date) { group in
                            VStack(spacing: 8) {
                                ForEach(group.logs) { log in
                                    DiaryRowButton(
                                        log: log,
                                        theme: theme,
                                        showSessionNumber: group.logs.count > 1,
                                        sessionNumber: (group.logs.firstIndex(where: { $0.id == log.id }) ?? 0) + 1
                                    ) {
                                        selectedLog = log
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.top, 16)
                .padding(.horizontal, 16)
                .padding(.bottom, 96)
            }
        }
        .background(theme.background)
        .sheet(isPresented: $showAdd) {
            DiaryFormView(viewModel: viewModel, initialLog: nil, initialDate: selectedDateForNewLog)
        }
        .onChange(of: showAdd) { oldValue, newValue in
            if !newValue {
                selectedDateForNewLog = nil
            }
        }
        .sheet(item: $selectedLog) { log in
            DiaryDetailView(viewModel: viewModel, log: log)
        }
        .sheet(item: $selectedDateForSheet) { selectedDate in
            DateLogsSheet(
                theme: theme,
                viewModel: viewModel,
                date: selectedDate.dateString,
                onSelect: { log in
                    selectedDateForSheet = nil
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        selectedLog = log
                    }
                },
                onAdd: {
                    selectedDateForNewLog = selectedDate.dateString
                    selectedDateForSheet = nil
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        showAdd = true
                    }
                }
            )
        }
        .onAppear {
            openSelectedLog()
        }
        .onChange(of: selectedLogId) {
            openSelectedLog()
        }
        .onChange(of: viewModel.trainingLogs.count) {
            openSelectedLog()
        }
    }

    private func openSelectedLog() {
        guard let selectedLogId, !hasOpenedInitialLog else { return }
        if let log = viewModel.trainingLogs.first(where: { $0.id == selectedLogId }) {
            selectedLog = log
            hasOpenedInitialLog = true
        }
    }

    private var groupedLogs: [LogGroup] {
        let grouped = Dictionary(grouping: viewModel.trainingLogs) { $0.trainingDate }
        return grouped.map { LogGroup(date: $0.key, logs: $0.value.sorted { log1, log2 in
            // Sort by start time if available, otherwise by creation time
            if let start1 = log1.startTime, let start2 = log2.startTime {
                return start1 < start2
            }
            return (log1.createdAt ?? "") < (log2.createdAt ?? "")
        }) }
        .sorted { $0.date > $1.date }
    }
}

private struct LogGroup {
    let date: String
    let logs: [TrainingLog]
}

private struct DiaryRowButton: View {
    let log: TrainingLog
    let theme: BeltTheme
    let showSessionNumber: Bool
    let sessionNumber: Int
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
            DiaryRow(log: log, theme: theme, showSessionNumber: showSessionNumber, sessionNumber: sessionNumber)
                .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
    }
}

private struct DiaryRow: View {
    let log: TrainingLog
    let theme: BeltTheme
    let showSessionNumber: Bool
    let sessionNumber: Int

    var body: some View {
        HStack(spacing: 12) {
            VStack(spacing: 4) {
                Text(dayString)
                    .font(.app(size: 12, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                Text(monthString)
                    .font(.app(size: 10, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }
            .frame(width: 44, height: 44)
            .background(theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(theme.cardBorder, lineWidth: 1)
            )

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    if showSessionNumber {
                        Text("\(sessionNumber)部")
                            .font(.app(size: 10, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                    }

                    Text(log.content ?? log.notes ?? "練習")
                        .font(.app(size: 13, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                        .lineLimit(1)
                }

                Text(durationString)
                    .font(.app(size: 11, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.app(size: 12, weight: .semibold))
                .foregroundStyle(theme.textMuted)
        }
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }

    private var dayString: String {
        String(log.trainingDate.suffix(2))
    }

    private var monthString: String {
        let parts = log.trainingDate.split(separator: "-")
        if parts.count >= 2 {
            return "\(parts[1])月"
        }
        return ""
    }

    private var durationString: String {
        if let startTime = log.startTime, let endTime = log.endTime {
            let components1 = startTime.split(separator: ":")
            let components2 = endTime.split(separator: ":")
            if components1.count >= 2 && components2.count >= 2 {
                return "\(components1[0]):\(components1[1]) - \(components2[0]):\(components2[1])"
            }
        }

        if let duration = log.durationMinutes {
            return "\(duration)min"
        }
        return ""
    }
}

private struct CalendarSection: View {
    let theme: BeltTheme
    @Binding var currentMonth: Date
    let dateCounts: [String: Int]
    let onDateTap: (String) -> Void

    private let calendar = Calendar.current
    private let weekdaySymbols = ["月", "火", "水", "木", "金", "土", "日"]
    @State private var dragOffset: CGFloat = 0
    @State private var isDragging = false

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        shiftMonth(-1)
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .font(.app(size: 12, weight: .semibold))
                        .foregroundStyle(theme.textMuted)
                }

                Spacer()

                Text(monthTitle)
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                    .opacity(isDragging ? 0.5 : 1.0)

                Spacer()

                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        shiftMonth(1)
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .font(.app(size: 12, weight: .semibold))
                        .foregroundStyle(theme.textMuted)
                }
            }

            HStack {
                ForEach(weekdaySymbols, id: \.self) { day in
                    Text(day)
                        .font(.app(size: 10, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                        .frame(maxWidth: .infinity)
                }
            }

            LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 7), spacing: 6) {
                ForEach(Array(days.enumerated()), id: \.offset) { _, item in
                    CalendarDayCell(
                        theme: theme,
                        day: item.day,
                        dateString: item.dateString,
                        isCurrentMonth: item.isCurrentMonth,
                        isMarked: item.isMarked,
                        sessionCount: item.sessionCount,
                        onTap: onDateTap
                    )
                }
            }
            .offset(x: dragOffset)
        }
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .padding(.horizontal, 16)
        .gesture(
            DragGesture(minimumDistance: 20)
                .onChanged { value in
                    isDragging = true
                    dragOffset = value.translation.width * 0.3
                }
                .onEnded { value in
                    let threshold: CGFloat = 50

                    withAnimation(.easeInOut(duration: 0.3)) {
                        if value.translation.width < -threshold {
                            shiftMonth(1)
                        } else if value.translation.width > threshold {
                            shiftMonth(-1)
                        }
                        dragOffset = 0
                        isDragging = false
                    }
                }
        )
    }

    private var monthTitle: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy年 M月"
        return formatter.string(from: currentMonth)
    }

    private var days: [CalendarDay] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: currentMonth),
              let monthStart = calendar.date(from: calendar.dateComponents([.year, .month], from: monthInterval.start)) else {
            return []
        }

        let monthRange = calendar.range(of: .day, in: .month, for: monthStart) ?? 1..<1
        let firstWeekday = calendar.component(.weekday, from: monthStart)
        let leadingEmpty = (firstWeekday + 5) % 7

        var items: [CalendarDay] = []
        for _ in 0..<leadingEmpty {
            items.append(CalendarDay(day: "", dateString: "", isCurrentMonth: false, isMarked: false, sessionCount: 0))
        }

        for day in monthRange {
            let date = calendar.date(byAdding: .day, value: day - 1, to: monthStart) ?? monthStart
            let dateKey = dateString(date)
            let count = dateCounts[dateKey] ?? 0
            let isMarked = count > 0
            items.append(CalendarDay(day: "\(day)", dateString: dateKey, isCurrentMonth: true, isMarked: isMarked, sessionCount: count))
        }

        return items
    }

    private func dateString(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    private func shiftMonth(_ offset: Int) {
        if let newDate = calendar.date(byAdding: .month, value: offset, to: currentMonth) {
            currentMonth = newDate
        }
    }
}

private struct CalendarDay: Hashable {
    let day: String
    let dateString: String
    let isCurrentMonth: Bool
    let isMarked: Bool
    let sessionCount: Int
}

private struct CalendarDayCell: View {
    let theme: BeltTheme
    let day: String
    let dateString: String
    let isCurrentMonth: Bool
    let isMarked: Bool
    let sessionCount: Int
    let onTap: (String) -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            if isCurrentMonth && !dateString.isEmpty {
                onTap(dateString)
            }
        }) {
            ZStack {
                if isMarked {
                    Circle()
                        .fill(theme.primary.opacity(0.15))
                        .frame(width: 32, height: 32)
                }

                VStack(spacing: 2) {
                    Text(day)
                        .font(.app(size: 11, weight: isMarked ? .bold : .medium))
                        .foregroundStyle(
                            isMarked ? theme.primary :
                            isCurrentMonth ? theme.textPrimary : theme.textMuted.opacity(0.4)
                        )
                        .frame(maxWidth: .infinity)

                    if isMarked {
                        HStack(spacing: 2) {
                            ForEach(0..<min(sessionCount, 3), id: \.self) { _ in
                                Circle()
                                    .fill(theme.primary)
                                    .frame(width: 4, height: 4)
                            }
                        }
                    }
                }
            }
            .frame(height: 36)
            .scaleEffect(isPressed ? 0.92 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: isPressed)
        }
        .buttonStyle(.plain)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if isMarked {
                        isPressed = true
                    }
                }
                .onEnded { _ in isPressed = false }
        )
        .disabled(!isCurrentMonth || dateString.isEmpty)
    }
}

private struct DateLogsSheet: View {
    let theme: BeltTheme
    @ObservedObject var viewModel: AppViewModel
    let date: String
    let onSelect: (TrainingLog) -> Void
    let onAdd: () -> Void
    @Environment(\.dismiss) private var dismiss

    @State private var selectedLog: TrainingLog?
    @State private var showAddForm = false

    // viewModelから動的にフィルタリング - これで常に最新のデータが表示される
    private var logs: [TrainingLog] {
        print("📅 [DEBUG DateLogsSheet] Computing logs for date: \(date)")
        print("📅 [DEBUG DateLogsSheet] Total training logs in viewModel: \(viewModel.trainingLogs.count)")

        let logsForDate = viewModel.trainingLogs.filter { $0.trainingDate == date }
        print("📅 [DEBUG DateLogsSheet] Filtered logs for \(date): \(logsForDate.count)")

        for log in logsForDate {
            print("📅 [DEBUG DateLogsSheet]   - Log: \(log.content ?? "no content"), startTime: \(log.startTime ?? "none")")
        }

        return logsForDate.sorted { log1, log2 in
            if let start1 = log1.startTime, let start2 = log2.startTime {
                return start1 < start2
            }
            return (log1.createdAt ?? "") < (log2.createdAt ?? "")
        }
    }

    var body: some View {
        print("📅 [DEBUG DateLogsSheet.body] Rendering body, logs.count = \(logs.count)")
        return ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Button(action: { dismiss() }) {
                        Text("閉じる")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text(dateTitle)
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: { showAddForm = true }) {
                        Image(systemName: "plus")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(theme.primary)
                            .frame(width: 32, height: 32)
                            .background(theme.primary.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                    .frame(width: 70, alignment: .trailing)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 28)
                .background(theme.card)
                .overlay(
                    Rectangle()
                        .fill(theme.cardBorder)
                        .frame(height: 1),
                    alignment: .bottom
                )

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 12) {
                        if logs.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "calendar.badge.exclamationmark")
                                    .font(.system(size: 48, weight: .semibold))
                                    .foregroundStyle(theme.textMuted)
                                    .padding(.top, 60)

                                Text("この日の練習記録がありません")
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }
                        } else {
                            ForEach(logs) { log in
                                Button(action: {
                                    selectedLog = log
                                }) {
                                    HStack(spacing: 12) {
                                        VStack(alignment: .leading, spacing: 4) {
                                            if let startTime = log.startTime, let endTime = log.endTime {
                                                Text("\(formatTime(startTime)) - \(formatTime(endTime))")
                                                    .font(.app(size: 14, weight: .bold))
                                                    .foregroundStyle(theme.textPrimary)
                                            } else if let duration = log.durationMinutes {
                                                Text("\(duration)分")
                                                    .font(.app(size: 14, weight: .bold))
                                                    .foregroundStyle(theme.textPrimary)
                                            } else {
                                                Text("練習")
                                                    .font(.app(size: 14, weight: .bold))
                                                    .foregroundStyle(theme.textPrimary)
                                            }

                                            if let content = log.content, !content.isEmpty {
                                                Text(content)
                                                    .font(.app(size: 12, weight: .medium))
                                                    .foregroundStyle(theme.textMuted)
                                                    .lineLimit(1)
                                            }
                                        }

                                        Spacer()

                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 12, weight: .semibold))
                                            .foregroundStyle(theme.textMuted)
                                    }
                                    .padding(16)
                                    .background(theme.card)
                                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .stroke(theme.cardBorder, lineWidth: 1)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(16)
                }
            }
        }
        .sheet(item: $selectedLog) { log in
            DiaryDetailView(viewModel: viewModel, log: log)
        }
        .sheet(isPresented: $showAddForm) {
            DiaryFormView(viewModel: viewModel, initialLog: nil, initialDate: date)
        }
    }

    private var dateTitle: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        guard let parsedDate = formatter.date(from: date) else {
            return date
        }

        formatter.dateFormat = "M月d日"
        formatter.locale = Locale(identifier: "ja_JP")
        return formatter.string(from: parsedDate)
    }

    private func formatTime(_ timeString: String) -> String {
        let components = timeString.split(separator: ":")
        guard components.count >= 2 else { return timeString }
        return "\(components[0]):\(components[1])"
    }
}

// .sheet(item:)で使用するためのIdentifiable wrapper
private struct SelectedDate: Identifiable {
    let id = UUID()
    let dateString: String
}
