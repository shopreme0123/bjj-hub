'use client';

import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type BeltColor = 'white' | 'blue' | 'purple' | 'brown' | 'black';

interface BeltTheme {
  primary: string;
  primaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  bg: string;
  bgGradient: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  glow: string;
}

const beltThemes: Record<BeltColor, BeltTheme> = {
  white: {
    primary: '#475569',
    primaryLight: '#64748b',
    gradientStart: '#64748b',
    gradientEnd: '#94a3b8',
    bg: '#ffffff',
    bgGradient: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    glow: 'rgba(71, 85, 105, 0.2)',
  },
  blue: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    gradientStart: '#3b82f6',
    gradientEnd: '#60a5fa',
    bg: '#f8fafc',
    bgGradient: '#eff6ff',
    card: '#ffffff',
    cardBorder: '#dbeafe',
    text: '#0f172a',
    textMuted: '#64748b',
    glow: 'rgba(43, 111, 246, 0.2)',
  },
  purple: {
    primary: '#7c3aed',
    primaryLight: '#8b5cf6',
    gradientStart: '#8b5cf6',
    gradientEnd: '#a78bfa',
    bg: '#fefefe',
    bgGradient: '#faf5ff',
    card: '#ffffff',
    cardBorder: '#e9d5ff',
    text: '#0f172a',
    textMuted: '#64748b',
    glow: 'rgba(124, 58, 237, 0.2)',
  },
  brown: {
    primary: '#92400e',
    primaryLight: '#b45309',
    gradientStart: '#b45309',
    gradientEnd: '#d97706',
    bg: '#fefefe',
    bgGradient: '#fffbeb',
    card: '#ffffff',
    cardBorder: '#fde68a',
    text: '#0f172a',
    textMuted: '#64748b',
    glow: 'rgba(146, 64, 14, 0.2)',
  },
  black: {
    primary: '#09090b',
    primaryLight: '#18181b',
    gradientStart: '#18181b',
    gradientEnd: '#3f3f46',
    bg: '#fafafa',
    bgGradient: '#f4f4f5',
    card: '#ffffff',
    cardBorder: '#e4e4e7',
    text: '#09090b',
    textMuted: '#71717a',
    glow: 'rgba(9, 9, 11, 0.2)',
  },
};

export default function RootPage() {
  const [currentBelt, setCurrentBelt] = useState<BeltColor>('blue');
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  useEffect(() => {
    const theme = beltThemes[currentBelt];
    const root = document.documentElement;

    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--bg-soft', theme.bgGradient);
    root.style.setProperty('--bg-card', theme.card);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--muted', theme.textMuted);
    root.style.setProperty('--accent', theme.primary);
    root.style.setProperty('--accent-2', theme.primaryLight);
    root.style.setProperty('--accent-3', theme.bgGradient);
    root.style.setProperty('--stroke', theme.cardBorder);
    root.style.setProperty('--glow', theme.glow);
  }, [currentBelt]);

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
          background: var(--bg);
          transition: background 0.5s ease;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(18px);
          background: var(--bg-soft);
          border-bottom: 1px solid var(--stroke);
          transition: all 0.5s ease;
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
          background: var(--bg-card);
          transition: all 0.5s ease;
        }

        .ghost:hover {
          background: var(--bg-soft);
          border-color: var(--accent);
        }

        .hero-card {
          background: var(--bg-soft);
          border: 1px solid var(--stroke);
          border-radius: 28px;
          padding: 2rem;
          box-shadow: var(--shadow);
          position: relative;
          overflow: hidden;
          transition: all 0.5s ease;
        }

        .hero-card::after {
          content: '';
          position: absolute;
          inset: -30% 40% auto -20%;
          height: 200px;
          background: radial-gradient(circle, var(--glow), transparent 70%);
          opacity: 0.6;
          transition: all 0.5s ease;
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
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: all 0.5s ease;
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
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          border-radius: 20px;
          padding: 1.8rem;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
          background: var(--bg-soft);
          border: 1px solid var(--stroke);
          box-shadow: var(--shadow);
          transition: all 0.5s ease;
        }

        .mock h5 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .diary-mock {
          border-radius: 28px;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          box-shadow: var(--shadow);
          transition: all 0.5s ease;
        }

        .diary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
        }

        .diary-header h5 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
        }

        .add-button {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: var(--accent-3);
          display: grid;
          place-items: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--accent);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-button:hover {
          transform: scale(1.1);
          background: var(--accent);
          color: white;
        }

        .calendar-mini {
          background: var(--bg-soft);
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
          margin-bottom: 6px;
        }

        .calendar-row:last-child {
          margin-bottom: 0;
        }

        .calendar-day {
          text-align: center;
          font-size: 10px;
          font-weight: 600;
          color: var(--muted);
          padding: 4px 0;
        }

        .calendar-date {
          aspect-ratio: 1;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calendar-date:hover {
          background: var(--accent-3);
        }

        .calendar-date.active {
          background: var(--accent);
          color: white;
          box-shadow: 0 2px 8px var(--glow);
        }

        .diary-entries {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .diary-entry {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-soft);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .diary-entry:hover {
          background: var(--bg-card);
          border-color: var(--accent);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }

        .entry-date {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 48px;
        }

        .entry-day {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .entry-month {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          margin-top: 2px;
        }

        .entry-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .entry-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
        }

        .entry-meta {
          font-size: 12px;
          color: var(--muted);
        }

        .entry-arrow {
          font-size: 20px;
          color: var(--muted);
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .diary-entry:hover .entry-arrow {
          opacity: 1;
          transform: translateX(4px);
          color: var(--accent);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          border-radius: 24px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--stroke);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .modal-header h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text);
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--bg-soft);
          border: 1px solid var(--stroke);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 20px;
          color: var(--muted);
        }

        .modal-close:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-section {
          margin-bottom: 1.5rem;
        }

        .modal-section:last-child {
          margin-bottom: 0;
        }

        .modal-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .modal-info {
          font-size: 1rem;
          color: var(--text);
          line-height: 1.6;
        }

        .modal-video {
          aspect-ratio: 16 / 9;
          background: var(--bg-soft);
          border: 1px solid var(--stroke);
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: var(--muted);
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .modal-video-icon {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }

        .modal-tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .modal-tag {
          padding: 0.4rem 0.8rem;
          background: var(--accent-3);
          color: var(--accent);
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stat-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat {
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          border-radius: 16px;
          padding: 1rem 1.2rem;
          min-width: 120px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: all 0.5s ease;
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
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }

        .belt:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
        }

        .belt:active {
          transform: translateY(-2px) scale(1.02);
        }

        .belt.active {
          box-shadow: 0 0 0 3px var(--bg), 0 0 0 6px var(--accent);
          transform: scale(1.1);
        }

        .belt::after {
          content: '';
          position: absolute;
          inset: 0 40% 0 40%;
          background: rgba(0, 0, 0, 0.2);
          pointer-events: none;
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
          background: var(--bg-card);
          border: 1px solid var(--stroke);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
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
          background: var(--accent-3);
          display: grid;
          place-items: center;
          font-size: 24px;
          flex-shrink: 0;
          transition: all 0.5s ease;
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
          background: var(--bg-soft);
          border-top: 1px solid var(--stroke);
          border-bottom: 1px solid var(--stroke);
          transition: all 0.5s ease;
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
          background: var(--bg-card);
          transition: all 0.5s ease;
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
              何をやったか、どこで詰まったか。毎回の記録が次の練習を強くします。動画も登録可能で、後から見返して復習できます。
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
          <div className="diary-mock">
            <div className="diary-header">
              <h5>日記</h5>
              <div className="add-button">+</div>
            </div>
            <div className="calendar-mini">
              <div className="calendar-row">
                <div className="calendar-day">月</div>
                <div className="calendar-day">火</div>
                <div className="calendar-day">水</div>
                <div className="calendar-day">木</div>
                <div className="calendar-day">金</div>
                <div className="calendar-day">土</div>
                <div className="calendar-day">日</div>
              </div>
              <div className="calendar-row">
                <div className="calendar-date"></div>
                <div className="calendar-date"></div>
                <div className="calendar-date active">1</div>
                <div className="calendar-date">2</div>
                <div className="calendar-date">3</div>
                <div className="calendar-date active">4</div>
                <div className="calendar-date">5</div>
              </div>
              <div className="calendar-row">
                <div className="calendar-date">6</div>
                <div className="calendar-date active">7</div>
                <div className="calendar-date">8</div>
                <div className="calendar-date">9</div>
                <div className="calendar-date">10</div>
                <div className="calendar-date">11</div>
                <div className="calendar-date">12</div>
              </div>
            </div>
            <div className="diary-entries">
              <div className="diary-entry" onClick={() => setShowDiaryModal(true)}>
                <div className="entry-date">
                  <div className="entry-day">07</div>
                  <div className="entry-month">1月</div>
                </div>
                <div className="entry-content">
                  <div className="entry-title">スパーリング練習</div>
                  <div className="entry-meta">90分 · 技術向上</div>
                </div>
                <div className="entry-arrow">›</div>
              </div>
              <div className="diary-entry" onClick={() => setShowDiaryModal(true)}>
                <div className="entry-date">
                  <div className="entry-day">04</div>
                  <div className="entry-month">1月</div>
                </div>
                <div className="entry-content">
                  <div className="entry-title">基本練習</div>
                  <div className="entry-meta">60分 · 復習</div>
                </div>
                <div className="entry-arrow">›</div>
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
              習った技をためて、整理して、使える形に。動画URLやメモを残せるので、自分だけの技ライブラリが育ちます。
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
            <div className="technique-card technique-card-1" onClick={() => setShowTechniqueModal(true)}>
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
            <div className="technique-card technique-card-2" onClick={() => setShowTechniqueModal(true)}>
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
            <div className="technique-card technique-card-3" onClick={() => setShowTechniqueModal(true)}>
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
          iOSアプリの世界観に合わせた配色。自分の帯に合わせたモチベーションを維持できます。帯をクリックして、テーマを切り替えてみてください。
        </p>
        <div className="belt-row">
          <div
            className={`belt ${currentBelt === 'white' ? 'active' : ''}`}
            title="白帯"
            onClick={() => setCurrentBelt('white')}
          />
          <div
            className={`belt blue ${currentBelt === 'blue' ? 'active' : ''}`}
            title="青帯"
            onClick={() => setCurrentBelt('blue')}
          />
          <div
            className={`belt purple ${currentBelt === 'purple' ? 'active' : ''}`}
            title="紫帯"
            onClick={() => setCurrentBelt('purple')}
          />
          <div
            className={`belt brown ${currentBelt === 'brown' ? 'active' : ''}`}
            title="茶帯"
            onClick={() => setCurrentBelt('brown')}
          />
          <div
            className={`belt black ${currentBelt === 'black' ? 'active' : ''}`}
            title="黒帯"
            onClick={() => setCurrentBelt('black')}
          />
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

      {showDiaryModal && (
        <div className="modal-overlay" onClick={() => setShowDiaryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>スパーリング練習</h3>
              <button className="modal-close" onClick={() => setShowDiaryModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-label">日付</div>
                <div className="modal-info">2026年1月7日</div>
              </div>
              <div className="modal-section">
                <div className="modal-label">時間</div>
                <div className="modal-info">90分</div>
              </div>
              <div className="modal-section">
                <div className="modal-label">目的</div>
                <div className="modal-tags">
                  <div className="modal-tag">技術向上</div>
                  <div className="modal-tag">スパーリング</div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-label">メモ</div>
                <div className="modal-info">
                  今日はガードからのスイープを重点的に練習。相手の重心移動を感じ取るタイミングが少しずつ掴めてきた。次回はパスガード対策も意識したい。
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-label">動画</div>
                <div className="modal-video">
                  <div>
                    <div className="modal-video-icon">🎥</div>
                    <div>練習動画を登録可能</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTechniqueModal && (
        <div className="modal-overlay" onClick={() => setShowTechniqueModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>クローズドガード</h3>
              <button className="modal-close" onClick={() => setShowTechniqueModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-label">カテゴリ</div>
                <div className="modal-tags">
                  <div className="modal-tag">ガード</div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-label">説明</div>
                <div className="modal-info">
                  相手を両脚で挟み込み、コントロールする基本的なガードポジション。攻撃と守備の両方で使える重要な技術。
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-label">キーポイント</div>
                <div className="modal-info">
                  • 足首をしっかりロック<br />
                  • 腰を使って相手を引き寄せる<br />
                  • 姿勢を崩してコントロール
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-label">参考動画</div>
                <div className="modal-video">
                  <div>
                    <div className="modal-video-icon">🎥</div>
                    <div>YouTube等の動画URLを保存可能</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
