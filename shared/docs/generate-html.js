const fs = require('fs');
const path = require('path');

// Read the Markdown file
const mdContent = fs.readFileSync('./PRIVACY_POLICY.md', 'utf8');

// Split content by language sections
function splitByLanguage(content) {
  const sections = {
    ja: '',
    en: '',
    pt: '',
    ko: ''
  };

  // Split by language headers
  const jaMatch = content.match(/# プライバシーポリシー[\s\S]*?(?=---\s*##\s*Privacy Policy|$)/);
  const enMatch = content.match(/## Privacy Policy \(English\)[\s\S]*?(?=---\s*##\s*Política de Privacidade|$)/);
  const ptMatch = content.match(/## Política de Privacidade \(Português\)[\s\S]*?(?=---\s*##\s*개인정보 처리방침|$)/);
  const koMatch = content.match(/## 개인정보 처리방침 \(한국어\)[\s\S]*?(?=---\s*本プライバシーポリシー|$)/);

  if (jaMatch) sections.ja = jaMatch[0];
  if (enMatch) sections.en = enMatch[0];
  if (ptMatch) sections.pt = ptMatch[0];
  if (koMatch) sections.ko = koMatch[0];

  return sections;
}

// Improved Markdown to HTML converter
function markdownToHtml(md) {
  let html = md;

  // Process line by line to handle headers correctly
  const lines = html.split('\n');
  const processed = [];
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines temporarily
    if (trimmed === '') {
      if (inList) {
        processed.push('<ul>' + listItems.join('\n') + '</ul>');
        listItems = [];
        inList = false;
      }
      processed.push('');
      continue;
    }

    // Headers (must be processed before other patterns)
    if (trimmed.startsWith('### ')) {
      if (inList) {
        processed.push('<ul>' + listItems.join('\n') + '</ul>');
        listItems = [];
        inList = false;
      }
      processed.push('<h3>' + trimmed.substring(4) + '</h3>');
      continue;
    } else if (trimmed.startsWith('## ')) {
      if (inList) {
        processed.push('<ul>' + listItems.join('\n') + '</ul>');
        listItems = [];
        inList = false;
      }
      processed.push('<h2>' + trimmed.substring(3) + '</h2>');
      continue;
    } else if (trimmed.startsWith('# ')) {
      if (inList) {
        processed.push('<ul>' + listItems.join('\n') + '</ul>');
        listItems = [];
        inList = false;
      }
      processed.push('<h1>' + trimmed.substring(2) + '</h1>');
      continue;
    }

    // Horizontal rule
    if (trimmed === '---') {
      if (inList) {
        processed.push('<ul>' + listItems.join('\n') + '</ul>');
        listItems = [];
        inList = false;
      }
      processed.push('<hr>');
      continue;
    }

    // List items
    if (trimmed.startsWith('- ')) {
      inList = true;
      let listContent = trimmed.substring(2);
      // Process inline markdown
      listContent = listContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      listContent = listContent.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
      listItems.push('<li>' + listContent + '</li>');
      continue;
    }

    // Regular paragraphs
    if (inList) {
      processed.push('<ul>' + listItems.join('\n') + '</ul>');
      listItems = [];
      inList = false;
    }

    // Process inline markdown for paragraphs
    line = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    processed.push('<p>' + line + '</p>');
  }

  // Close any remaining list
  if (inList) {
    processed.push('<ul>' + listItems.join('\n') + '</ul>');
  }

  return processed.join('\n');
}

const sections = splitByLanguage(mdContent);
const jaHtml = markdownToHtml(sections.ja);
const enHtml = markdownToHtml(sections.en);
const ptHtml = markdownToHtml(sections.pt);
const koHtml = markdownToHtml(sections.ko);

const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>プライバシーポリシー - BJJ Hub</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
            line-height: 1.8;
            color: #333;
            background-color: #f9f9f9;
            padding: 20px;
        }

        .language-selector {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 8px;
        }

        .language-selector select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            background: white;
            color: #333;
            font-size: 14px;
            cursor: pointer;
            outline: none;
        }

        .language-selector select:hover {
            border-color: #007aff;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .language-section {
            display: none;
        }

        .language-section.active {
            display: block;
        }

        h1 {
            font-size: 2em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            border-bottom: 3px solid #007aff;
            padding-bottom: 10px;
        }

        h2 {
            font-size: 1.5em;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            color: #2c3e50;
        }

        h3 {
            font-size: 1.2em;
            margin-top: 1.2em;
            margin-bottom: 0.6em;
            color: #34495e;
        }

        p {
            margin-bottom: 1em;
        }

        ul {
            margin-left: 2em;
            margin-bottom: 1em;
        }

        li {
            margin-bottom: 0.5em;
        }

        a {
            color: #007aff;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        strong {
            font-weight: 600;
            color: #1a1a1a;
        }

        hr {
            border: none;
            border-top: 2px solid #e0e0e0;
            margin: 2em 0;
        }

        @media (max-width: 768px) {
            .language-selector {
                position: static;
                margin-bottom: 20px;
            }

            .container {
                padding: 20px;
            }

            h1 {
                font-size: 1.5em;
            }

            h2 {
                font-size: 1.3em;
            }

            h3 {
                font-size: 1.1em;
            }
        }
    </style>
</head>
<body>
    <div class="language-selector">
        <select id="languageSelect" onchange="changeLanguage(this.value)">
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="pt">Português</option>
            <option value="ko">한국어</option>
        </select>
    </div>

    <div class="container">
        <div id="ja" class="language-section active">
${jaHtml}
        </div>
        <div id="en" class="language-section">
${enHtml}
        </div>
        <div id="pt" class="language-section">
${ptHtml}
        </div>
        <div id="ko" class="language-section">
${koHtml}
        </div>
    </div>

    <script>
        function changeLanguage(lang) {
            // Hide all sections
            document.querySelectorAll('.language-section').forEach(section => {
                section.classList.remove('active');
            });

            // Show selected section
            document.getElementById(lang).classList.add('active');

            // Save preference
            localStorage.setItem('preferredLanguage', lang);
        }

        // Load saved language preference
        window.addEventListener('DOMContentLoaded', () => {
            const savedLang = localStorage.getItem('preferredLanguage');
            if (savedLang) {
                document.getElementById('languageSelect').value = savedLang;
                changeLanguage(savedLang);
            }
        });
    </script>
</body>
</html>`;

fs.writeFileSync('./privacy-policy.html', htmlTemplate, 'utf8');
console.log('✅ privacy-policy.html has been generated successfully!');
