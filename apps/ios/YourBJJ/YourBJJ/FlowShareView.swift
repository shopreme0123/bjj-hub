import SwiftUI

struct FlowShareView: View {
    let flow: Flow

    var body: some View {
        VStack(spacing: 16) {
            Text("フロー共有")
                .font(.app(size: 18, weight: .bold))

            Text("フロー名: \(flow.name)")
                .font(.app(size: 13, weight: .medium))

            Button("共有リンクをコピー") {
                let text = flowShareText
                UIPasteboard.general.string = text
            }
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(Color.blue)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            Spacer()
        }
        .padding(20)
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

struct FlowSharePayload: Codable {
    let id: String
    let name: String
    let data: FlowData

    var encodedString: String? {
        let encoder = JSONEncoder()
        guard let data = try? encoder.encode(self) else { return nil }
        return data.base64EncodedString()
    }

    static func decode(from string: String) -> FlowSharePayload? {
        guard let data = Data(base64Encoded: string) else { return nil }
        let decoder = JSONDecoder()
        return try? decoder.decode(FlowSharePayload.self, from: data)
    }
}
