import SwiftUI

struct TechniquesView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var query = ""
    @State private var showAdd = false
    @State private var showAddCategory = false
    @State private var selectedTechnique: Technique?
    let selectedTechniqueId: String?
    @State private var selectedCategory: String? = nil
    @State private var selectedType: String? = nil
    @State private var showFilters = false
    @State private var hasOpenedInitialTechnique = false

    // Combine default and custom categories
    private var categories: [TechniqueCategory] {
        TechniqueCategory.defaultCategories + viewModel.customCategories
    }

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
                // Fixed header section
                VStack(spacing: 12) {
                    HStack {
                        SectionHeaderView(title: "技", theme: theme)
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

                    SearchBar(
                        query: $query,
                        isFiltering: $showFilters,
                        theme: theme
                    )

                    if showFilters {
                        FilterRow(selectedType: $selectedType, theme: theme)
                    }

                    CategoryRow(
                        categories: categories,
                        selectedCategory: $selectedCategory,
                        theme: theme,
                        onAdd: { showAddCategory = true }
                    )

                    if !viewModel.isPremium {
                        AdBannerView(theme: theme, placement: .techniques)
                            .padding(.horizontal, 16)
                    }
                }
                .padding(.top, 16)

                // Scrollable techniques list
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {
                        if sortedTechniques.isEmpty {
                            EmptyStateView(message: query.isEmpty ? "技を追加してみましょう" : "技が見つかりません", theme: theme)
                                .padding(.horizontal, 16)
                                .padding(.top, 24)
                        } else {
                            VStack(spacing: 12) {
                                HStack {
                                    Text("技一覧 (\(filteredTechniques.count))")
                                        .font(.caption(13, weight: .bold))
                                        .foregroundStyle(theme.textMuted)
                                    Spacer()
                                }
                                .padding(.horizontal, 16)

                                ForEach(sortedTechniques) { technique in
                                    TechniqueRowButton(
                                        technique: technique,
                                        category: categories.first { $0.id == technique.category },
                                        theme: theme
                                    ) {
                                        selectedTechnique = technique
                                    }
                                    .padding(.horizontal, 16)
                                }
                            }
                        }

                        Button(action: { showAdd = true }) {
                            HStack(spacing: 8) {
                                Image(systemName: "plus.circle")
                                    .font(.system(size: 16, weight: .semibold))
                                Text("技を追加")
                                    .font(.body(15, weight: .bold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .foregroundStyle(theme.primary)
                            .background(theme.card)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(theme.primary.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8, 4]))
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)
                    }
                    .padding(.top, 12)
                    .padding(.bottom, 96)
                }
            }
        }
        .sheet(isPresented: $showAdd) {
            TechniqueFormView(viewModel: viewModel, initialTechnique: nil)
        }
        .sheet(isPresented: $showAddCategory) {
            AddCategorySheet(viewModel: viewModel)
        }
        .sheet(item: $selectedTechnique) { technique in
            TechniqueDetailView(viewModel: viewModel, technique: technique)
        }
        .onAppear {
            openSelectedTechnique()
        }
        .onChange(of: selectedTechniqueId) {
            openSelectedTechnique()
        }
        .onChange(of: viewModel.techniques.count) {
            openSelectedTechnique()
        }
    }

    private func openSelectedTechnique() {
        guard let selectedTechniqueId, !hasOpenedInitialTechnique else { return }
        if let technique = viewModel.techniques.first(where: { $0.id == selectedTechniqueId }) {
            selectedTechnique = technique
            hasOpenedInitialTechnique = true
        }
    }

    private var filteredTechniques: [Technique] {
        var result = viewModel.techniques
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty {
            let lowered = trimmed.lowercased()
            result = result.filter { tech in
                tech.name.lowercased().contains(lowered) ||
                (tech.nameEn?.lowercased().contains(lowered) ?? false)
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
        return filteredTechniques.sorted { left, right in
            return (left.createdAt ?? "") > (right.createdAt ?? "")
        }
    }
}

private struct HeaderRow: View {
    let theme: BeltTheme
    let onAdd: () -> Void
    @State private var isPressed = false

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("技ライブラリ")
                    .font(.display(24, weight: .heavy))
                    .foregroundStyle(theme.textPrimary)
                Text("あなたの技を整理して育てる")
                    .font(.caption(12, weight: .medium))
                    .foregroundStyle(theme.textMuted)
            }

            Spacer()

            Button(action: onAdd) {
                HStack(spacing: 6) {
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .bold))
                    Text("技を追加")
                        .font(.caption(13, weight: .bold))
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(theme.gradient)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .shadow(color: theme.primary.opacity(0.3), radius: 8, x: 0, y: 4)
                .scaleEffect(isPressed ? 0.95 : 1.0)
                .animation(.easeInOut(duration: 0.12), value: isPressed)
            }
            .buttonStyle(.plain)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in isPressed = true }
                    .onEnded { _ in isPressed = false }
            )
        }
        .padding(.horizontal, 16)
    }
}

private struct SearchBar: View {
    @Binding var query: String
    @Binding var isFiltering: Bool
    let theme: BeltTheme
    @FocusState private var isFocused: Bool

    var body: some View {
        HStack(spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(isFocused ? theme.primary : theme.textMuted)

                TextField("技を検索...", text: $query)
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

            Button(action: {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isFiltering.toggle()
                }
            }) {
                Image(systemName: isFiltering ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(isFiltering ? theme.primary : theme.textMuted)
                    .frame(width: 44, height: 44)
                    .background(isFiltering ? theme.primary.opacity(0.1) : Color.clear)
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal, 16)
        .animation(.easeInOut(duration: 0.2), value: isFocused)
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
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 12) {
                Text("カテゴリ")
                    .font(.body(16, weight: .heavy))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                Button(action: onAdd) {
                    Image(systemName: "plus")
                        .font(.app(size: 14, weight: .semibold))
                        .foregroundStyle(theme.primary)
                        .frame(width: 32, height: 32)
                        .background(theme.primary.opacity(0.12))
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
            }
            .padding(.horizontal, 16)

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
                .padding(.horizontal, 16)
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
                        .font(.system(size: 14))
                }
                Text(title)
                    .font(.caption(12, weight: .bold))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 8)
            .foregroundStyle(isSelected ? .white : theme.textPrimary)
            .background {
                if isSelected {
                    theme.gradient
                } else {
                    theme.card
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(isSelected ? Color.clear : theme.cardBorder, lineWidth: 1.5)
            )
            .shadow(color: isSelected ? Color.clear : Color.black.opacity(0.03), radius: isSelected ? 0 : 4, x: 0, y: isSelected ? 0 : 2)
        }
        .buttonStyle(.plain)
    }
}

private struct TechniqueRowButton: View {
    let technique: Technique
    let category: TechniqueCategory?
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
            TechniqueRow(technique: technique, category: category, theme: theme)
                .scaleEffect(isPressed ? 0.97 : 1.0)
        }
        .buttonStyle(.plain)
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
        HStack(spacing: 14) {
            // Icon
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [theme.primary.opacity(0.15), theme.primary.opacity(0.08)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 56, height: 56)
                .overlay(
                    Text(category?.icon ?? "🥋")
                        .font(.system(size: 24))
                )

            VStack(alignment: .leading, spacing: 6) {
                // Title
                Text(technique.name)
                    .font(.body(15, weight: .bold))
                    .foregroundStyle(theme.textPrimary)
                    .lineLimit(1)

                // Type badge
                HStack(spacing: 4) {
                    Circle()
                        .fill(theme.primary)
                        .frame(width: 6, height: 6)
                    Text(typeLabel)
                        .font(.caption(11, weight: .semibold))
                        .foregroundStyle(theme.textPrimary)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(theme.background)
                .clipShape(Capsule())
            }

            Spacer()

            // Chevron
            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(theme.textMuted.opacity(0.5))
        }
        .padding(14)
        .background(theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(theme.cardBorder, lineWidth: 1)
        )
        .shadow(color: Color.black.opacity(0.04), radius: 12, x: 0, y: 4)
    }
}

private struct AddCategorySheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var viewModel: AppViewModel
    @State private var name = ""
    @State private var icon = "🥋"

    private let emojiOptions = ["🥋", "💪", "🦶", "✋", "🔄", "⚔️", "🎯", "🏆", "⭐", "🔥", "💎", "🌟"]

    var body: some View {
        NavigationStack {
            Form {
                TextField("カテゴリ名", text: $name)
                Picker("アイコン", selection: $icon) {
                    ForEach(emojiOptions, id: \.self) { option in
                        Text(option).tag(option)
                    }
                }
            }
            .navigationTitle("カテゴリ追加")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("キャンセル") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("追加") {
                        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
                        guard !trimmed.isEmpty else { return }
                        let category = TechniqueCategory(id: "custom-\(UUID().uuidString)", name: trimmed, icon: icon)
                        viewModel.addCustomCategory(category)
                        dismiss()
                    }
                }
            }
        }
    }
}
