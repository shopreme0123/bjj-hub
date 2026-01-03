'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <style jsx global>{`
        .landing-page {
          --bg-primary: #f8fafc;
          --bg-secondary: #ffffff;
          --bg-card: #ffffff;
          --bg-dark: #0f172a;
          --text-primary: #0f172a;
          --text-secondary: #64748b;
          --text-light: #ffffff;
          --accent-blue: #3b82f6;
          --accent-purple: #8b5cf6;
          --accent-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
          --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.08);
          --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.12);
          --shadow-xl: 0 30px 80px rgba(0, 0, 0, 0.15);
        }

        .landing-page * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-page {
          font-family: 'Noto Sans JP', sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.7;
          overflow-x: hidden;
        }

        .lp-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .lp-nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .lp-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .lp-logo-icon {
          width: 40px;
          height: 40px;
          background: var(--accent-gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .lp-logo-icon svg {
          width: 22px;
          height: 22px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }

        .lp-logo-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 2px;
          color: var(--text-primary);
        }

        .lp-nav-links {
          display: flex;
          gap: 2rem;
          list-style: none;
        }

        .lp-nav-links a {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .lp-nav-links a:hover {
          color: var(--accent-blue);
        }

        .lp-cta-btn {
          background: var(--accent-gradient);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .lp-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .lp-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #ffffff 0%, #f0f7ff 50%, #e8f4ff 100%);
          position: relative;
          padding: 7rem 2rem 4rem;
          overflow: hidden;
        }

        .lp-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 80%;
          height: 150%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        .lp-hero::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -20%;
          width: 60%;
          height: 100%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .lp-hero-content {
          max-width: 1200px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        .lp-hero-text h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          letter-spacing: 2px;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .lp-hero-text h1 span {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lp-hero-text .lp-tagline {
          font-size: 1.15rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          max-width: 480px;
          line-height: 1.9;
        }

        .lp-hero-cta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .lp-hero-cta .lp-primary {
          background: var(--accent-gradient);
          color: white;
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.35);
        }

        .lp-hero-cta .lp-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.45);
        }

        .lp-hero-cta .lp-secondary {
          background: white;
          color: var(--text-primary);
          padding: 1rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .lp-hero-cta .lp-secondary:hover {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.05);
        }

        .lp-hero-visual {
          position: relative;
        }

        .lp-phone-mockup {
          width: 100%;
          max-width: 260px;
          margin: 0 auto;
          position: relative;
          animation: lp-float 6s ease-in-out infinite;
        }

        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .lp-phone-frame {
          background: linear-gradient(145deg, #1a1a1a, #2d2d2d);
          border-radius: 36px;
          padding: 8px;
          box-shadow: var(--shadow-xl);
        }

        .lp-phone-screen {
          background: #eef2f7;
          border-radius: 30px;
          overflow: hidden;
          position: relative;
          aspect-ratio: 390/844;
        }

        .lp-phone-notch {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 70px;
          height: 20px;
          background: #1a1a1a;
          border-radius: 0 0 12px 12px;
          z-index: 10;
        }

        .lp-app-ui {
          height: 100%;
          display: flex;
          flex-direction: column;
          font-family: 'Noto Sans JP', sans-serif;
          background: #eef2f7;
          font-size: 10px;
        }

        .lp-app-header {
          background: linear-gradient(180deg, #3b6ea5 0%, #4a7db5 100%);
          padding: 28px 12px 12px;
          color: white;
          position: relative;
          flex-shrink: 0;
        }

        .lp-app-header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .lp-app-header-left {
          flex: 1;
        }

        .lp-app-header-icons {
          display: flex;
          gap: 6px;
        }

        .lp-app-header-icon {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-app-header-icon svg {
          width: 14px;
          height: 14px;
          fill: white;
        }

        .lp-app-greeting {
          font-size: 1em;
          opacity: 0.85;
          font-weight: 400;
          line-height: 1.2;
        }

        .lp-app-username {
          font-size: 1.8em;
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .lp-app-belt {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.18);
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 500;
        }

        .lp-belt-visual {
          width: 36px;
          height: 10px;
          background: linear-gradient(180deg, #2563eb, #1d4ed8);
          border-radius: 2px;
          position: relative;
        }

        .lp-belt-visual::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 100%;
          background: rgba(0,0,0,0.15);
        }

        .lp-app-body {
          flex: 1;
          padding: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lp-stats-card {
          background: white;
          border-radius: 14px;
          padding: 12px 8px;
          display: flex;
          justify-content: space-around;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .lp-stat-item {
          text-align: center;
          flex: 1;
        }

        .lp-stat-number {
          font-size: 2em;
          font-weight: 700;
          color: #4a7db5;
          line-height: 1.2;
        }

        .lp-stat-label {
          font-size: 0.85em;
          color: #8899aa;
          font-weight: 500;
        }

        .lp-section-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2px;
        }

        .lp-section-title {
          font-size: 1.2em;
          font-weight: 700;
          color: #1e293b;
        }

        .lp-section-action {
          font-size: 0.95em;
          color: #8899aa;
          font-weight: 500;
        }

        .lp-week-card {
          background: white;
          border-radius: 14px;
          padding: 10px 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .lp-week-row {
          display: flex;
          justify-content: space-between;
        }

        .lp-day-item {
          text-align: center;
          flex: 1;
        }

        .lp-day-label {
          font-size: 0.9em;
          color: #a0aec0;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .lp-day-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #e8eef4;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-day-circle.active {
          background: #6b8090;
        }

        .lp-day-circle.active svg {
          width: 12px;
          height: 12px;
          stroke: white;
          stroke-width: 3;
          fill: none;
        }

        .lp-training-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          overflow: hidden;
        }

        .lp-training-item {
          background: white;
          border-radius: 12px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }

        .lp-training-date {
          width: 32px;
          height: 32px;
          background: #f0f4f8;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2em;
          font-weight: 700;
          color: #5a6a7a;
          flex-shrink: 0;
        }

        .lp-training-info {
          flex: 1;
          min-width: 0;
        }

        .lp-training-title {
          font-size: 1.1em;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.3;
        }

        .lp-training-time {
          font-size: 0.95em;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .lp-training-time svg {
          width: 10px;
          height: 10px;
          stroke: #94a3b8;
          stroke-width: 2;
          fill: none;
        }

        .lp-training-arrow {
          color: #cbd5e1;
          font-size: 1.4em;
          font-weight: 300;
        }

        .lp-app-nav {
          background: white;
          padding: 10px 6px 14px;
          display: flex;
          justify-content: space-around;
          border-top: 1px solid #e8eef4;
          flex-shrink: 0;
        }

        .lp-nav-item {
          text-align: center;
          color: #a0aec0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .lp-nav-item.active {
          color: #3b82f6;
        }

        .lp-nav-icon {
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-nav-icon svg {
          width: 18px;
          height: 18px;
          stroke: currentColor;
          stroke-width: 2;
          fill: none;
        }

        .lp-nav-label {
          font-size: 0.85em;
          font-weight: 500;
        }

        .lp-features {
          padding: 8rem 2rem;
          background: var(--bg-secondary);
          position: relative;
        }

        .lp-section-header-main {
          text-align: center;
          max-width: 600px;
          margin: 0 auto 4rem;
        }

        .lp-section-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 4px;
          color: var(--accent-blue);
          margin-bottom: 0.75rem;
        }

        .lp-section-title-main {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 900;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .lp-section-desc {
          color: var(--text-secondary);
          font-size: 1.05rem;
        }

        .lp-features-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .lp-feature-card {
          background: var(--bg-card);
          border-radius: 20px;
          padding: 2rem;
          border: 1px solid #e2e8f0;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .lp-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-gradient);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .lp-feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(59, 130, 246, 0.2);
          box-shadow: var(--shadow-lg);
        }

        .lp-feature-card:hover::before {
          opacity: 1;
        }

        .lp-feature-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }

        .lp-feature-icon svg {
          width: 28px;
          height: 28px;
          stroke: var(--accent-blue);
          stroke-width: 2;
          fill: none;
        }

        .lp-feature-card h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .lp-feature-card p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.8;
        }

        .lp-belt-section {
          padding: 7rem 2rem;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          text-align: center;
        }

        .lp-belt-display {
          max-width: 700px;
          margin: 0 auto;
        }

        .lp-belts-row {
          display: flex;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 2.5rem;
          flex-wrap: wrap;
        }

        .lp-belt-item {
          width: 90px;
          height: 28px;
          border-radius: 5px;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: var(--shadow-md);
        }

        .lp-belt-item:hover {
          transform: scale(1.1) translateY(-3px);
          box-shadow: var(--shadow-lg);
        }

        .lp-belt-item::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 100%;
          background: rgba(0, 0, 0, 0.12);
          border-radius: 2px;
        }

        .lp-belt-white {
          background: linear-gradient(180deg, #ffffff, #f1f5f9);
          border: 1px solid #e2e8f0;
        }

        .lp-belt-blue {
          background: linear-gradient(180deg, #3b82f6, #1d4ed8);
        }

        .lp-belt-purple {
          background: linear-gradient(180deg, #8b5cf6, #7c3aed);
        }

        .lp-belt-brown {
          background: linear-gradient(180deg, #d97706, #b45309);
        }

        .lp-belt-black {
          background: linear-gradient(180deg, #374151, #111827);
        }

        .lp-belt-caption {
          margin-top: 2rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .lp-use-cases {
          padding: 8rem 2rem;
          background: var(--bg-secondary);
        }

        .lp-use-cases-grid {
          max-width: 900px;
          margin: 0 auto;
          display: grid;
          gap: 1.5rem;
        }

        .lp-use-case {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 1.5rem;
          align-items: start;
          padding: 1.75rem;
          background: var(--bg-card);
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .lp-use-case:hover {
          box-shadow: var(--shadow-md);
          border-color: rgba(59, 130, 246, 0.15);
        }

        .lp-use-case-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lp-use-case-icon svg {
          width: 32px;
          height: 32px;
          stroke: var(--accent-blue);
          stroke-width: 1.5;
          fill: none;
        }

        .lp-use-case h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .lp-use-case p {
          color: var(--text-secondary);
          line-height: 1.8;
          font-size: 0.95rem;
        }

        .lp-use-case .lp-highlight {
          color: var(--accent-blue);
          font-weight: 600;
        }

        .lp-cta-section {
          padding: 7rem 2rem;
          background: var(--bg-dark);
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .lp-cta-section::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }

        .lp-cta-content {
          position: relative;
          z-index: 1;
          max-width: 650px;
          margin: 0 auto;
        }

        .lp-cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          letter-spacing: 2px;
          margin-bottom: 1.25rem;
          color: var(--text-light);
        }

        .lp-cta-desc {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2rem;
          line-height: 1.8;
        }

        .lp-cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .lp-cta-main {
          background: var(--accent-gradient);
          color: white;
          padding: 1.15rem 2.5rem;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
        }

        .lp-cta-main:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 45px rgba(59, 130, 246, 0.5);
        }

        .lp-cta-main svg {
          width: 20px;
          height: 20px;
          stroke: white;
          stroke-width: 2;
          fill: none;
        }

        .lp-footer {
          padding: 4rem 2rem 2rem;
          background: var(--bg-dark);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .lp-footer-content {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 3rem;
        }

        .lp-footer-brand .lp-logo {
          margin-bottom: 1rem;
        }

        .lp-footer-brand .lp-logo-text {
          color: white;
        }

        .lp-footer-brand p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          max-width: 280px;
        }

        .lp-footer-links h4 {
          font-size: 0.8rem;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 1.25rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .lp-footer-links ul {
          list-style: none;
        }

        .lp-footer-links li {
          margin-bottom: 0.6rem;
        }

        .lp-footer-links a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .lp-footer-links a:hover {
          color: white;
        }

        .lp-footer-bottom {
          max-width: 1100px;
          margin: 2.5rem auto 0;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .lp-footer-bottom p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
        }

        .lp-social-links {
          display: flex;
          gap: 0.75rem;
        }

        .lp-social-links a {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .lp-social-links a:hover {
          background: var(--accent-blue);
          color: white;
        }

        .lp-social-links svg {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        @media (max-width: 900px) {
          .lp-hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .lp-hero-text h1 {
            white-space: normal;
          }
          .lp-hero-text .lp-tagline {
            margin: 0 auto 2rem;
          }
          .lp-hero-cta {
            justify-content: center;
          }
          .lp-hero-visual {
            order: -1;
          }
          .lp-phone-mockup {
            max-width: 200px;
          }
          .lp-nav-links {
            display: none;
          }
          .lp-use-case {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .lp-use-case-icon {
            margin: 0 auto;
          }
          .lp-footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .lp-footer-brand p {
            margin: 0 auto;
          }
        }

        @media (max-width: 600px) {
          .lp-header {
            padding: 0.9rem 1rem;
          }
          .lp-hero {
            padding: 5.5rem 1.25rem 3rem;
          }
          .lp-features,
          .lp-belt-section,
          .lp-use-cases,
          .lp-cta-section {
            padding: 5rem 1.25rem;
          }
          .lp-section-header-main {
            margin-bottom: 2.5rem;
          }
          .lp-feature-card {
            padding: 1.5rem;
          }
          .lp-belts-row {
            gap: 0.6rem;
          }
          .lp-belt-item {
            width: 55px;
            height: 20px;
          }
          .lp-use-case {
            padding: 1.25rem;
          }
        }
      `}</style>

      {/* Header */}
      <header className="lp-header">
        <nav className="lp-nav">
          <a href="#" className="lp-logo">
            <div className="lp-logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <span className="lp-logo-text">BJJ HUB</span>
          </a>
          <ul className="lp-nav-links">
            <li><a href="#features">機能</a></li>
            <li><a href="#belts">帯テーマ</a></li>
            <li><a href="#users">こんな方に</a></li>
          </ul>
          <Link href="/home" className="lp-cta-btn">今すぐ始める</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-content">
          <div className="lp-hero-text">
            <h1>柔術の全てを、<span>ポケットに。</span></h1>
            <p className="lp-tagline">習った技を整理し、練習を記録し、仲間と共有する。白帯から黒帯まで、すべての柔術家のための相棒アプリ。</p>
            <div className="lp-hero-cta">
              <Link href="/home" className="lp-primary">無料で始める<span>→</span></Link>
              <a href="#features" className="lp-secondary">機能を見る</a>
            </div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-phone-mockup">
              <div className="lp-phone-frame">
                <div className="lp-phone-screen">
                  <div className="lp-phone-notch"></div>
                  <div className="lp-app-ui">
                    <div className="lp-app-header">
                      <div className="lp-app-header-top">
                        <div className="lp-app-header-left">
                          <div className="lp-app-greeting">おかえりなさい</div>
                          <div className="lp-app-username">Kenji</div>
                        </div>
                        <div className="lp-app-header-icons">
                          <div className="lp-app-header-icon">
                            <svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                          </div>
                          <div className="lp-app-header-icon">
                            <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
                          </div>
                        </div>
                      </div>
                      <div className="lp-app-belt">
                        <div className="lp-belt-visual"></div>
                        <span>青帯</span>
                      </div>
                    </div>
                    <div className="lp-app-body">
                      <div className="lp-stats-card">
                        <div className="lp-stat-item">
                          <div className="lp-stat-number">128</div>
                          <div className="lp-stat-label">登録技</div>
                        </div>
                        <div className="lp-stat-item">
                          <div className="lp-stat-number">47</div>
                          <div className="lp-stat-label">フロー</div>
                        </div>
                        <div className="lp-stat-item">
                          <div className="lp-stat-number">256</div>
                          <div className="lp-stat-label">練習日数</div>
                        </div>
                      </div>
                      <div className="lp-section-row">
                        <span className="lp-section-title">今週の練習</span>
                        <span className="lp-section-action">3回</span>
                      </div>
                      <div className="lp-week-card">
                        <div className="lp-week-row">
                          {['月', '火', '水', '木', '金', '土', '日'].map((day, i) => (
                            <div key={day} className="lp-day-item">
                              <div className="lp-day-label">{day}</div>
                              <div className={`lp-day-circle ${[2,3,4].includes(i) ? 'active' : ''}`}>
                                {[2,3,4].includes(i) && (
                                  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="lp-section-row">
                        <span className="lp-section-title">最近の練習</span>
                        <span className="lp-section-action">すべて見る →</span>
                      </div>
                      <div className="lp-training-list">
                        {['02', '01', '31'].map((date) => (
                          <div key={date} className="lp-training-item">
                            <div className="lp-training-date">{date}</div>
                            <div className="lp-training-info">
                              <div className="lp-training-title">Training</div>
                              <div className="lp-training-time">
                                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                90min
                              </div>
                            </div>
                            <span className="lp-training-arrow">›</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="lp-app-nav">
                      {[
                        { icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></>, label: 'ホーム', active: true },
                        { icon: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></>, label: '技' },
                        { icon: <><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></>, label: 'フロー' },
                        { icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>, label: '日記' },
                        { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>, label: 'グループ' },
                      ].map((item) => (
                        <div key={item.label} className={`lp-nav-item ${item.active ? 'active' : ''}`}>
                          <div className="lp-nav-icon">
                            <svg viewBox="0 0 24 24">{item.icon}</svg>
                          </div>
                          <div className="lp-nav-label">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="lp-features" id="features">
        <div className="lp-section-header-main">
          <div className="lp-section-label">FEATURES</div>
          <h2 className="lp-section-title-main">習った技、もう忘れない。</h2>
          <p className="lp-section-desc">マットの外でも強くなれる。柔術に必要な機能を、すべて一つに。</p>
        </div>
        <div className="lp-features-grid">
          {[
            { icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></>, title: '技ライブラリ', desc: 'YouTube動画と一緒に技を保存。カテゴリ別に整理して、いつでも復習できます。習得度を記録して成長を可視化。' },
            { icon: <><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></>, title: 'フロービルダー', desc: '技の連携をビジュアルで作成。ドラッグ&ドロップで分岐フローを構築。ゲームプランを見える化します。' },
            { icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></>, title: '練習日記', desc: 'カレンダー形式で練習を記録。練習時間・コンディション・スパー本数を管理し、統計で成長を確認。' },
            { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>, title: 'グループ機能', desc: '道場仲間とフローを共有。招待コードで簡単参加。チーム全体で技術を蓄積できます。' },
          ].map((feature) => (
            <div key={feature.title} className="lp-feature-card">
              <div className="lp-feature-icon">
                <svg viewBox="0 0 24 24">{feature.icon}</svg>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Belt Theme */}
      <section className="lp-belt-section" id="belts">
        <div className="lp-belt-display">
          <div className="lp-section-label">BELT THEME</div>
          <h2 className="lp-section-title-main">あなたの帯に合わせて</h2>
          <p className="lp-section-desc">白帯から黒帯まで、あなたの帯色に合わせたカラーテーマでモチベーションアップ。</p>
          <div className="lp-belts-row">
            <div className="lp-belt-item lp-belt-white"></div>
            <div className="lp-belt-item lp-belt-blue"></div>
            <div className="lp-belt-item lp-belt-purple"></div>
            <div className="lp-belt-item lp-belt-brown"></div>
            <div className="lp-belt-item lp-belt-black"></div>
          </div>
          <p className="lp-belt-caption">設定画面から帯色を選択すると、アプリ全体のテーマカラーが変わります</p>
        </div>
      </section>

      {/* Use Cases */}
      <section className="lp-use-cases" id="users">
        <div className="lp-section-header-main">
          <div className="lp-section-label">FOR YOU</div>
          <h2 className="lp-section-title-main">こんな方におすすめ</h2>
        </div>
        <div className="lp-use-cases-grid">
          {[
            { icon: <><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></>, title: '柔術初心者の方', highlight: '「技が覚えられない…」', desc: 'そんな悩みを解決。習った技をYouTube動画と一緒に保存し、カテゴリ別に整理。練習後にサッと記録、次の練習前にサッと復習。' },
            { icon: <><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></>, title: '試合に出場される方', highlight: 'ゲームプランを頭の中だけで管理していませんか？', desc: 'フロービルダーで技の連携をビジュアル化。試合前に見返して、迷わない自分になろう。' },
            { icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></>, title: '大人から始めた方', highlight: '限られた練習時間を最大化したい。', desc: '練習日記で頻度を可視化し、前回の復習ポイントを確認。「量」より「質」で勝負する大人の柔術をサポート。' },
            { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></>, title: '道場・指導者の方', highlight: '「生徒に教えても、次の週には忘れてる…」', desc: 'グループ機能で道場専用グループを作成。技のフローを共有し、チーム全体のレベルアップに。' },
          ].map((useCase) => (
            <div key={useCase.title} className="lp-use-case">
              <div className="lp-use-case-icon">
                <svg viewBox="0 0 24 24">{useCase.icon}</svg>
              </div>
              <div>
                <h3>{useCase.title}</h3>
                <p><span className="lp-highlight">{useCase.highlight}</span>{useCase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta-section">
        <div className="lp-cta-content">
          <h2 className="lp-cta-title">マットの外でも、強くなろう。</h2>
          <p className="lp-cta-desc">BJJ Hubで、あなたの柔術を次のレベルへ。無料で今すぐ始められます。</p>
          <div className="lp-cta-buttons">
            <Link href="/home" className="lp-cta-main">
              <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
              無料で始める
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <a href="#" className="lp-logo">
              <div className="lp-logo-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span className="lp-logo-text">BJJ HUB</span>
            </a>
            <p>柔術の技を整理・練習記録・仲間と共有。白帯から黒帯まで使える柔術管理アプリ。</p>
          </div>
          <div className="lp-footer-links">
            <h4>リンク</h4>
            <ul>
              <li><a href="#features">機能</a></li>
              <li><a href="#belts">帯テーマ</a></li>
              <li><a href="#users">こんな方に</a></li>
            </ul>
          </div>
          <div className="lp-footer-links">
            <h4>サポート</h4>
            <ul>
              <li><a href="#">お問い合わせ</a></li>
              <li><a href="#">プライバシーポリシー</a></li>
              <li><a href="#">利用規約</a></li>
            </ul>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <p>© 2026 BJJ Hub. All rights reserved.</p>
          <div className="lp-social-links">
            <a href="#" title="X">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" title="YouTube">
              <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
