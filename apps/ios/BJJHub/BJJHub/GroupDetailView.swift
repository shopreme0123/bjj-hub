import SwiftUI

struct GroupDetailView: View {
    @ObservedObject var viewModel: AppViewModel
    let group: Group

    @State private var showEdit = false
    @State private var showDeleteConfirm = false
    @State private var members: [GroupMember] = []
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            NavigationStack {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Header with group icon
                        VStack(spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(theme.primary.opacity(0.15))
                                    .frame(width: 80, height: 80)

                                if let iconUrl = group.iconUrl, let url = URL(string: iconUrl) {
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

                            Text(group.name)
                                .font(.app(size: 22, weight: .heavy))
                                .foregroundStyle(theme.textPrimary)

                            if let description = group.description, !description.isEmpty {
                                Text(description)
                                    .font(.app(size: 14, weight: .medium))
                                    .foregroundStyle(theme.textMuted)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 32)
                            }

                            if let inviteCode = group.inviteCode {
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

                        // Members section
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "person.2.fill")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("メンバー (\(members.count))")
                                    .font(.app(size: 16, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }
                            .padding(.horizontal, 16)

                        VStack(spacing: 8) {
                            if members.isEmpty {
                                MemberRowSkeleton(theme: theme)
                            } else {
                                ForEach(members) { member in
                                    MemberRow(member: member, theme: theme, isAdmin: member.role == "admin")
                                }
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }
                    .padding(.bottom, 96)
                }
                .background(theme.background)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Menu {
                            Button(action: { showEdit = true }) {
                                Label("編集", systemImage: "pencil")
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
                }
            }

            if viewModel.showErrorPopup, let errorMessage = viewModel.errorMessage {
                ErrorPopup(
                    message: errorMessage,
                    theme: theme,
                    onDismiss: { viewModel.dismissError() }
                )
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .transition(.move(edge: .top).combined(with: .opacity))
                .zIndex(999999)
                .ignoresSafeArea(.all)
            }
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
}

private struct MemberRow: View {
    let member: GroupMember
    let theme: BeltTheme
    let isAdmin: Bool

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(theme.primary.opacity(0.12))
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: "person.fill")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(theme.primary)
                )

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

                Text("参加日: \(formatDate(member.joinedAt))")
                    .font(.app(size: 11, weight: .medium))
                    .foregroundStyle(theme.textMuted)
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

    private func formatDate(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else {
            return dateString
        }

        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "yyyy/MM/dd"
        displayFormatter.locale = Locale(identifier: "ja_JP")
        return displayFormatter.string(from: date)
    }
}

private struct MemberRowSkeleton: View {
    let theme: BeltTheme

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(theme.primary.opacity(0.12))
                .frame(width: 40, height: 40)

            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .fill(theme.cardBorder)
                    .frame(width: 120, height: 10)
                RoundedRectangle(cornerRadius: 4, style: .continuous)
                    .fill(theme.cardBorder.opacity(0.7))
                    .frame(width: 90, height: 8)
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
