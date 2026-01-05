#!/bin/bash
# iOS App Store 用のセットアップスクリプト

echo "📱 BJJ Hub - iOS App Store セットアップ"
echo "========================================="
echo ""

# Capacitor のインストール
echo "📦 Capacitor をインストール中..."
npm install @capacitor/core @capacitor/cli @capacitor/ios

# Capacitor の初期化チェック
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚠️  capacitor.config.ts が見つかりません"
    echo "既に作成済みのファイルを使用します"
fi

# iOS プロジェクトの追加
echo ""
echo "🍎 iOS プロジェクトを作成中..."
if [ -d "ios" ]; then
    echo "⚠️  ios ディレクトリが既に存在します"
    echo "既存のプロジェクトをスキップします"
else
    npx cap add ios
fi

# ビルド
echo ""
echo "🔨 アプリをビルド中..."
npm run build:ios

echo ""
echo "✅ セットアップ完了！"
echo ""
echo "📌 次のステップ:"
echo "1. capacitor.config.ts の appId を変更してください"
echo "   例: 'com.yourname.bjjhub'"
echo ""
echo "2. Xcode でプロジェクトを開く:"
echo "   npm run cap:ios"
echo ""
echo "3. Xcode で Bundle Identifier と Team を設定"
echo ""
echo "4. 詳細は APP_STORE_GUIDE.md を参照してください"
echo ""
