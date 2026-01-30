'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function RootPage() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="landing">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@300;400;500;600;700;800&family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');

        :root {
          --bg: #ffffff;
          --bg-soft: #f8fafc;
          --bg-card: #ffffff;
          --text: #1e293b;
          --muted: #64748b;
          --accent: #2b6ff6;
          --accent-2: #0ea5e9;
          --accent-3: #f1f5f9;
          --stroke: #e2e8f0;
          --glow: rgba(43, 111, 246, 0.2);
          --shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Manrope', 'Noto Sans JP', sans-serif;
        }

        .landing {
          min-height: 100vh;
          background:
            radial-gradient(1200px 600px at 80% -10%, rgba(43, 111, 246, 0.06), transparent 60%),
            radial-gradient(900px 500px at -10% 10%, rgba(14, 165, 233, 0.05), transparent 60%),
            var(--bg);
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(18px);
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid var(--stroke);
        }

        .nav-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text);
        }

        .logo-badge {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display: grid;
          place-items: center;
          box-shadow: 0 10px 30px var(--glow);
          transition: all 0.3s ease;
        }

        .logo:hover .logo-badge {
          transform: rotate(5deg) scale(1.05);
          box-shadow: 0 12px 36px var(--glow);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .logo-text strong {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 2px;
        }

        .logo-text span {
          font-size: 0.75rem;
          color: var(--muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          list-style: none;
        }

        .nav-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .nav-links a:hover {
          color: var(--accent);
        }

        .nav-links a:hover::after {
          transform: scaleX(1);
        }

        .cta {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          text-decoration: none;
          padding: 0.7rem 1.6rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 8px 20px var(--glow);
          transition: all 0.2s ease;
        }

        .cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px var(--glow);
        }

        .hero {
          max-width: 1120px;
          margin: 0 auto;
          padding: 6rem 1.5rem 4rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          align-items: center;
        }

        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.6rem);
          letter-spacing: 2px;
          line-height: 1.05;
        }

        .hero-title span {
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-text {
          color: var(--muted);
          margin-top: 1.5rem;
          font-size: 1.05rem;
          line-height: 1.9;
        }

        .hero-actions {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .ghost {
          border: 1px solid var(--stroke);
          color: var(--text);
          text-decoration: none;
          padding: 0.7rem 1.6rem;
          border-radius: 999px;
          font-weight: 600;
          background: white;
          transition: all 0.2s ease;
        }

        .ghost:hover {
          background: var(--bg-soft);
          border-color: var(--accent);
        }

        .hero-card {
          background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95));
          border: 1px solid var(--stroke);
          border-radius: 28px;
          padding: 2rem;
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
        }

        .hero-card::after {
          content: '';
          position: absolute;
          inset: -30% 40% auto -20%;
          height: 200px;
          background: radial-gradient(circle, rgba(43, 111, 246, 0.08), transparent 70%);
          opacity: 0.6;
        }

        .hero-card h3 {
          font-size: 1.1rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .hero-card-grid {
          display: grid;
          gap: 1rem;
        }

        .hero-pill {
          padding: 1rem 1.2rem;
          border-radius: 16px;
          background: white;
          border: 1px solid var(--stroke);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }

        .hero-pill strong {
          display: block;
          font-size: 1.05rem;
          margin-bottom: 0.4rem;
        }

        .hero-pill span {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .section {
          max-width: 1120px;
          margin: 0 auto;
          padding: 4.5rem 1.5rem;
        }

        .section-title {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          margin-bottom: 1rem;
        }

        .section-desc {
          color: var(--muted);
          max-width: 640px;
          line-height: 1.8;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: white;
          border: 1px solid var(--stroke);
          border-radius: 20px;
          padding: 1.8rem;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          transform: scaleX(0);
          transition: transform 0.4s ease;
        }

        .feature-card:hover {
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
          transform: translateY(-6px);
          border-color: var(--accent);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-card h4 {
          font-size: 1.1rem;
          margin-bottom: 0.6rem;
        }

        .feature-card p {
          color: var(--muted);
          line-height: 1.7;
          font-size: 0.95rem;
        }

        .ad-block {
          margin: 3rem auto;
          max-width: 1120px;
          padding: 0 1.5rem;
        }

        .ad-shell {
          border: 1px solid var(--stroke);
          border-radius: 18px;
          background: var(--bg-soft);
          padding: 1.2rem;
        }

        .split {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2.5rem;
          align-items: center;
        }

        .mock {
          border-radius: 28px;
          padding: 2rem;
          background: linear-gradient(160deg, rgba(43, 111, 246, 0.08), rgba(14, 165, 233, 0.05));
          border: 1px solid var(--stroke);
          box-shadow: var(--shadow);
        }

        .mock h5 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .stat-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat {
          background: white;
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 1rem 1.2rem;
          min-width: 120px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: all 0.3s ease;
        }

        .stat:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          border-color: var(--accent);
        }

        .stat strong {
          font-size: 1.4rem;
        }

        .stat span {
          display: block;
          color: var(--muted);
          margin-top: 0.3rem;
          font-size: 0.85rem;
        }

        .belt-row {
          display: flex;
          gap: 0.8rem;
          flex-wrap: wrap;
          margin-top: 1.8rem;
        }

        .belt {
          width: 90px;
          height: 28px;
          border-radius: 6px;
          background: #e2e8f0;
          position: relative;
        }

        .belt::after {
          content: '';
          position: absolute;
          inset: 0 40% 0 40%;
          background: rgba(0, 0, 0, 0.2);
        }

        .belt.blue { background: #2563eb; }
        .belt.purple { background: #7c3aed; }
        .belt.brown { background: #92400e; }
        .belt.black { background: #111827; }

        .technique-cards-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .technique-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px;
          background: white;
          border: 1px solid var(--stroke);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(20px);
        }

        .technique-card:hover {
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          transform: translateY(-4px) scale(1.02);
          border-color: var(--accent);
        }

        .technique-card:active {
          transform: translateY(-2px) scale(0.98);
        }

        .technique-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(43, 111, 246, 0.15), rgba(43, 111, 246, 0.08));
          display: grid;
          place-items: center;
          font-size: 24px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .technique-card:hover .technique-icon {
          transform: rotate(5deg) scale(1.1);
        }

        .technique-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .technique-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          line-height: 1.3;
        }

        .technique-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: var(--bg-soft);
          border-radius: 999px;
          width: fit-content;
        }

        .technique-badge span {
          font-size: 11px;
          font-weight: 600;
          color: var(--text);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }

        .technique-arrow {
          font-size: 20px;
          color: var(--muted);
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .technique-card:hover .technique-arrow {
          opacity: 1;
          transform: translateX(4px);
          color: var(--accent);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .technique-card-1 {
          animation: fadeInUp 0.6s ease forwards 0.1s;
        }

        .technique-card-2 {
          animation: fadeInUp 0.6s ease forwards 0.2s;
        }

        .technique-card-3 {
          animation: fadeInUp 0.6s ease forwards 0.3s;
        }

        .cta-section {
          text-align: center;
          background: linear-gradient(140deg, rgba(43, 111, 246, 0.06), rgba(14, 165, 233, 0.04));
          border-top: 1px solid var(--stroke);
          border-bottom: 1px solid var(--stroke);
        }

        .ios-cta {
          margin-top: 1.2rem;
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ios-badge {
          border: 1px solid var(--stroke);
          color: var(--muted);
          padding: 0.6rem 1.4rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          background: white;
        }

        .ios-note {
          color: var(--muted);
          font-size: 0.85rem;
          margin-top: 0.6rem;
        }

        .footer {
          padding: 3rem 1.5rem 4rem;
          color: var(--muted);
          font-size: 0.9rem;
          text-align: center;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-on-scroll {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
        }

        .hero > div:first-child {
          animation: slideInLeft 0.8s ease forwards;
        }

        .hero-card {
          animation: slideInRight 0.8s ease forwards 0.2s;
          opacity: 0;
        }

        .section-title, .section-desc {
          animation: fadeIn 0.8s ease forwards;
        }

        @media (max-width: 720px) {
          .nav-links {
            display: none;
          }

          .technique-cards-container {
            margin-top: 2rem;
          }
        }
      `}</style>

      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        strategy="afterInteractive"
        data-ad-client="ca-pub-3394335051689473"
      />

      <header className="nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <span className="logo-badge">
              <Image src="/bjj-logo.png" alt="Your BJJ" width={28} height={28} />
            </span>
            <span className="logo-text">
              <strong>Your BJJ</strong>
              <span>Training Companion</span>
            </span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features">特徴</a></li>
            <li><a href="#diary">日記</a></li>
            <li><a href="#techniques">技</a></li>
            <li><a href="#theme">ベルトテーマ</a></li>
          </ul>
          <Link href="/home" className="cta">今すぐ使う</Link>
        </div>
      </header>

      <section className="hero">
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', letterSpacing: '0.2em' }}>IOS FIRST</p>
          <h1 className="hero-title">
            毎日の練習を<br />
            <span>記録と技で強くする。</span>
          </h1>
          <p className="hero-text">
            Your BJJは、柔術家のための練習日記と技ライブラリに特化したトレーニングアプリ。
            練習の「量」と「質」を見える化し、次の一手を明確にします。
          </p>
          <div className="hero-actions">
            <Link href="/home" className="cta">アプリを開く</Link>
            <a href="#features" className="ghost">機能を知る</a>
          </div>
        </div>
        <div className="hero-card">
          <h3>Today&apos;s Dashboard</h3>
          <div className="hero-card-grid">
            <div className="hero-pill">
              <strong>練習日記</strong>
              <span>1日の練習を即記録。気づきと課題が残る。</span>
            </div>
            <div className="hero-pill">
              <strong>技ライブラリ</strong>
              <span>技を保存して整理。復習が速くなる。</span>
            </div>
            <div className="hero-pill">
              <strong>成長を可視化</strong>
              <span>継続と伸びが数字でわかる。</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <h2 className="section-title">柔術の基礎を、最短で積み上げる。</h2>
        <p className="section-desc">
          機能は削ぎ落とし、必要なものに集中。日記と技の2本柱で、練習の質を上げます。
        </p>
        <div className="grid-3">
          <div className="feature-card">
            <h4>練習日記の習慣化</h4>
            <p>練習時間・感覚・反省点をサクッと記録。振り返りが速くなります。</p>
          </div>
          <div className="feature-card">
            <h4>技を忘れない</h4>
            <p>技をカテゴリ別に整理。復習のときに迷わない設計。</p>
          </div>
          <div className="feature-card">
            <h4>シンプルな導線</h4>
            <p>画面遷移を最小限にして、練習後1分で記録完了。</p>
          </div>
        </div>
      </section>

      <div className="ad-block">
        <div className="ad-shell">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3394335051689473"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>

      <section id="diary" className="section">
        <div className="split">
          <div>
            <h2 className="section-title">日記は「質のフィードバック」。</h2>
            <p className="section-desc">
              何をやったか、どこで詰まったか。毎回の記録が次の練習を強くします。
            </p>
            <div className="grid-3">
              <div className="feature-card">
                <h4>カレンダーで俯瞰</h4>
                <p>練習頻度が一目で分かる。続けるための最短導線。</p>
              </div>
              <div className="feature-card">
                <h4>ノート感覚</h4>
                <p>短文でもOK。アウトプットが習慣化する。</p>
              </div>
            </div>
          </div>
          <div className="mock">
            <h5>Weekly Summary</h5>
            <div className="stat-row">
              <div className="stat">
                <strong>3</strong>
                <span>練習回数</span>
              </div>
              <div className="stat">
                <strong>5</strong>
                <span>復習した技</span>
              </div>
              <div className="stat">
                <strong>90</strong>
                <span>集中スコア</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ad-block">
        <div className="ad-shell">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3394335051689473"
            data-ad-slot="2345678901"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </div>

      <section id="techniques" className="section">
        <div className="split">
          <div>
            <h2 className="section-title">技は「資産」。</h2>
            <p className="section-desc">
              習った技をためて、整理して、使える形に。自分の技セットが育つ感覚が続きます。
            </p>
            <div className="grid-3" style={{ marginTop: '1.5rem' }}>
              <div className="feature-card">
                <h4>カテゴリで分類</h4>
                <p>体勢・技種別でサクッと整理。</p>
              </div>
              <div className="feature-card">
                <h4>復習の導線</h4>
                <p>迷わず見返せる構造。</p>
              </div>
            </div>
          </div>
          <div className="technique-cards-container">
            <div className="technique-card technique-card-1">
              <div className="technique-icon">🛡️</div>
              <div className="technique-content">
                <div className="technique-name">クローズドガード</div>
                <div className="technique-badge">
                  <span className="badge-dot"></span>
                  <span>ガード</span>
                </div>
              </div>
              <div className="technique-arrow">›</div>
            </div>
            <div className="technique-card technique-card-2">
              <div className="technique-icon">🔄</div>
              <div className="technique-content">
                <div className="technique-name">シザースイープ</div>
                <div className="technique-badge">
                  <span className="badge-dot"></span>
                  <span>スイープ</span>
                </div>
              </div>
              <div className="technique-arrow">›</div>
            </div>
            <div className="technique-card technique-card-3">
              <div className="technique-icon">⚔️</div>
              <div className="technique-content">
                <div className="technique-name">アームバー</div>
                <div className="technique-badge">
                  <span className="badge-dot"></span>
                  <span>サブミッション</span>
                </div>
              </div>
              <div className="technique-arrow">›</div>
            </div>
          </div>
        </div>
      </section>

      <section id="theme" className="section">
        <h2 className="section-title">ベルトカラーに合わせたテーマ。</h2>
        <p className="section-desc">
          iOSアプリの世界観に合わせた配色。自分の帯に合わせたモチベーションを維持できます。
        </p>
        <div className="belt-row">
          <div className="belt" title="white" />
          <div className="belt blue" title="blue" />
          <div className="belt purple" title="purple" />
          <div className="belt brown" title="brown" />
          <div className="belt black" title="black" />
        </div>
      </section>

      <section className="section cta-section">
        <h2 className="section-title">記録は、最速の強化。</h2>
        <p className="section-desc" style={{ margin: '0 auto' }}>
          今日の練習から始めよう。Your BJJで「続く仕組み」を。
        </p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link href="/home" className="cta">今すぐ使う</Link>
          <a href="#features" className="ghost">特徴を見る</a>
        </div>
        <div className="ios-cta">
          <div className="ios-badge">iOSアプリ：近日公開</div>
        </div>
        <div className="ios-note">リリース次第、App Store導線を追加します。</div>
      </section>

      <footer className="footer">
        <p>© 2026 Your BJJ. All rights reserved.</p>
      </footer>
    </div>
  );
}
