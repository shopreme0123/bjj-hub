import SwiftUI
import PhotosUI
import UIKit

struct GroupsView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var showCreate = false
    @State private var showJoin = false
    @State private var selectedGroup: Group?
    @State private var showGroupSheet = false
    @State private var showAuth = false

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        VStack(spacing: 0) {
            VStack(spacing: 12) {
                HStack {
                    SectionHeaderView(title: "グループ", theme: theme)
                    Spacer()
                    Button(action: { showGroupSheet = true }) {
                        Image(systemName: "plus")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.primary)
                            .frame(width: 32, height: 32)
                            .background(theme.primary.opacity(0.12))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                    .disabled(!viewModel.isAuthenticated)
                    .pressEffect()
                    .padding(.trailing, 16)
                }
            }
            .padding(.top, 16)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 10) {
                    if !viewModel.isAuthenticated {
                        LoginPromptView(theme: theme) {
                            showAuth = true
                        }
                        .padding(.top, 24)
                    } else if viewModel.groups.isEmpty {
                        EmptyStateView(
                            message: "まだグループがありません",
                            subtitle: "新しい技を追加して練習を記録しましょう",
                            theme: theme
                        )
                    } else {
                        ForEach(viewModel.groups) { group in
                            Button(action: {
                                selectedGroup = group
                            }) {
                                GroupRow(group: group, theme: theme)
                            }
                            .buttonStyle(.plain)
                            .contextMenu {
                                if let code = group.inviteCode {
                                    Button("招待コードをコピー") {
                                        UIPasteboard.general.string = code
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(.top, 12)
                .padding(.horizontal, 16)
                .padding(.bottom, 96)
            }
        }
        .background(theme.background)
        .sheet(isPresented: $showCreate) {
            GroupCreateView(viewModel: viewModel, isPresented: $showCreate)
        }
        .sheet(isPresented: $showJoin) {
            GroupJoinView(viewModel: viewModel, isPresented: $showJoin)
        }
        .sheet(item: $selectedGroup) { group in
            GroupDetailView(viewModel: viewModel, group: group)
        }
        .sheet(isPresented: $showAuth) {
            AuthView(viewModel: viewModel)
        }
        .overlay {
            if showGroupSheet {
                GroupActionSheet(
                    theme: theme,
                    onCreate: {
                        showGroupSheet = false
                        showCreate = true
                    },
                    onJoin: {
                        showGroupSheet = false
                        showJoin = true
                    },
                    onDismiss: { showGroupSheet = false }
                )
                .zIndex(10000)
            }
        }
        .onAppear {
            if viewModel.isAuthenticated {
                Task { await viewModel.refreshGroups() }
            }
        }
    }
}

private struct LoginPromptView: View {
    let theme: BeltTheme
    let onLogin: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "lock.fill")
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(theme.primary)

            Text("ログインが必要です")
                .font(.app(size: 16, weight: .bold))
                .foregroundStyle(theme.textPrimary)

            Text("グループ機能を使うにはログインしてください")
                .font(.app(size: 12, weight: .medium))
                .foregroundStyle(theme.textMuted)
                .multilineTextAlignment(.center)

            Button(action: onLogin) {
                Text("ログイン")
                    .font(.app(size: 14, weight: .semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(theme.primary)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}

private struct GroupRow: View {
    let group: Group
    let theme: BeltTheme

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(theme.primary.opacity(0.12))
                    .frame(width: 44, height: 44)

                if let iconUrl = group.iconUrl, let url = URL(string: iconUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Image(systemName: "person.3")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(theme.primary)
                    }
                    .frame(width: 44, height: 44)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                } else {
                    Image(systemName: "person.3")
                        .font(.app(size: 16, weight: .semibold))
                        .foregroundStyle(theme.primary)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(group.name)
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                    .lineLimit(1)

                Text(group.description ?? "説明なし")
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
}

private struct GroupActionSheet: View {
    let theme: BeltTheme
    let onCreate: () -> Void
    let onJoin: () -> Void
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
                            Text("グループ")
                                .font(.app(size: 16, weight: .bold))
                                .foregroundStyle(theme.textPrimary)
                            Text("操作を選択してください")
                                .font(.app(size: 12, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }

                        VStack(spacing: 10) {
                        GroupActionRow(
                            theme: theme,
                            title: "グループを作成",
                            subtitle: "新しいグループを作る",
                            systemImage: "plus.circle.fill",
                            isPrimary: false,
                            action: onCreate
                        )

                        GroupActionRow(
                            theme: theme,
                            title: "グループに参加",
                            subtitle: "招待コードで参加する",
                            systemImage: "person.3.fill",
                            isPrimary: false,
                            action: onJoin
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
                    .padding(.bottom, proxy.safeAreaInsets.bottom + 72)
                }
            }
        }
    }
}

private struct GroupActionRow: View {
    let theme: BeltTheme
    let title: String
    let subtitle: String
    let systemImage: String
    let isPrimary: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: systemImage)
                    .font(.app(size: 18, weight: .semibold))
                    .foregroundStyle(isPrimary ? .white : theme.primary)
                    .frame(width: 34, height: 34)
                    .background(isPrimary ? theme.primary.opacity(0.9) : theme.primary.opacity(0.12))
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
            .background(isPrimary ? theme.primary.opacity(0.12) : theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isPrimary ? theme.primary.opacity(0.2) : theme.cardBorder, lineWidth: 1)
            )
        }
        .pressEffect()
    }
}

private struct GroupCreateView: View {
    @ObservedObject var viewModel: AppViewModel
    @Binding var isPresented: Bool
    @State private var name = ""
    @State private var description = ""

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Button(action: { isPresented = false }) {
                        Text("戻る")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text("グループ作成")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: {
                        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        Task {
                            _ = await viewModel.createGroup(name: trimmed, description: description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : description)
                            isPresented = false
                        }
                    }) {
                        Text("作成")
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

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        GroupFormSectionHeader(title: "基本情報", theme: theme)

                        GroupFormTextField(
                            title: "グループ名",
                            text: $name,
                            theme: theme,
                            placeholder: "例: Weekly Open Mat"
                        )

                        GroupFormTextEditor(
                            title: "説明",
                            text: $description,
                            theme: theme,
                            placeholder: "例: 週末の練習記録を共有します"
                        )
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

private struct GroupJoinView: View {
    @ObservedObject var viewModel: AppViewModel
    @Binding var isPresented: Bool
    @State private var inviteCode = ""

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    Button(action: { isPresented = false }) {
                        Text("戻る")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text("グループ参加")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: {
                        let trimmed = inviteCode.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        Task {
                            _ = await viewModel.joinGroup(inviteCode: trimmed)
                            isPresented = false
                        }
                    }) {
                        Text("参加")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(inviteCode.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? theme.textMuted : theme.primary)
                            .frame(width: 70, alignment: .trailing)
                    }
                    .padding(.trailing, 4)
                    .disabled(inviteCode.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 10) {
                            HStack(spacing: 8) {
                                Image(systemName: "person.3.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("招待コードで参加")
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            Text("招待コードを貼り付けて参加します。")
                                .font(.app(size: 12, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(theme.primary.opacity(0.06))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.primary.opacity(0.12), lineWidth: 1)
                        )

                        VStack(alignment: .leading, spacing: 10) {
                            Text("招待コード")
                                .font(.app(size: 14, weight: .semibold))
                                .foregroundStyle(theme.textPrimary)

                            TextField("例: BJJ-XXXX", text: $inviteCode)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                                .font(.app(size: 15, weight: .medium, design: .monospaced))
                                .foregroundStyle(theme.textPrimary)
                                .padding(14)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(theme.cardBorder, lineWidth: 1)
                                )
                        }

                        Button(action: {
                            if let pasted = UIPasteboard.general.string {
                                inviteCode = pasted.trimmingCharacters(in: .whitespacesAndNewlines)
                            }
                        }) {
                            HStack(spacing: 10) {
                                Image(systemName: "doc.on.clipboard")
                                    .font(.app(size: 16, weight: .semibold))
                                Text("クリップボードから貼り付け")
                                    .font(.app(size: 14, weight: .semibold))
                                Spacer()
                            }
                            .foregroundStyle(theme.textPrimary)
                            .padding(14)
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1)
                            )
                        }
                        .pressEffect()
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                }
            }
        }
    }
}

private struct GroupFormSectionHeader: View {
    let title: String
    let theme: BeltTheme

    var body: some View {
        Text(title)
            .font(.app(size: 16, weight: .bold))
            .foregroundStyle(theme.textPrimary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.bottom, 4)
    }
}

private struct GroupFormTextField: View {
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

private struct GroupFormTextEditor: View {
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

private struct GroupEditView: View {
    @ObservedObject var viewModel: AppViewModel
    let group: Group
    @Binding var isPresented: Bool
    @State private var name: String
    @State private var description: String
    @State private var selectedIconItem: PhotosPickerItem?
    @State private var selectedIconData: Data?
    @State private var previewImage: Image?
    @State private var localErrorMessage: String?
    @State private var showLocalError = false

    init(viewModel: AppViewModel, group: Group, isPresented: Binding<Bool>) {
        self.viewModel = viewModel
        self.group = group
        self._isPresented = isPresented
        self._name = State(initialValue: group.name)
        self._description = State(initialValue: group.description ?? "")
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            NavigationStack {
                Form {
                    Section("グループ画像") {
                        VStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(theme.primary.opacity(0.12))
                                    .frame(width: 72, height: 72)

                                if let previewImage {
                                    previewImage
                                        .resizable()
                                        .scaledToFill()
                                        .frame(width: 72, height: 72)
                                        .clipShape(Circle())
                                } else if let iconUrl = group.iconUrl, let url = URL(string: iconUrl) {
                                    AsyncImage(url: url) { image in
                                        image
                                            .resizable()
                                            .scaledToFill()
                                    } placeholder: {
                                        Image(systemName: "person.3.fill")
                                            .font(.system(size: 28, weight: .semibold))
                                            .foregroundStyle(theme.primary)
                                    }
                                    .frame(width: 72, height: 72)
                                    .clipShape(Circle())
                                } else {
                                    Image(systemName: "person.3.fill")
                                        .font(.system(size: 28, weight: .semibold))
                                        .foregroundStyle(theme.primary)
                                }
                            }

                            PhotosPicker(selection: $selectedIconItem, matching: .images) {
                                Text("画像を選択")
                                    .font(.app(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }

                    TextField("グループ名", text: $name)
                    TextField("説明", text: $description)
                }
                .navigationTitle("グループ編集")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("キャンセル") { isPresented = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        Task {
                            var iconUpdated = true
                            if let data = selectedIconData {
                                iconUpdated = await viewModel.updateGroupIcon(groupId: group.id, imageData: data)
                            }
                            await viewModel.updateGroup(
                                groupId: group.id,
                                name: name,
                                description: description.isEmpty ? nil : description
                            )
                            if iconUpdated {
                                isPresented = false
                            }
                        }
                    }
                        .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }

            if showLocalError, let localErrorMessage {
                ErrorPopup(
                    message: localErrorMessage,
                    theme: theme,
                    onDismiss: { showLocalError = false }
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .transition(.move(edge: .top).combined(with: .opacity))
                .zIndex(99999)
                .ignoresSafeArea(.all)
            }
        }
        .onChange(of: viewModel.showErrorPopup) { _, isVisible in
            if isVisible, let message = viewModel.errorMessage {
                localErrorMessage = message
                showLocalError = true
                viewModel.dismissError()
            }
        }
        .onChange(of: selectedIconItem) { _, newValue in
            guard let newValue else { return }
            Task {
                if let data = try? await newValue.loadTransferable(type: Data.self) {
                    if let uiImage = UIImage(data: data) {
                        selectedIconData = uiImage.jpegData(compressionQuality: 0.85) ?? data
                        previewImage = Image(uiImage: uiImage)
                    } else {
                        selectedIconData = data
                    }
                }
            }
        }
    }
}

private struct GroupDetailView: View {
    @ObservedObject var viewModel: AppViewModel
    let group: Group

    @State private var showEdit = false
    @State private var showDeleteConfirm = false
    @State private var members: [GroupMember] = []
    @State private var sharedTechniques: [SharedTechniqueEntry] = []
    @State private var isLoadingSharedTechniques = false
    @State private var selectedSection: GroupDetailSection = .members
    @State private var selectedMember: GroupMember?
    @Environment(\.dismiss) private var dismiss

    private var isCurrentUserAdmin: Bool {
        guard let userId = viewModel.userId else { return false }
        return members.contains { $0.userId == userId && $0.role == "admin" }
    }

    private var currentGroup: Group {
        viewModel.groups.first(where: { $0.id == group.id }) ?? group
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Header with group icon
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(theme.primary.opacity(0.15))
                                .frame(width: 80, height: 80)

                            if let iconUrl = currentGroup.iconUrl, let url = URL(string: iconUrl) {
                                AsyncImage(url: url) { image in
                                    image
                                        .resizable()
                                        .scaledToFill()
                                } placeholder: {
                                    Image(systemName: "person.3.fill")
                                        .font(.system(size: 36, weight: .semibold))
                                        .foregroundStyle(theme.primary)
                                }
                                .frame(width: 80, height: 80)
                                .clipShape(Circle())
                            } else {
                                Image(systemName: "person.3.fill")
                                    .font(.system(size: 36, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                            }
                        }

                        Text(currentGroup.name)
                            .font(.app(size: 22, weight: .heavy))
                            .foregroundStyle(theme.textPrimary)

                        if let description = currentGroup.description, !description.isEmpty {
                            Text(description)
                                .font(.app(size: 14, weight: .medium))
                                .foregroundStyle(theme.textMuted)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 32)
                        }

                        if let inviteCode = currentGroup.inviteCode {
                            HStack(spacing: 8) {
                                Text("招待コード:")
                                    .font(.app(size: 13, weight: .medium))
                                    .foregroundStyle(theme.textMuted)

                                Text(inviteCode)
                                    .font(.app(size: 14, weight: .bold))
                                    .foregroundStyle(theme.primary)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(theme.primary.opacity(0.1))
                                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                                Button(action: {
                                    UIPasteboard.general.string = inviteCode
                                }) {
                                    Image(systemName: "doc.on.doc")
                                        .font(.system(size: 14, weight: .semibold))
                                        .foregroundStyle(theme.primary)
                                }
                            }
                        }
                    }
                    .padding(.top, 16)

                    GroupDetailTabBar(
                        theme: theme,
                        selectedSection: $selectedSection,
                        memberCount: members.count,
                        sharedTechniqueCount: sharedTechniques.count
                    )
                    .padding(.horizontal, 16)

                    GroupDetailSectionView(
                        theme: theme,
                        section: selectedSection,
                        members: members,
                        sharedTechniques: sharedTechniques,
                        isLoadingSharedTechniques: isLoadingSharedTechniques,
                        isCurrentUserAdmin: isCurrentUserAdmin,
                        currentUserId: viewModel.userId,
                        onSelectMember: { selectedMember = $0 },
                        onKick: kickMember,
                        onImportTechnique: { shared in
                            Task { _ = await viewModel.importSharedTechnique(shared) }
                        }
                    )
                }
                .padding(.bottom, 96)
            }
            .background(theme.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        if isCurrentUserAdmin {
                            Button(action: { showEdit = true }) {
                                Label("編集", systemImage: "pencil")
                            }
                        }

                        Button(role: .destructive, action: { showDeleteConfirm = true }) {
                            Label("グループを退出", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)
                    }
                }
            }
            .task {
                await loadMembers()
                if selectedSection == .sharedTechniques {
                    await loadSharedTechniques()
                }
            }
            .onChange(of: selectedSection) { _, newValue in
                switch newValue {
                case .sharedTechniques where sharedTechniques.isEmpty:
                    Task { await loadSharedTechniques() }
                default:
                    break
                }
            }
        }
        .sheet(isPresented: $showEdit) {
            GroupEditView(viewModel: viewModel, group: group, isPresented: $showEdit)
        }
        .sheet(item: $selectedMember) { member in
            MemberProfileSheet(
                member: member,
                theme: BeltTheme(belt: viewModel.beltColor),
                localAvatarURL: LocalAvatarStore.avatarURL(for: member.userId)
            )
        }
        .alert("グループを退出しますか？", isPresented: $showDeleteConfirm) {
            Button("退出", role: .destructive) {
                Task {
                    await viewModel.leaveGroup(groupId: group.id)
                    dismiss()
                }
            }
            Button("キャンセル", role: .cancel) {}
        }
    }

    private func loadMembers() async {
        members = await viewModel.fetchGroupMembers(groupId: group.id)
    }

    private func kickMember(_ member: GroupMember) async {
        await viewModel.kickGroupMember(groupId: group.id, userId: member.userId)
        members.removeAll { $0.id == member.id }
    }

    private func loadSharedTechniques() async {
        isLoadingSharedTechniques = true
        sharedTechniques = await viewModel.fetchSharedTechniques(groupId: group.id)
        isLoadingSharedTechniques = false
    }
}

private enum GroupDetailSection: CaseIterable {
    case members
    case sharedTechniques

    var title: String {
        switch self {
        case .members: return "メンバー"
        case .sharedTechniques: return "共有技"
        }
    }

    var icon: String {
        switch self {
        case .members: return "person.2.fill"
        case .sharedTechniques: return "book.closed"
        }
    }
}

private struct GroupDetailTabBar: View {
    let theme: BeltTheme
    @Binding var selectedSection: GroupDetailSection
    let memberCount: Int
    let sharedTechniqueCount: Int

    var body: some View {
        HStack(spacing: 8) {
            ForEach(GroupDetailSection.allCases, id: \.self) { section in
                Button(action: { selectedSection = section }) {
                    HStack(spacing: 6) {
                        Image(systemName: section.icon)
                            .font(.app(size: 12, weight: .semibold))
                        Text(sectionTitle(section))
                            .font(.app(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(selectedSection == section ? theme.primary : theme.textMuted)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(selectedSection == section ? theme.primary.opacity(0.12) : theme.card)
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(theme.cardBorder, lineWidth: 1)
                    )
                }
                .pressEffect()
            }
        }
        .padding(8)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }

    private func sectionTitle(_ section: GroupDetailSection) -> String {
        switch section {
        case .members:
            return "メンバー \(memberCount)"
        case .sharedTechniques:
            return "共有技 \(sharedTechniqueCount)"
        }
    }
}

private struct GroupDetailSectionView: View {
    let theme: BeltTheme
    let section: GroupDetailSection
    let members: [GroupMember]
    let sharedTechniques: [SharedTechniqueEntry]
    let isLoadingSharedTechniques: Bool
    let isCurrentUserAdmin: Bool
    let currentUserId: String?
    let onSelectMember: (GroupMember) -> Void
    let onKick: (GroupMember) async -> Void
    let onImportTechnique: (SharedTechniqueEntry) -> Void

    var body: some View {
        switch section {
        case .members:
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(theme.primary)
                    Text("メンバー")
                        .font(.app(size: 16, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                }
                .padding(.horizontal, 16)

                if members.isEmpty {
                    Text("メンバーを読み込み中...")
                        .font(.app(size: 13, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                        .padding(.horizontal, 16)
                } else {
                    VStack(spacing: 8) {
                        ForEach(members) { member in
                            Button(action: { onSelectMember(member) }) {
                                MemberRow(
                                    member: member,
                                    theme: theme,
                                    isAdmin: member.role == "admin",
                                    avatarOverride: member.userId == currentUserId ? LocalAvatarStore.avatarURL(for: member.userId) : nil
                                )
                            }
                            .buttonStyle(.plain)
                                .contextMenu {
                                    if isCurrentUserAdmin, let currentUserId, member.userId != currentUserId {
                                        Button(role: .destructive) {
                                            Task {
                                                await onKick(member)
                                            }
                                        } label: {
                                            Label("追放", systemImage: "person.crop.circle.badge.xmark")
                                        }
                                    }
                                }
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        case .sharedTechniques:
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Image(systemName: "book.closed")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(theme.primary)
                    Text("共有技")
                        .font(.app(size: 16, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                }
                .padding(.horizontal, 16)

                if isLoadingSharedTechniques {
                    Text("共有技を読み込み中...")
                        .font(.app(size: 13, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                        .padding(.horizontal, 16)
                } else if sharedTechniques.isEmpty {
                    Text("共有技がありません")
                        .font(.app(size: 13, weight: .medium))
                        .foregroundStyle(theme.textMuted)
                        .padding(.horizontal, 16)
                } else {
                    VStack(spacing: 8) {
                        ForEach(sharedTechniques) { shared in
                            SharedTechniqueRow(shared: shared, theme: theme) {
                                onImportTechnique(shared)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                }
            }
        }
    }
}

private struct MemberRow: View {
    let member: GroupMember
    let theme: BeltTheme
    let isAdmin: Bool
    let avatarOverride: URL?

    var body: some View {
        HStack(spacing: 12) {
            MemberAvatarSmall(
                urlString: member.user?.avatarUrl,
                overrideURL: avatarOverride,
                placeholder: member.user?.displayName ?? "ユーザー",
                theme: theme
            )
            .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(member.user?.displayName ?? "ユーザー")
                        .font(.app(size: 14, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)

                    if isAdmin {
                        Text("管理者")
                            .font(.app(size: 10, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 4, style: .continuous))
                    }
                }
            }

            Spacer()
        }
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }

}

private struct MemberAvatarSmall: View {
    let urlString: String?
    let overrideURL: URL?
    let placeholder: String
    let theme: BeltTheme

    var body: some View {
        let imageURL = overrideURL ?? urlString.flatMap { URL(string: $0) }

        ZStack {
            Circle()
                .fill(theme.card)
                .overlay(
                    Circle()
                        .stroke(theme.cardBorder, lineWidth: 1)
                )

            if let imageURL {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Text(initials)
                        .font(.app(size: 12, weight: .bold))
                        .foregroundStyle(theme.textMuted)
                }
                .clipShape(Circle())
            } else {
                Text(initials)
                    .font(.app(size: 12, weight: .bold))
                    .foregroundStyle(theme.textMuted)
            }
        }
    }

    private var initials: String {
        let trimmed = placeholder.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "?" }
        return String(trimmed.prefix(1))
    }
}

private struct SharedFlowRow: View {
    let shared: SharedFlow
    let theme: BeltTheme
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
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}

private struct SharedTechniqueRow: View {
    let shared: SharedTechniqueEntry
    let theme: BeltTheme
    let onImport: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(shared.technique.name)
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
        .padding(12)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }
}

private struct MemberProfileSheet: View {
    let member: GroupMember
    let theme: BeltTheme
    let localAvatarURL: URL?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let memberTheme = BeltTheme(belt: member.user?.beltColor ?? .white)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 20) {
                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.app(size: 14, weight: .semibold))
                            .foregroundStyle(theme.textPrimary)
                            .frame(width: 36, height: 36)
                            .background(theme.card)
                            .clipShape(Circle())
                            .cardShadow(radius: 8, y: 2)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                VStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(memberTheme.beltGradient)
                            .frame(width: 96, height: 96)
                            .shadow(color: memberTheme.beltShadow, radius: 10, x: 0, y: 6)

                        AvatarCircleView(
                            urlString: member.user?.avatarUrl,
                            overrideURL: localAvatarURL,
                            placeholder: member.user?.displayName ?? "ユーザー",
                            theme: theme
                        )
                        .frame(width: 72, height: 72)
                    }

                    Text(member.user?.displayName ?? "ユーザー")
                        .font(.app(size: 20, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    if let bio = member.user?.bio, !bio.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                        Text(bio)
                            .font(.app(size: 13, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 28)
                    } else {
                        Text("ひとこと未設定")
                            .font(.app(size: 12, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                }
                .padding(.top, 4)

                MemberBeltCard(theme: theme, profile: member.user, joinedAt: member.joinedAt)
                    .padding(.horizontal, 20)

                Spacer()
            }
        }
    }
}

private struct AvatarCircleView: View {
    let urlString: String?
    let overrideURL: URL?
    let placeholder: String
    let theme: BeltTheme

    var body: some View {
        let imageURL = overrideURL ?? urlString.flatMap { URL(string: $0) }

        ZStack {
            Circle()
                .fill(theme.card)
                .overlay(
                    Circle()
                        .stroke(theme.cardBorder, lineWidth: 1)
                )

            if let imageURL {
                AsyncImage(url: imageURL) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Text(initials)
                        .font(.app(size: 20, weight: .bold))
                        .foregroundStyle(theme.textMuted)
                }
                .clipShape(Circle())
            } else {
                Text(initials)
                    .font(.app(size: 20, weight: .bold))
                    .foregroundStyle(theme.textMuted)
            }
        }
    }

    private var initials: String {
        let trimmed = placeholder.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "?" }
        return String(trimmed.prefix(1))
    }
}

private struct MemberBeltCard: View {
    let theme: BeltTheme
    let profile: Profile?
    let joinedAt: String

    var body: some View {
        let beltColor = profile?.beltColor ?? .white
        let stripeCount = profile?.beltStripes ?? 0

        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("帯")
                    .font(.app(size: 14, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                Text(beltLabel)
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textMuted)
            }

            BeltMiniView(beltColor: beltColor, stripes: stripeCount)
                .frame(height: 30)

            HStack(spacing: 8) {
                Text("ストライプ")
                    .font(.app(size: 11, weight: .medium))
                    .foregroundStyle(theme.textMuted)
                Text("\(stripeCount)")
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
            }

            HStack(spacing: 8) {
                Text("参加日")
                    .font(.app(size: 11, weight: .medium))
                    .foregroundStyle(theme.textMuted)
                Text(formattedJoinDate)
                    .font(.app(size: 12, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
            }
        }
        .padding(16)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
    }

    private var beltLabel: String {
        switch profile?.beltColor ?? .white {
        case .white: return "白帯"
        case .blue: return "青帯"
        case .purple: return "紫帯"
        case .brown: return "茶帯"
        case .black: return "黒帯"
        }
    }

    private var formattedJoinDate: String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: joinedAt) else {
            return joinedAt
        }
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "yyyy/MM/dd"
        displayFormatter.locale = Locale(identifier: "ja_JP")
        return displayFormatter.string(from: date)
    }
}

private struct BeltMiniView: View {
    let beltColor: BeltColor
    let stripes: Int

    var body: some View {
        let theme = BeltTheme(belt: beltColor)
        ZStack(alignment: .trailing) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(theme.beltGradient)
                .shadow(color: theme.beltShadow, radius: 6, x: 0, y: 3)

            HStack(spacing: 4) {
                ForEach(0..<min(max(stripes, 0), 6), id: \.self) { _ in
                    RoundedRectangle(cornerRadius: 2, style: .continuous)
                        .fill(theme.beltStripeColor)
                        .frame(width: 10, height: 6)
                }
            }
            .padding(.trailing, 12)
        }
    }
}
