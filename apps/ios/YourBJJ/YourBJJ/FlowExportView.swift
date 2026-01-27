import SwiftUI

struct FlowExportView: View {
    let flow: Flow
    @State private var showCopiedAlert = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        let theme = BeltTheme(belt: .white)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack(spacing: 0) {
                    Button(action: { dismiss() }) {
                        Text("閉じる")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text("フロー共有")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Color.clear
                        .frame(width: 70)
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

                // Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        // Flow Info Card
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Image(systemName: "point.topleft.down.curvedto.point.bottomright.up")
                                    .font(.app(size: 20, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text(flow.name)
                                    .font(.app(size: 18, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            if let data = flow.flowData {
                                HStack(spacing: 16) {
                                    HStack(spacing: 6) {
                                        Image(systemName: "circle.fill")
                                            .font(.app(size: 8, weight: .bold))
                                            .foregroundStyle(theme.primary.opacity(0.6))
                                        Text("\(data.nodes.count)個のノード")
                                            .font(.app(size: 13, weight: .medium))
                                            .foregroundStyle(theme.textMuted)
                                    }

                                    HStack(spacing: 6) {
                                        Image(systemName: "arrow.right")
                                            .font(.app(size: 10, weight: .bold))
                                            .foregroundStyle(theme.primary.opacity(0.6))
                                        Text("\(data.edges.count)個のエッジ")
                                            .font(.app(size: 13, weight: .medium))
                                            .foregroundStyle(theme.textMuted)
                                    }
                                }
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )

                        // Instructions
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 8) {
                                Image(systemName: "info.circle.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("共有方法")
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                InstructionRow(
                                    number: "1",
                                    text: "下のボタンをタップして共有コードをコピー",
                                    theme: theme
                                )
                                InstructionRow(
                                    number: "2",
                                    text: "共有したい人にコードを送信",
                                    theme: theme
                                )
                                InstructionRow(
                                    number: "3",
                                    text: "相手がインポート機能でコードを貼り付け",
                                    theme: theme
                                )
                            }
                        }
                        .padding(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(theme.primary.opacity(0.05))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(theme.primary.opacity(0.1), lineWidth: 1)
                        )

                        // Share Code Preview
                        VStack(alignment: .leading, spacing: 10) {
                            Text("共有コードプレビュー")
                                .font(.app(size: 13, weight: .bold))
                                .foregroundStyle(theme.textPrimary)

                            ScrollView(.horizontal, showsIndicators: false) {
                                Text(flowShareText)
                                    .font(.app(size: 11, weight: .medium, design: .monospaced))
                                    .foregroundStyle(theme.textMuted)
                                    .padding(12)
                                    .background(theme.card)
                                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                                            .stroke(theme.cardBorder, lineWidth: 1)
                                    )
                            }
                        }

                        // Copy Button
                        Button(action: copyShareText) {
                            HStack(spacing: 8) {
                                Image(systemName: showCopiedAlert ? "checkmark.circle.fill" : "doc.on.doc.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                Text(showCopiedAlert ? "コピーしました！" : "共有コードをコピー")
                                    .font(.app(size: 16, weight: .semibold))
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(showCopiedAlert ? Color.green : theme.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .shadow(color: (showCopiedAlert ? Color.green : theme.primary).opacity(0.3), radius: 8, x: 0, y: 4)
                        }
                        .buttonStyle(.plain)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: showCopiedAlert)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
                    .padding(.bottom, 40)
                }
            }
        }
    }

    private func copyShareText() {
        UIPasteboard.general.string = flowShareText
        showCopiedAlert = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            showCopiedAlert = false
        }
    }

    private var flowShareText: String {
        let payload = FlowSharePayload(
            id: flow.id,
            name: flow.name,
            data: flow.flowData ?? FlowData(nodes: [], edges: [])
        )
        return payload.encodedString ?? ""
    }
}

private struct InstructionRow: View {
    let number: String
    let text: String
    let theme: BeltTheme

    var body: some View {
        HStack(spacing: 10) {
            Text(number)
                .font(.app(size: 12, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 22, height: 22)
                .background(theme.primary)
                .clipShape(Circle())

            Text(text)
                .font(.app(size: 13, weight: .medium))
                .foregroundStyle(theme.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}
