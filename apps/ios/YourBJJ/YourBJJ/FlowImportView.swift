import SwiftUI

struct FlowImportView: View {
    @ObservedObject var viewModel: AppViewModel
    @Binding var isPresented: Bool

    @State private var importText = ""
    @State private var errorMessage: String?
    @State private var showSuccessAlert = false

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        ZStack {
            theme.background.ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                HStack(spacing: 0) {
                    Button(action: { isPresented = false }) {
                        Text("戻る")
                            .font(.app(size: 16, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                            .frame(width: 70, alignment: .leading)
                    }
                    .padding(.leading, 4)

                    Spacer()

                    Text("フローをインポート")
                        .font(.app(size: 17, weight: .bold))
                        .foregroundStyle(theme.textPrimary)

                    Spacer()

                    Button(action: { Task { await importFlow() } }) {
                        Text("追加")
                            .font(.app(size: 16, weight: .semibold))
                            .foregroundStyle(importText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? theme.textMuted : theme.primary)
                            .frame(width: 70, alignment: .trailing)
                    }
                    .padding(.trailing, 4)
                    .disabled(importText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
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
                        // Instructions
                        VStack(alignment: .leading, spacing: 12) {
                            HStack(spacing: 8) {
                                Image(systemName: "info.circle.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                    .foregroundStyle(theme.primary)
                                Text("インポート方法")
                                    .font(.app(size: 15, weight: .bold))
                                    .foregroundStyle(theme.textPrimary)
                            }

                            VStack(alignment: .leading, spacing: 8) {
                                ImportInstructionRow(
                                    number: "1",
                                    text: "共有された共有コードをコピー",
                                    theme: theme
                                )
                                ImportInstructionRow(
                                    number: "2",
                                    text: "下のテキストエリアにペースト",
                                    theme: theme
                                )
                                ImportInstructionRow(
                                    number: "3",
                                    text: "「追加」ボタンをタップして完了",
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

                        // Import Text Area
                        VStack(alignment: .leading, spacing: 10) {
                            Text("共有コードを貼り付け")
                                .font(.app(size: 14, weight: .bold))
                                .foregroundStyle(theme.textPrimary)

                            ZStack(alignment: .topLeading) {
                                if importText.isEmpty {
                                    Text("共有コードをここにペースト...")
                                        .font(.app(size: 13, weight: .medium, design: .monospaced))
                                        .foregroundStyle(theme.textMuted.opacity(0.5))
                                        .padding(.horizontal, 18)
                                        .padding(.vertical, 14)
                                }

                                TextEditor(text: $importText)
                                    .font(.app(size: 12, weight: .medium, design: .monospaced))
                                    .foregroundStyle(theme.textPrimary)
                                    .scrollContentBackground(.hidden)
                                    .frame(height: 180)
                                    .padding(10)
                            }
                            .background(theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.cardBorder, lineWidth: 1)
                            )
                        }

                        // Error Message
                        if let errorMessage {
                            HStack(spacing: 10) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .font(.app(size: 16, weight: .semibold))
                                    .foregroundStyle(.red)

                                Text(errorMessage)
                                    .font(.app(size: 14, weight: .medium))
                                    .foregroundStyle(.red)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .padding(14)
                            .background(Color.red.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(Color.red.opacity(0.3), lineWidth: 1)
                            )
                        }

                        // Paste Button
                        if UIPasteboard.general.hasStrings {
                            Button(action: pasteFromClipboard) {
                                HStack(spacing: 8) {
                                    Image(systemName: "doc.on.clipboard")
                                        .font(.app(size: 14, weight: .semibold))
                                    Text("クリップボードから貼り付け")
                                        .font(.app(size: 14, weight: .semibold))
                                }
                                .foregroundStyle(theme.primary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(theme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                                        .stroke(theme.primary.opacity(0.3), lineWidth: 1)
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 24)
                    .padding(.bottom, 40)
                }
            }
        }
    }

    private func pasteFromClipboard() {
        if let clipboardText = UIPasteboard.general.string {
            importText = clipboardText
            errorMessage = nil
        }
    }

    private func importFlow() async {
        errorMessage = nil
        let trimmed = importText.trimmingCharacters(in: .whitespacesAndNewlines)

        guard let payload = FlowSharePayload.decode(from: trimmed) else {
            errorMessage = "フォーマットが正しくありません。正しい共有コードを貼り付けてください。"
            return
        }

        guard let flow = await viewModel.createFlow(name: payload.name) else {
            errorMessage = "フローの作成に失敗しました。もう一度お試しください。"
            return
        }

        await viewModel.updateFlowData(flowId: flow.id, flowData: payload.data)
        showSuccessAlert = true

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            isPresented = false
        }
    }
}

private struct ImportInstructionRow: View {
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
