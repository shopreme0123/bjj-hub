export default function AuthVerifiedPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
        <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-emerald-600"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">登録が完了しました</h1>
        <p className="mt-3 text-sm text-slate-600">
          メールアドレスの確認が完了しました。<br />
          アプリに戻ってログインしてください。
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="/home"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
          >
            アプリへ戻る
          </a>
          <a href="/" className="text-sm text-slate-500 underline">
            トップページへ
          </a>
        </div>
      </div>
    </main>
  );
}
