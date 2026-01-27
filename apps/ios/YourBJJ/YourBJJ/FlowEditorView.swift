import SwiftUI

struct FlowEditorView: View {
    @ObservedObject var viewModel: AppViewModel
    let flow: Flow

    @State private var nodes: [FlowNodeData]
    @State private var edges: [FlowEdgeData]
    @State private var selectedNodeId: String?

    @State private var scale: CGFloat = 1
    @State private var lastScale: CGFloat = 1
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero

    @State private var showAddNode = false
    @State private var showEdgeEditor = false
    @State private var showShareSheet = false

    @State private var showNodeEditor = false
    @State private var editingNode: FlowNodeData?

    @State private var edgeLabel = ""
    @State private var edgeType: String = "default"

    @State private var flowName: String
    @State private var dragStartPositions: [String: CGPoint] = [:]

    // Connection line state
    @State private var isDraggingConnection = false
    @State private var connectionStart: (nodeId: String, point: CGPoint)?
    @State private var connectionEnd: CGPoint = .zero

    init(viewModel: AppViewModel, flow: Flow) {
        self.viewModel = viewModel
        self.flow = flow
        let data = flow.flowData ?? FlowData(nodes: [], edges: [])
        _nodes = State(initialValue: data.nodes)
        _edges = State(initialValue: data.edges)
        _flowName = State(initialValue: flow.name)
    }

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        VStack(spacing: 0) {
            FlowEditorHeader(theme: theme, flowName: $flowName, onSave: saveFlow, onAddNode: {
                showAddNode = true
            }, onShare: {
                showShareSheet = true
            })

            GeometryReader { proxy in
                ZStack {
                    theme.background.ignoresSafeArea()

                    Canvas { context, size in
                        // Apply transformations
                        context.translateBy(x: offset.width, y: offset.height)
                        context.scaleBy(x: scale, y: scale)

                        // Draw grid
                        let spacing: CGFloat = 24
                        let columns = Int(size.width / spacing) + 10
                        let rows = Int(size.height / spacing) + 10
                        for row in -5...rows {
                            for column in -5...columns {
                                let x = CGFloat(column) * spacing
                                let y = CGFloat(row) * spacing
                                let dot = Path(ellipseIn: CGRect(x: x - 1, y: y - 1, width: 2, height: 2))
                                context.fill(dot, with: .color(theme.cardBorder.opacity(0.5).opacity(0.5)))
                            }
                        }
                    }

                    ZStack {
                        EdgeLayer(nodes: nodes, edges: edges, theme: theme)

                        // Temporary connection line while dragging
                        if isDraggingConnection, let start = connectionStart {
                            Canvas { context, size in
                                var path = Path()
                                path.move(to: start.point)
                                path.addLine(to: connectionEnd)
                                context.stroke(path, with: .color(theme.primary.opacity(0.5)), style: StrokeStyle(lineWidth: 2, dash: [5, 5]))
                            }
                        }

                        ForEach(nodes) { node in
                            FlowNodeView(
                                node: node,
                                techniqueName: techniqueName(for: node),
                                theme: theme,
                                isSelected: selectedNodeId == node.id,
                                scale: scale,
                                offset: offset,
                                onTap: {
                                    handleNodeTap(node)
                                },
                                onEdit: {
                                    editingNode = node
                                    showNodeEditor = true
                                },
                                onDelete: {
                                    deleteNode(node)
                                },
                                onConnectionStart: { globalPoint in
                                    let localPoint = globalToCanvas(globalPoint, frame: proxy.frame(in: .global))
                                    startConnection(from: node.id, at: localPoint)
                                },
                                onConnectionDrag: { globalPoint in
                                    let localPoint = globalToCanvas(globalPoint, frame: proxy.frame(in: .global))
                                    updateConnection(to: localPoint)
                                },
                                onConnectionEnd: { globalPoint in
                                    let localPoint = globalToCanvas(globalPoint, frame: proxy.frame(in: .global))
                                    endConnection(at: localPoint)
                                }
                            )
                            .position(x: node.positionX, y: node.positionY)
                            .highPriorityGesture(nodeDrag(nodeId: node.id))
                        }
                    }
                    .scaleEffect(scale)
                    .offset(offset)
                    .gesture(canvasDrag)
                    .gesture(canvasZoom)
                }
                .overlay(alignment: .bottomTrailing) {
                    VStack(spacing: 8) {
                        CanvasButton(systemName: "link") {
                            showEdgeEditor = true
                        }
                        CanvasButton(systemName: "plus") {
                            showAddNode = true
                        }
                    }
                    .padding(16)
                }
                .overlay(alignment: .bottomLeading) {
                    VStack(spacing: 8) {
                        CanvasButton(systemName: "minus.magnifyingglass") {
                            scale = max(0.6, scale - 0.1)
                            lastScale = scale
                        }
                        CanvasButton(systemName: "plus.magnifyingglass") {
                            scale = min(2.4, scale + 0.1)
                            lastScale = scale
                        }
                        CanvasButton(systemName: "arrow.counterclockwise") {
                            scale = 1
                            lastScale = 1
                            offset = .zero
                            lastOffset = .zero
                        }
                    }
                    .padding(16)
                }
            }
        }
        .sheet(isPresented: $showAddNode) {
            AddNodeSheet(techniques: viewModel.techniques, onAdd: addNode)
        }
        .sheet(isPresented: $showEdgeEditor) {
            AddEdgeSheet(nodes: nodes, label: $edgeLabel, type: $edgeType, onSave: addEdge)
        }
        .sheet(isPresented: $showNodeEditor) {
            if let node = editingNode {
                EditNodeSheet(node: node, techniques: viewModel.techniques, onSave: updateNode)
            }
        }
        .sheet(isPresented: $showShareSheet) {
            FlowShareToGroupSheet(viewModel: viewModel, flow: flow)
        }
    }

    private func saveFlow() {
        let data = FlowData(nodes: nodes, edges: edges)
        let trimmedName = flowName.trimmingCharacters(in: .whitespacesAndNewlines)
        Task {
            await viewModel.updateFlowData(
                flowId: flow.id,
                flowData: data,
                name: trimmedName.isEmpty ? nil : trimmedName
            )
        }
    }

    private func handleNodeTap(_ node: FlowNodeData) {
        selectedNodeId = node.id
    }

    private func addNode(type: String, label: String?, techniqueId: String?) {
        let newNode = FlowNodeData(
            id: UUID().uuidString,
            type: type,
            label: label,
            techniqueId: techniqueId,
            positionX: 160,
            positionY: 200
        )
        nodes.append(newNode)
        showAddNode = false
    }

    private func updateNode(_ node: FlowNodeData) {
        nodes = nodes.map { existing in
            existing.id == node.id ? node : existing
        }
        showNodeEditor = false
    }

    private func deleteNode(_ node: FlowNodeData) {
        nodes.removeAll { $0.id == node.id }
        edges.removeAll { $0.source == node.id || $0.target == node.id }
    }

    private func addEdge(sourceId: String, targetId: String, label: String?, type: String) {
        let edge = FlowEdgeData(
            id: UUID().uuidString,
            source: sourceId,
            target: targetId,
            label: label,
            edgeType: type
        )
        edges.append(edge)
        showEdgeEditor = false
    }

    private func startConnection(from nodeId: String, at point: CGPoint) {
        isDraggingConnection = true
        connectionStart = (nodeId: nodeId, point: point)
        connectionEnd = point
    }

    private func updateConnection(to point: CGPoint) {
        connectionEnd = point
    }

    private func endConnection(at point: CGPoint) {
        defer {
            isDraggingConnection = false
            connectionStart = nil
        }

        guard let start = connectionStart else { return }

        // Find the node at the end point
        for node in nodes {
            let nodeFrame = CGRect(x: node.positionX - 70, y: node.positionY - 30, width: 140, height: 60)
            if nodeFrame.contains(point) && node.id != start.nodeId {
                // Create edge
                let edge = FlowEdgeData(
                    id: UUID().uuidString,
                    source: start.nodeId,
                    target: node.id,
                    label: nil,
                    edgeType: "default"
                )
                edges.append(edge)
                return
            }
        }
    }

    private var canvasDrag: some Gesture {
        DragGesture()
            .onChanged { value in
                offset = CGSize(
                    width: lastOffset.width + value.translation.width,
                    height: lastOffset.height + value.translation.height
                )
            }
            .onEnded { _ in
                lastOffset = offset
            }
    }

    private var canvasZoom: some Gesture {
        MagnificationGesture()
            .onChanged { value in
                scale = lastScale * value
            }
            .onEnded { _ in
                lastScale = scale
            }
    }

    private func nodeDrag(nodeId: String) -> some Gesture {
        DragGesture(minimumDistance: 8)
            .onChanged { value in
                if let index = nodes.firstIndex(where: { $0.id == nodeId }) {
                    // Store initial position if not already stored
                    if dragStartPositions[nodeId] == nil {
                        dragStartPositions[nodeId] = CGPoint(
                            x: nodes[index].positionX,
                            y: nodes[index].positionY
                        )
                    }

                    // Calculate new position from initial position + translation
                    if let startPos = dragStartPositions[nodeId] {
                        nodes[index].positionX = startPos.x + value.translation.width / scale
                        nodes[index].positionY = startPos.y + value.translation.height / scale
                    }
                }
            }
            .onEnded { _ in
                // Clear stored position after drag ends
                dragStartPositions.removeValue(forKey: nodeId)
            }
    }

    private func techniqueName(for node: FlowNodeData) -> String? {
        guard let techniqueId = node.techniqueId else { return nil }
        return viewModel.techniques.first(where: { $0.id == techniqueId })?.name
    }

    private func globalToCanvas(_ globalPoint: CGPoint, frame: CGRect) -> CGPoint {
        // Convert from global coordinates to canvas local coordinates
        let localX = globalPoint.x - frame.minX
        let localY = globalPoint.y - frame.minY
        // Account for scale and offset transformations
        let x = (localX - offset.width) / scale
        let y = (localY - offset.height) / scale
        return CGPoint(x: x, y: y)
    }
}

private struct FlowEditorHeader: View {
    let theme: BeltTheme
    @Binding var flowName: String
    let onSave: () -> Void
    let onAddNode: () -> Void
    let onShare: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            TextField("フロー名", text: $flowName)
                .font(.app(size: 16, weight: .bold))
                .foregroundStyle(theme.textPrimary)
                .padding(.vertical, 6)

            Spacer()

            Button(action: onAddNode) {
                Image(systemName: "plus")
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.primary)
                    .frame(width: 32, height: 32)
                    .background(theme.primary.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            Button(action: onShare) {
                Image(systemName: "paperplane.fill")
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(theme.primary)
                    .frame(width: 32, height: 32)
                    .background(theme.primary.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            Button(action: onSave) {
                Text("保存")
                    .font(.app(size: 13, weight: .semibold))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(theme.primary)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(theme.card)
        .overlay(
            Rectangle()
                .fill(theme.cardBorder)
                .frame(height: 1),
            alignment: .bottom
        )
    }
}

private struct FlowGridBackground: View {
    let color: Color
    let spacing: CGFloat = 24

    var body: some View {
        Canvas { context, size in
            let columns = Int(size.width / spacing)
            let rows = Int(size.height / spacing)
            for row in 0...rows {
                for column in 0...columns {
                    let x = CGFloat(column) * spacing
                    let y = CGFloat(row) * spacing
                    let dot = Path(ellipseIn: CGRect(x: x - 1, y: y - 1, width: 2, height: 2))
                    context.fill(dot, with: .color(color))
                }
            }
        }
        .opacity(0.5)
    }
}

private struct EdgeLayer: View {
    let nodes: [FlowNodeData]
    let edges: [FlowEdgeData]
    let theme: BeltTheme

    var body: some View {
        ZStack {
            Canvas { context, size in
                for render in renderEdges {
                    context.stroke(render.path, with: .color(render.color), lineWidth: 2)
                    if let arrow = render.arrow {
                        context.fill(arrow, with: .color(render.color))
                    }
                }
            }

            ForEach(renderEdges, id: \.id) { render in
                if let label = render.label {
                    Text(label)
                        .font(.app(size: 10, weight: .medium))
                        .padding(.horizontal, 6)
                        .padding(.vertical, 3)
                        .background(theme.card)
                        .foregroundStyle(theme.textMuted)
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 8, style: .continuous)
                                .stroke(theme.cardBorder, lineWidth: 1)
                        )
                        .position(render.labelPoint)
                }
            }
        }
    }

    private var renderEdges: [EdgeRender] {
        edges.compactMap { edge in
            guard let source = nodes.first(where: { $0.id == edge.source }),
                  let target = nodes.first(where: { $0.id == edge.target }) else { return nil }
            return EdgeRender(
                id: edge.id,
                source: CGPoint(x: source.positionX, y: source.positionY),
                target: CGPoint(x: target.positionX, y: target.positionY),
                label: edge.label,
                edgeType: edge.edgeType,
                theme: theme
            )
        }
    }
}

private struct FlowNodeView: View {
    let node: FlowNodeData
    let techniqueName: String?
    let theme: BeltTheme
    let isSelected: Bool
    let scale: CGFloat
    let offset: CGSize
    let onTap: () -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onConnectionStart: (CGPoint) -> Void
    let onConnectionDrag: (CGPoint) -> Void
    let onConnectionEnd: (CGPoint) -> Void

    var body: some View {
        VStack(spacing: 6) {
            Text(nodeTitle)
                .font(.app(size: 12, weight: .semibold))
                .foregroundStyle(theme.textPrimary)
                .lineLimit(1)

            Text(nodeTypeLabel)
                .font(.app(size: 9, weight: .medium))
                .foregroundStyle(theme.textMuted)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(theme.primary.opacity(0.15))
                .clipShape(Capsule())
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .frame(width: 140)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(isSelected ? theme.primary : theme.cardBorder, lineWidth: 1)
        )
        .shadow(color: theme.primary.opacity(0.08), radius: 10, x: 0, y: 6)
        .overlay(alignment: .top) {
            ConnectionPoint(theme: theme)
                .offset(y: -6)
                .gesture(
                    DragGesture(coordinateSpace: .global)
                        .onChanged { value in
                            if value.translation.width * value.translation.width + value.translation.height * value.translation.height > 100 {
                                onConnectionStart(value.startLocation)
                                onConnectionDrag(value.location)
                            }
                        }
                        .onEnded { value in
                            onConnectionEnd(value.location)
                        }
                )
        }
        .overlay(alignment: .bottom) {
            ConnectionPoint(theme: theme)
                .offset(y: 6)
                .gesture(
                    DragGesture(coordinateSpace: .global)
                        .onChanged { value in
                            if value.translation.width * value.translation.width + value.translation.height * value.translation.height > 100 {
                                onConnectionStart(value.startLocation)
                                onConnectionDrag(value.location)
                            }
                        }
                        .onEnded { value in
                            onConnectionEnd(value.location)
                        }
                )
        }
        .onTapGesture {
            onTap()
        }
        .contextMenu {
            Button("編集") { onEdit() }
            Button("削除", role: .destructive) { onDelete() }
        }
    }

    private var nodeTitle: String {
        if let techniqueName, !techniqueName.isEmpty {
            return techniqueName
        }
        if let label = node.label, !label.isEmpty {
            return label
        }
        return node.type == "technique" ? "技" : "ノード"
    }

    private var nodeTypeLabel: String {
        switch node.type {
        case "technique": return "技"
        case "condition": return "条件"
        case "note": return "メモ"
        default: return node.type
        }
    }
}

private struct ConnectionPoint: View {
    let theme: BeltTheme

    var body: some View {
        ZStack {
            // Larger invisible tap target
            Circle()
                .fill(Color.clear)
                .frame(width: 30, height: 30)

            // Visible connection point
            Circle()
                .fill(theme.primary)
                .frame(width: 12, height: 12)
                .overlay(
                    Circle()
                        .stroke(Color.white, lineWidth: 2)
                )
                .shadow(color: theme.primary.opacity(0.3), radius: 2, x: 0, y: 1)
        }
    }
}

private struct AddNodeSheet: View {
    let techniques: [Technique]
    @State private var type: String = "technique"
    @State private var label: String = ""
    @State private var selectedTechniqueId: String?
    @State private var showTechniquePicker = false

    let onAdd: (String, String?, String?) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Picker("種類", selection: $type) {
                    Text("技").tag("technique")
                    Text("条件").tag("condition")
                    Text("メモ").tag("note")
                }

                TextField("ラベル", text: $label)

                if type == "technique" {
                    Button(action: { showTechniquePicker = true }) {
                        HStack {
                            Text("技")
                            Spacer()
                            Text(selectedTechniqueName ?? "選択する")
                                .foregroundStyle(Color.secondary)
                        }
                    }
                }
            }
            .navigationTitle("ノード追加")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("追加") {
                        onAdd(type, label.isEmpty ? nil : label, selectedTechniqueId)
                    }
                }
            }
        }
        .sheet(isPresented: $showTechniquePicker) {
            TechniquePickerSheet(techniques: techniques, selectedId: $selectedTechniqueId)
        }
    }

    private var selectedTechniqueName: String? {
        guard let selectedTechniqueId else { return nil }
        return techniques.first(where: { $0.id == selectedTechniqueId })?.name
    }
}

private struct EditNodeSheet: View {
    @State private var node: FlowNodeData
    let techniques: [Technique]
    let onSave: (FlowNodeData) -> Void
    @State private var showTechniquePicker = false

    init(node: FlowNodeData, techniques: [Technique], onSave: @escaping (FlowNodeData) -> Void) {
        _node = State(initialValue: node)
        self.techniques = techniques
        self.onSave = onSave
    }

    var body: some View {
        NavigationStack {
            Form {
                TextField("ラベル", text: Binding(
                    get: { node.label ?? "" },
                    set: { node.label = $0.isEmpty ? nil : $0 }
                ))

                if node.type == "technique" {
                    Button(action: { showTechniquePicker = true }) {
                        HStack {
                            Text("技")
                            Spacer()
                            Text(selectedTechniqueName ?? "選択する")
                                .foregroundStyle(Color.secondary)
                        }
                    }
                }
            }
            .navigationTitle("ノード編集")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("保存") {
                        onSave(node)
                    }
                }
            }
        }
        .sheet(isPresented: $showTechniquePicker) {
            TechniquePickerSheet(techniques: techniques, selectedId: Binding(
                get: { node.techniqueId },
                set: { node.techniqueId = $0 }
            ))
        }
    }

    private var selectedTechniqueName: String? {
        guard let selectedId = node.techniqueId else { return nil }
        return techniques.first(where: { $0.id == selectedId })?.name
    }
}

private struct AddEdgeSheet: View {
    let nodes: [FlowNodeData]
    @State private var sourceId: String?
    @State private var targetId: String?

    @Binding var label: String
    @Binding var type: String
    let onSave: (String, String, String?, String) -> Void

    var body: some View {
        NavigationStack {
            Form {
                Picker("開始", selection: $sourceId) {
                    Text("未選択").tag(String?.none)
                    ForEach(nodes) { node in
                        Text(node.label ?? node.id).tag(String?(node.id))
                    }
                }

                Picker("終了", selection: $targetId) {
                    Text("未選択").tag(String?.none)
                    ForEach(nodes) { node in
                        Text(node.label ?? node.id).tag(String?(node.id))
                    }
                }

                TextField("ラベル", text: $label)

                Picker("タイプ", selection: $type) {
                    Text("Default").tag("default")
                    Text("Success").tag("success")
                    Text("Counter").tag("counter")
                }
            }
            .navigationTitle("エッジ追加")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("追加") {
                        guard let sourceId, let targetId, sourceId != targetId else { return }
                        onSave(sourceId, targetId, label.isEmpty ? nil : label, type)
                    }
                }
            }
        }
    }
}

private struct CanvasButton: View {
    let systemName: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.app(size: 16, weight: .semibold))
                .foregroundStyle(Color.white)
                .frame(width: 40, height: 40)
                .background(Color.black.opacity(0.5))
                .clipShape(Circle())
        }
        .buttonStyle(.plain)
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

private struct SearchBar: View {
    @Binding var query: String
    @Binding var isFiltering: Bool
    let theme: BeltTheme

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(theme.textMuted)
            TextField("技を検索...", text: $query)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .font(.app(size: 13, weight: .medium))
                .foregroundStyle(theme.textPrimary)
            Spacer()
            Button(action: { isFiltering.toggle() }) {
                Image(systemName: "line.3.horizontal.decrease")
                    .font(.app(size: 14, weight: .semibold))
                    .foregroundStyle(isFiltering ? .white : theme.textMuted)
                    .frame(width: 28, height: 28)
                    .background(isFiltering ? theme.primary : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(theme.card.opacity(0.9))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .shadow(color: theme.primary.opacity(0.05), radius: 12, x: 0, y: 6)
        .padding(.horizontal, 16)
    }
}

private struct FilterRow: View {
    @Binding var selectedType: String?
    let theme: BeltTheme

    private let types: [(String, String)] = [
        ("submission", "サブミッション"),
        ("sweep", "スイープ"),
        ("pass", "パスガード"),
        ("escape", "エスケープ"),
        ("takedown", "テイクダウン"),
        ("position", "ポジション"),
        ("other", "その他")
    ]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(types, id: \.0) { type in
                    let isSelected = selectedType == type.0
                    Button(action: { selectedType = isSelected ? nil : type.0 }) {
                        Text(type.1)
                            .font(.app(size: 11, weight: .medium))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .foregroundStyle(isSelected ? .white : theme.textMuted)
                            .background(isSelected ? theme.primary : theme.card.opacity(0.9))
                            .clipShape(Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(isSelected ? Color.clear : theme.cardBorder, lineWidth: 1)
                            )
                            .shadow(color: isSelected ? theme.primary.opacity(0.2) : .clear, radius: 8, x: 0, y: 4)
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }
}

private struct CategoryRow: View {
    let categories: [TechniqueCategory]
    @Binding var selectedCategory: String?
    let theme: BeltTheme
    let onAdd: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("カテゴリ")
                    .font(.app(size: 12, weight: .medium))
                    .foregroundStyle(theme.textMuted)
                Spacer()
                Button(action: onAdd) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus")
                            .font(.app(size: 10, weight: .bold))
                        Text("追加")
                            .font(.app(size: 11, weight: .medium))
                    }
                    .foregroundStyle(theme.primary)
                }
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    CategoryChip(
                        title: "すべて",
                        icon: nil,
                        isSelected: selectedCategory == nil,
                        theme: theme
                    ) {
                        selectedCategory = nil
                    }

                    ForEach(categories) { category in
                        CategoryChip(
                            title: category.name,
                            icon: category.icon,
                            isSelected: selectedCategory == category.id,
                            theme: theme
                        ) {
                            selectedCategory = selectedCategory == category.id ? nil : category.id
                        }
                    }
                }
            }
        }
    }
}

private struct CategoryChip: View {
    let title: String
    let icon: String?
    let isSelected: Bool
    let theme: BeltTheme
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon {
                    Text(icon)
                }
                Text(title)
            }
            .font(.app(size: 11, weight: .medium))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundStyle(isSelected ? .white : theme.textMuted)
            .background(isSelected ? theme.primary : theme.card.opacity(0.9))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(isSelected ? Color.clear : theme.cardBorder, lineWidth: 1)
            )
            .shadow(color: isSelected ? theme.primary.opacity(0.2) : .clear, radius: 8, x: 0, y: 4)
        }
    }
}

private struct TechniqueRow: View {
    let technique: Technique
    let category: TechniqueCategory?
    let theme: BeltTheme

    private var typeLabel: String {
        switch technique.techniqueType ?? "other" {
        case "submission": return "サブミッション"
        case "sweep": return "スイープ"
        case "pass": return "パスガード"
        case "escape": return "エスケープ"
        case "takedown": return "テイクダウン"
        case "position": return "ポジション"
        default: return "その他"
        }
    }

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(theme.primary.opacity(0.12))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(category?.icon ?? "🥋")
                        .font(.app(size: 18))
                )

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(technique.name)
                        .font(.app(size: 14, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                        .lineLimit(1)

                    if technique.masteryLevel == "favorite" {
                        Image(systemName: "star.fill")
                            .font(.app(size: 10, weight: .semibold))
                            .foregroundStyle(theme.primary)
                    }
                }

                HStack(spacing: 6) {
                    Text(typeLabel)
                        .font(.app(size: 10, weight: .semibold))
                        .foregroundStyle(theme.primary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(theme.primary.opacity(0.2))
                        .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))

                    if let tag = technique.tags?.first {
                        Text("#\(tag)")
                            .font(.app(size: 10, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                }
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.app(size: 12, weight: .semibold))
                .foregroundStyle(theme.textMuted)
        }
        .padding(12)
        .background(theme.card.opacity(0.95))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .shadow(color: theme.primary.opacity(0.06), radius: 12, x: 0, y: 6)
    }
}

private struct TechniquePickerSheet: View {
    let techniques: [Technique]
    @Binding var selectedId: String?
    @Environment(\.dismiss) private var dismiss

    @State private var query = ""
    @State private var selectedCategory: String? = nil
    @State private var selectedType: String? = nil
    @State private var showFilters = false
    @State private var categories: [TechniqueCategory] = TechniqueCategory.defaultCategories

    var body: some View {
        let theme = BeltTheme(belt: .white)

        ZStack {
            LinearGradient(
                colors: [theme.primary.opacity(0.08), theme.background],
                startPoint: .topLeading,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 12) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("技を選択")
                            .font(.app(size: 20, weight: .bold))
                            .foregroundStyle(theme.textPrimary)
                        Text("タップで選択")
                            .font(.app(size: 11, weight: .medium))
                            .foregroundStyle(theme.textMuted)
                    }
                    Spacer()
                    Button("閉じる") { dismiss() }
                        .font(.app(size: 12, weight: .medium))
                        .foregroundStyle(theme.primary)
                }
                .padding(.horizontal, 16)
                .padding(.top, 16)

                SearchBar(query: $query, isFiltering: $showFilters, theme: theme)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        if showFilters {
                            FilterRow(selectedType: $selectedType, theme: theme)
                        }

                        CategoryRow(
                            categories: categories,
                            selectedCategory: $selectedCategory,
                            theme: theme,
                            onAdd: {}
                        )

                        VStack(spacing: 10) {
                            HStack {
                                Text("技一覧 (\(filteredTechniques.count))")
                                    .font(.app(size: 12, weight: .medium))
                                    .foregroundStyle(theme.textMuted)
                                Spacer()
                            }

                            if filteredTechniques.isEmpty {
                                EmptyStateView(message: query.isEmpty ? "技がありません" : "技が見つかりません", theme: theme)
                            } else {
                                ForEach(sortedTechniques) { technique in
                                    TechniqueRow(
                                        technique: technique,
                                        category: categories.first { $0.id == technique.category },
                                        theme: theme
                                    )
                                    .onTapGesture {
                                        selectedId = technique.id
                                        dismiss()
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.bottom, 24)
                }
            }
        }
    }

    private var filteredTechniques: [Technique] {
        var result = techniques
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty {
            let lowered = trimmed.lowercased()
            result = result.filter { tech in
                tech.name.lowercased().contains(lowered) ||
                (tech.nameEn?.lowercased().contains(lowered) ?? false) ||
                (tech.tags?.contains { $0.lowercased().contains(lowered) } ?? false)
            }
        }

        if let selectedCategory {
            result = result.filter { $0.category == selectedCategory }
        }

        if let selectedType {
            result = result.filter { $0.techniqueType == selectedType }
        }

        return result
    }

    private var sortedTechniques: [Technique] {
        let order: [String: Int] = ["favorite": 0, "learned": 1, "learning": 2]
        return filteredTechniques.sorted { left, right in
            let l = order[left.masteryLevel ?? "learning"] ?? 2
            let r = order[right.masteryLevel ?? "learning"] ?? 2
            return l < r
        }
    }
}

private struct EdgeRender: Identifiable {
    let id: String
    let path: Path
    let arrow: Path?
    let label: String?
    let labelPoint: CGPoint
    let color: Color

    init(id: String, source: CGPoint, target: CGPoint, label: String?, edgeType: String, theme: BeltTheme) {
        let dx = target.x - source.x
        let dy = target.y - source.y
        let mid = CGPoint(x: (source.x + target.x) / 2, y: (source.y + target.y) / 2)
        let length = max(1, sqrt(dx * dx + dy * dy))
        let nx = -dy / length
        let ny = dx / length
        let curveOffset: CGFloat = min(40, length / 3)
        let control = CGPoint(x: mid.x + nx * curveOffset, y: mid.y + ny * curveOffset)

        var path = Path()
        path.move(to: source)
        path.addQuadCurve(to: target, control: control)

        let color: Color
        switch edgeType {
        case "success":
            color = Color.green
        case "counter":
            color = Color.red
        default:
            color = theme.textMuted
        }

        let angle = atan2(target.y - control.y, target.x - control.x)
        let arrowSize: CGFloat = 8
        let arrowP1 = CGPoint(
            x: target.x - cos(angle - .pi / 6) * arrowSize,
            y: target.y - sin(angle - .pi / 6) * arrowSize
        )
        let arrowP2 = CGPoint(
            x: target.x - cos(angle + .pi / 6) * arrowSize,
            y: target.y - sin(angle + .pi / 6) * arrowSize
        )
        var arrow = Path()
        arrow.move(to: target)
        arrow.addLine(to: arrowP1)
        arrow.addLine(to: arrowP2)
        arrow.closeSubpath()

        self.id = id
        self.path = path
        self.arrow = arrow
        self.label = label
        self.labelPoint = CGPoint(x: mid.x + nx * (curveOffset + 12), y: mid.y + ny * (curveOffset + 12))
        self.color = color
    }
}
