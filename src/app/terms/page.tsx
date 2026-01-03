import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← トップページに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
        <p className="text-gray-600 mb-8">最終更新日: 2026年1月3日</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. はじめに</h2>
            <p>
              本利用規約（以下「本規約」）は、BJJ Hub（以下「当サービス」）の利用条件を定めるものです。
              当サービスをご利用いただくには、本規約に同意いただく必要があります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. サービスの内容</h2>
            <p className="mb-2">当サービスは、ブラジリアン柔術の練習者向けに以下の機能を提供します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>技の記録・管理</li>
              <li>フロー（技の連携）の作成・管理</li>
              <li>練習日記の記録</li>
              <li>グループでの情報共有</li>
              <li>その他、柔術の練習をサポートする機能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. アカウント登録</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>当サービスを利用するには、アカウント登録が必要です</li>
              <li>登録情報は正確かつ最新のものを提供してください</li>
              <li>アカウント情報（パスワード等）の管理は、ユーザー自身の責任で行ってください</li>
              <li>アカウントの不正利用が確認された場合、直ちにご連絡ください</li>
              <li>1人のユーザーが複数のアカウントを作成することは原則禁止です</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. 禁止事項</h2>
            <p className="mb-2">当サービスの利用にあたり、以下の行為を禁止します：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>他のユーザーや第三者の権利を侵害する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>不正アクセスやハッキング行為</li>
              <li>スパム行為や過度な宣伝行為</li>
              <li>他人のアカウントを不正に使用する行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. コンテンツの権利</h2>
            <p className="mb-2">
              ユーザーが当サービスに投稿したコンテンツ（技の情報、フロー、日記等）の著作権は、ユーザーに帰属します。
            </p>
            <p>
              ただし、ユーザーは当サービスに対し、投稿したコンテンツをサービスの提供・改善のために使用することを許諾するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. サービスの変更・停止</h2>
            <p className="mb-2">当サービスは、以下の場合にサービスの全部または一部を変更・停止することがあります：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>システムのメンテナンスや更新を行う場合</li>
              <li>天災、停電、その他の不可抗力により提供が困難な場合</li>
              <li>サービスの改善・向上のために必要な場合</li>
            </ul>
            <p className="mt-2">
              これらの場合、事前に通知するよう努めますが、緊急の場合は事前通知なく変更・停止することがあります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. 免責事項</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>当サービスは現状有姿で提供され、その完全性、正確性、有用性について保証しません</li>
              <li>当サービスの利用により生じた損害について、当サービスは一切の責任を負いません</li>
              <li>ユーザー間のトラブルについて、当サービスは一切の責任を負いません</li>
              <li>外部サイトへのリンクについて、当サービスはその内容を保証しません</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. アカウントの削除・停止</h2>
            <p className="mb-2">以下の場合、当サービスはユーザーのアカウントを削除・停止することがあります：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>本規約に違反した場合</li>
              <li>長期間利用がない場合</li>
              <li>その他、当サービスが不適切と判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. データのバックアップ</h2>
            <p>
              当サービスはデータの安全な保管に努めますが、データの完全性を保証するものではありません。
              重要なデータについては、ユーザー自身でバックアップを取ることを推奨します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. 利用規約の変更</h2>
            <p>
              当サービスは、必要に応じて本規約を変更することがあります。
              変更後の規約は、サービス上に掲載した時点で効力を生じるものとします。
              変更があった場合は、サービス上で通知いたします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. 準拠法と管轄裁判所</h2>
            <p>
              本規約は日本法に準拠し、当サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. お問い合わせ</h2>
            <p>
              本規約に関するご質問・ご意見は、以下までお問い合わせください：
            </p>
            <p className="mt-2">
              <a
                href="https://x.com/lifeishabit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                X (Twitter): @lifeishabit
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
