import SwiftUI

struct MainTabView: View {
    @StateObject var viewModel = AppViewModel()
    @State private var activeTab: TabItem = .home
    @State private var showSettings = false
    @State private var showDiaryFromHome = false
    @State private var showTechniquesFromHome = false
    @State private var selectedDiaryLog: TrainingLog?
    @State private var selectedTechnique: Technique?

    var body: some View {
        let theme = BeltTheme(belt: viewModel.beltColor)

        NavigationStack {
            ZStack {
                theme.background.ignoresSafeArea()

                VStack(spacing: 0) {
                    ZStack {
                        HomeView(
                            viewModel: viewModel,
                            onOpenSettings: {
                                showSettings = true
                            },
                            onOpenDiary: {
                                showDiaryFromHome = true
                            },
                            onSelectLog: { log in
                                selectedDiaryLog = log
                            },
                            onOpenTechniques: {
                                showTechniquesFromHome = true
                            },
                            onSelectTechnique: { technique in
                                selectedTechnique = technique
                            }
                        )
                        .opacity(activeTab == .home ? 1 : 0)
                        .zIndex(activeTab == .home ? 1 : 0)

                        TechniquesView(viewModel: viewModel, selectedTechniqueId: nil)
                            .opacity(activeTab == .techniques ? 1 : 0)
                            .zIndex(activeTab == .techniques ? 1 : 0)

                        DiaryView(viewModel: viewModel, selectedLogId: nil)
                            .opacity(activeTab == .diary ? 1 : 0)
                            .zIndex(activeTab == .diary ? 1 : 0)

                    }
                    .animation(viewModel.enableTabAnimations ? .easeInOut(duration: 0.2) : nil, value: activeTab)
                }

                // Error Popup - Always in front
                if viewModel.showErrorPopup, let errorMessage = viewModel.errorMessage {
                    ErrorPopup(
                        message: errorMessage,
                        theme: theme,
                        onDismiss: { viewModel.dismissError() }
                    )
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .zIndex(999999)
                    .ignoresSafeArea(.all)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            BottomTabBar(activeTab: $activeTab, theme: theme)
        }
        .task {
            await viewModel.loadIfNeeded()
        }
        .sheet(isPresented: $showSettings) {
            SettingsView(viewModel: viewModel)
        }
        .sheet(isPresented: $viewModel.showPremiumSheet) {
            PremiumView(viewModel: viewModel)
        }
        .sheet(isPresented: $showDiaryFromHome) {
            DiaryView(viewModel: viewModel, selectedLogId: nil)
        }
        .sheet(isPresented: $showTechniquesFromHome) {
            TechniquesView(viewModel: viewModel, selectedTechniqueId: nil)
        }
        .sheet(item: $selectedDiaryLog) { log in
            DiaryDetailView(viewModel: viewModel, log: log)
        }
        .sheet(item: $selectedTechnique) { technique in
            TechniqueDetailView(viewModel: viewModel, technique: technique)
        }
    }
}

private struct PlaceholderView: View {
    let title: String

    var body: some View {
        VStack {
            Text(title)
                .font(.app(size: 18, weight: .bold))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct BottomTabBar: View {
    @Binding var activeTab: TabItem
    let theme: BeltTheme

    var body: some View {
        HStack {
            ForEach(TabItem.allCases, id: \.self) { item in
                Button(action: {
                    activeTab = item
                }) {
                    VStack(spacing: 4) {
                        Image(systemName: item.icon)
                            .font(.app(size: 16, weight: .semibold))
                        Text(item.title)
                            .font(.app(size: 10, weight: .medium))
                    }
                    .foregroundStyle(activeTab == item ? theme.primary : theme.textMuted)
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 16)
        .padding(.top, 8)
        .padding(.bottom, 6)
        .background(theme.card)
        .overlay(
            Rectangle()
                .fill(theme.cardBorder)
                .frame(height: 1),
            alignment: .top
        )
    }
}

private enum TabItem: CaseIterable {
    case home
    case techniques
    case diary

    var title: String {
        switch self {
        case .home: return "ホーム"
        case .techniques: return "技"
        case .diary: return "日記"
        }
    }

    var icon: String {
        switch self {
        case .home: return "house"
        case .techniques: return "book.closed"
        case .diary: return "calendar"
        }
    }
}
