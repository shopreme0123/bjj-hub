import SwiftUI

struct FlowsView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var query = ""

    @State private var showAddFlow = false
    @State private var newFlowName = ""
    @State private var selectedFlow: Flow?
    @State private var showGroupImport = false
    @State private var showShareSheet: Flow?

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            LinearGradient(
                colors: [theme.primary.opacity(0.08), theme.background],
                startPoint: .topLeading,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header Section
                VStack(spacing: 12) {
                    HStack {
                        SectionHeaderView(title: "フロー", theme: theme)
                        Spacer()
                        Button(action: { showGroupImport = true }) {
                            Image(systemName: "square.and.arrow.down")
                                .font(.app(size: 14, weight: .semibold))
                                .foregroundStyle(theme.primary)
                                .frame(width: 32, height: 32)
                                .background(theme.primary.opacity(0.12))
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                        Button(action: { showAddFlow = true }) {
                            Image(systemName: "plus")
                                .font(.app(size: 14, weight: .semibold))
                                .foregroundStyle(theme.primary)
                                .frame(width: 32, height: 32)
                                .background(theme.primary.opacity(0.12))
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        }
                        .padding(.trailing, 16)
                    }

                    FlowSearchBar(query: $query, theme: theme)
                }
                .padding(.top, 16)

                // Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {
                        if filteredFlows.isEmpty {
                            if query.isEmpty {
                                EmptyStateView(message: "まだフローが登録されていません", theme: theme)
                                    .padding(.horizontal, 16)
                                    .padding(.top, 40)
                            } else {
                                VStack(spacing: 12) {
                                    Image(systemName: "magnifyingglass")
                                        .font(.system(size: 36, weight: .semibold))
                                        .foregroundStyle(theme.textMuted.opacity(0.5))
                                    Text("「\(query)」に一致するフローが見つかりません")
                                        .font(.body(14, weight: .medium))
                                        .foregroundStyle(theme.textMuted)
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.top, 60)
                            }
                        } else {
                            VStack(spacing: 12) {
                                HStack {
                                    Text("フロー一覧 (\(filteredFlows.count))")
                                        .font(.caption(13, weight: .bold))
                                        .foregroundStyle(theme.textMuted)
                                    Spacer()
                                }
                                .padding(.horizontal, 16)

                                ForEach(filteredFlows) { flow in
                                    FlowCardButton(flow: flow, theme: theme) {
                                        selectedFlow = flow
                                    }
                                    .contextMenu {
                                        Button {
                                            showShareSheet = flow
                                        } label: {
                                            Label("グループに共有", systemImage: "person.3.fill")
                                        }
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }
                        }
                    }
                    .padding(.top, 12)
                    .padding(.bottom, 96)
                }
            }
        }
        .sheet(isPresented: $showAddFlow) {
            NavigationStack {
                Form {
                    TextField("フロー名", text: $newFlowName)
                }
                .navigationTitle("フロー作成")
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("作成") {
                            Task {
                                if let flow = await viewModel.createFlow(name: newFlowName) {
                                    selectedFlow = flow
                                }
                                newFlowName = ""
                                showAddFlow = false
                            }
                        }
                        .disabled(newFlowName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
        }
        .sheet(item: $selectedFlow) { flow in
            FlowEditorView(viewModel: viewModel, flow: flow)
        }
        .sheet(item: $showShareSheet) { flow in
            FlowShareToGroupSheet(viewModel: viewModel, flow: flow)
        }
        .sheet(isPresented: $showGroupImport) {
            SharedFlowImportSheet(viewModel: viewModel)
        }
    }

    private var filteredFlows: [Flow] {
        guard !query.isEmpty else { return viewModel.flows }
        let lowered = query.lowercased()
        return viewModel.flows.filter { flow in
            flow.name.lowercased().contains(lowered)
        }
    }
}

private struct FlowShareToGroupSheet: View {
    @ObservedObject var viewModel: AppViewModel
    let flow: Flow
    @Environment(\.dismiss) private var dismiss
    @State private var isSharing = false
    @State private var selectedDays = 30

    private let expiryOptions = [7, 30, 90]

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("グループに共有")
                    .font(.app(size: 18, weight: .bold))

                Text(flow.name)
                    .font(.app(size: 13, weight: .medium))
                    .foregroundStyle(.secondary)

                Picker("共有期間", selection: $selectedDays) {
                    ForEach(expiryOptions, id: \.self) { days in
                        Text("\(days)日").tag(days)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)

                if viewModel.groups.isEmpty {
                    Text("参加中のグループがありません")
                        .font(.app(size: 13, weight: .medium))
                        .foregroundStyle(.secondary)
                        .padding(.top, 12)
                } else {
                    List(viewModel.groups) { group in
                        Button {
                            Task {
                                isSharing = true
                                _ = await viewModel.shareFlowToGroup(
                                    flow: flow,
                                    groupId: group.id,
                                    expiresInDays: selectedDays
                                )
                                isSharing = false
                                dismiss()
                            }
                        } label: {
                            HStack {
                                Text(group.name)
                                    .font(.app(size: 14, weight: .medium))
                                Spacer()
                                Image(systemName: "paperplane.fill")
                                    .font(.app(size: 14, weight: .semibold))
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .disabled(isSharing)
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .padding(.top, 12)
            .navigationTitle("共有")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
        }
    }
}

private struct SharedFlowImportSheet: View {
    @ObservedObject var viewModel: AppViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var selectedGroupId: String?
    @State private var sharedFlows: [SharedFlow] = []
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 12) {
                if viewModel.groups.isEmpty {
                    Text("参加中のグループがありません")
                        .font(.app(size: 13, weight: .medium))
                        .foregroundStyle(.secondary)
                        .padding(.top, 24)
                } else {
                    Picker("グループ", selection: $selectedGroupId) {
                        Text("選択してください").tag(String?.none)
                        ForEach(viewModel.groups) { group in
                            Text(group.name).tag(String?(group.id))
                        }
                    }
                    .pickerStyle(.menu)
                    .padding(.horizontal, 16)

                    if isLoading {
                        ProgressView("読み込み中...")
                            .padding(.top, 12)
                    } else if sharedFlows.isEmpty {
                        Text("共有フローがありません")
                            .font(.app(size: 13, weight: .medium))
                            .foregroundStyle(.secondary)
                            .padding(.top, 12)
                    } else {
                        List(sharedFlows) { shared in
                            SharedFlowRow(shared: shared, onImport: {
                                Task {
                                    _ = await viewModel.importSharedFlow(shared)
                                    dismiss()
                                }
                            })
                        }
                        .listStyle(.insetGrouped)
                    }
                }
                Spacer()
            }
            .navigationTitle("共有フロー")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("閉じる") { dismiss() }
                }
            }
            .onChange(of: selectedGroupId) { _, newValue in
                guard let groupId = newValue else { return }
                Task {
                    isLoading = true
                    sharedFlows = await viewModel.fetchSharedFlows(groupId: groupId)
                    isLoading = false
                }
            }
        }
    }
}

private struct SharedFlowRow: View {
    let shared: SharedFlow
    let onImport: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(shared.name)
                    .font(.app(size: 14, weight: .semibold))
                if let expiresAt = shared.expiresAt {
                    Text("期限: \(expiresAt)")
                        .font(.app(size: 11, weight: .medium))
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            Button("取り込む", action: onImport)
                .font(.app(size: 12, weight: .semibold))
        }
    }
}

private struct FlowHeaderRow: View {
    let theme: BeltTheme
    let flowCount: Int
    let onAdd: () -> Void
    let onImport: () -> Void
    @State private var isAddPressed = false
    @State private var isImportPressed = false

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("フロー")
                    .font(.display(24, weight: .heavy))
                    .foregroundStyle(theme.textPrimary)
                Text("技の連携と戦略を可視化")
                    .font(.caption(12, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }

            Spacer()

            HStack(spacing: 8) {
                Button(action: onImport) {
                    Image(systemName: "square.and.arrow.down")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundStyle(theme.primary)
                        .frame(width: 44, height: 44)
                        .background(theme.primary.opacity(0.1))
                        .clipShape(Circle())
                        .scaleEffect(isImportPressed ? 0.9 : 1.0)
                        .animation(.easeInOut(duration: 0.12), value: isImportPressed)
                }
                .buttonStyle(.plain)
                .simultaneousGesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in isImportPressed = true }
                        .onEnded { _ in isImportPressed = false }
                )

                Button(action: onAdd) {
                    HStack(spacing: 6) {
                        Image(systemName: "plus")
                            .font(.system(size: 14, weight: .bold))
                        Text("追加")
                            .font(.caption(13, weight: .bold))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)
                    .background(theme.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                    .shadow(color: theme.primary.opacity(0.3), radius: 8, x: 0, y: 4)
                    .scaleEffect(isAddPressed ? 0.95 : 1.0)
                    .animation(.easeInOut(duration: 0.12), value: isAddPressed)
                }
                .buttonStyle(.plain)
                .simultaneousGesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in isAddPressed = true }
                        .onEnded { _ in isAddPressed = false }
                )
            }
        }
        .padding(.horizontal, 16)
    }
}

private struct FlowSearchBar: View {
    @Binding var query: String
    let theme: BeltTheme
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(isFocused ? theme.primary : theme.textMuted)

            TextField("フローを検索...", text: $query)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .font(.body(14, weight: .medium))
                .foregroundStyle(theme.textPrimary)
                .focused($isFocused)

            if !query.isEmpty {
                Button(action: { query = "" }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(theme.textMuted)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(isFocused ? theme.primary.opacity(0.5) : theme.cardBorder, lineWidth: isFocused ? 2 : 1)
        )
        .padding(.horizontal, 16)
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}

private struct FlowCardButton: View {
    let flow: Flow
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
            FlowCard(flow: flow, theme: theme)
                .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
    }
}

private struct FlowCard: View {
    let flow: Flow
    let theme: BeltTheme

    var body: some View {
        VStack(spacing: 0) {
            // Main Content
            HStack(spacing: 14) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [theme.primary.opacity(0.15), theme.primary.opacity(0.08)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 56, height: 56)

                    Image(systemName: "point.topleft.down.curvedto.point.bottomright.up")
                        .font(.app(size: 20, weight: .semibold))
                        .foregroundStyle(theme.primary)
                }

                // Flow Info
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        Text(flow.name)
                            .font(.body(15, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                            .lineLimit(1)

                        if flow.isFavorite ?? false {
                            Image(systemName: "star.fill")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundStyle(Color(hex: "#f59e0b"))
                        }
                    }

                    Text("フロー")
                        .font(.caption(11, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                }

                Spacer()

                // Chevron
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textMuted.opacity(0.5))
            }
            .padding(14)
        }
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
    }
}
