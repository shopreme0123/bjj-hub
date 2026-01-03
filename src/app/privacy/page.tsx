import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← トップページに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
        <p className="text-gray-600 mb-8">最終更新日: 2026年1月3日</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. はじめに</h2>
            <p>
              BJJ Hub（以下「当サービス」）は、ユーザーの皆様のプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーは、当サービスがどのような情報を収集し、どのように使用・保護するかを説明するものです。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. 収集する情報</h2>
            <p className="mb-2">当サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>アカウント情報</strong>: メールアドレス、表示名、プロフィール情報</li>
              <li><strong>利用データ</strong>: 登録した技、フロー、練習日記、トレーニングログ</li>
              <li><strong>技術情報</strong>: IPアドレス、ブラウザ情報、デバイス情報、アクセスログ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. データの取り扱いと保管</h2>
            <p className="mb-2">
              当サービスは、データベースとして<strong>Supabase</strong>を使用しています。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>すべてのデータは暗号化された状態で保管されます</li>
              <li>認証情報は業界標準のセキュリティプロトコルで保護されます</li>
              <li>ユーザーデータは他のユーザーと共有されることはありません（グループ機能で明示的に共有した場合を除く）</li>
              <li>データは日本国内またはSupabaseが提供する安全なデータセンターに保管されます</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 情報の利用目的</h2>
            <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>サービスの提供・運営・改善</li>
              <li>ユーザーサポートの提供</li>
              <li>不正利用の防止とセキュリティの維持</li>
              <li>利用状況の分析とサービス品質の向上</li>
              <li>重要なお知らせの送信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. 第三者への情報提供</h2>
            <p className="mb-2">
              当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供することはありません：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>ユーザーの同意がある場合</li>
              <li>法律により開示が求められた場合</li>
              <li>サービスの運営に必要な範囲で、業務委託先に提供する場合（守秘義務契約を締結します）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookie（クッキー）の使用</h2>
            <p>
              当サービスでは、ユーザー体験の向上のためにCookieを使用します。
              Cookieは、ログイン状態の維持や、利用状況の分析に使用されます。
              ブラウザの設定でCookieを無効にすることもできますが、一部機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. ユーザーの権利</h2>
            <p className="mb-2">ユーザーは、以下の権利を有します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>自身の個人情報へのアクセス権</li>
              <li>個人情報の訂正・削除を求める権利</li>
              <li>アカウントの削除を求める権利</li>
              <li>データのエクスポートを求める権利</li>
            </ul>
            <p className="mt-2">
              これらの権利を行使したい場合は、設定画面またはお問い合わせよりご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. セキュリティ</h2>
            <p>
              当サービスは、ユーザーの個人情報を保護するため、適切な技術的・組織的措置を講じています。
              ただし、インターネット上の送信は完全に安全であることを保証することはできません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. 子供のプライバシー</h2>
            <p>
              当サービスは、13歳未満の子供を対象としていません。
              13歳未満の子供の個人情報を意図的に収集することはありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. プライバシーポリシーの変更</h2>
            <p>
              当サービスは、必要に応じて本プライバシーポリシーを変更することがあります。
              変更があった場合は、サービス上で通知いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. お問い合わせ</h2>
            <p>
              プライバシーポリシーに関するご質問・ご意見は、以下までお問い合わせください：
            </p>
            <p className="mt-2">
              <a
                href="https://x.com/bjjshopreme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                X (Twitter): @bjjshopreme
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
