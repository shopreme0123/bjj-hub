import Foundation
import StoreKit
import Combine

enum PremiumPlan: String, CaseIterable, Identifiable {
    case monthly
    case yearly

    var id: String { rawValue }

    var title: String {
        switch self {
        case .monthly: return "月額"
        case .yearly: return "年額"
        }
    }

    var price: String {
        switch self {
        case .monthly: return "¥500"
        case .yearly: return "¥5,000"
        }
    }

    var subtitle: String {
        switch self {
        case .monthly: return "いつでもキャンセル可能"
        case .yearly: return "2ヶ月分お得"
        }
    }

    var productId: String {
        switch self {
        case .monthly: return "bjjhub_premium_monthly"
        case .yearly: return "bjjhub_premium_yearly"
        }
    }
}

enum PremiumStoreError: Error {
    case failedVerification
}

@MainActor
final class PremiumManager: ObservableObject {
    @Published var isPremium = false
    @Published var products: [PremiumPlan: Product] = [:]
    @Published var isLoading = false
    @Published var lastErrorMessage: String?

    private var updatesTask: Task<Void, Never>?

    deinit {
        updatesTask?.cancel()
    }

    func start() {
        updatesTask?.cancel()
        updatesTask = Task {
            await listenForTransactions()
        }
        Task {
            await refresh()
        }
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let storeProducts = try await Product.products(for: PremiumPlan.allCases.map(\.productId))
            var mapped: [PremiumPlan: Product] = [:]
            for plan in PremiumPlan.allCases {
                if let product = storeProducts.first(where: { $0.id == plan.productId }) {
                    mapped[plan] = product
                }
            }
            products = mapped
        } catch {
            lastErrorMessage = "商品情報の取得に失敗しました。通信環境を確認してください。"
        }

        await updatePremiumStatus()
    }

    func purchase(plan: PremiumPlan) async -> Bool {
        guard let product = products[plan] else {
            lastErrorMessage = "商品情報を取得できませんでした。"
            return false
        }

        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)
                await transaction.finish()
                await updatePremiumStatus()
                return true
            case .pending:
                lastErrorMessage = "購入が保留中です。"
                return false
            case .userCancelled:
                return false
            @unknown default:
                lastErrorMessage = "購入に失敗しました。"
                return false
            }
        } catch {
            lastErrorMessage = "購入に失敗しました。通信環境を確認してください。"
            return false
        }
    }

    func priceText(for plan: PremiumPlan) -> String {
        products[plan]?.displayPrice ?? plan.price
    }

    private func listenForTransactions() async {
        for await result in Transaction.updates {
            if let transaction = try? checkVerified(result) {
                await transaction.finish()
                await updatePremiumStatus()
            }
        }
    }

    private func updatePremiumStatus() async {
        var hasActiveSubscription = false
        for await result in Transaction.currentEntitlements {
            guard let transaction = try? checkVerified(result) else { continue }
            guard PremiumPlan.allCases.contains(where: { $0.productId == transaction.productID }) else { continue }
            if let expiration = transaction.expirationDate {
                if expiration > Date() {
                    hasActiveSubscription = true
                }
            } else {
                hasActiveSubscription = true
            }
        }
        isPremium = hasActiveSubscription
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified:
            throw PremiumStoreError.failedVerification
        }
    }
}
