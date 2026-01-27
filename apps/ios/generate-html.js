const fs = require('fs');
const path = require('path');

// Read the Markdown file
const mdContent = fs.readFileSync('./PRIVACY_POLICY.md', 'utf8');

// Simple Markdown to HTML converter
function markdownToHtml(md) {
  let html = md;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>');

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');

  // Wrap consecutive <li> tags in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');

  // Horizontal rule
  html = html.replace(/^---$/gim, '<hr>');

  // Paragraphs (lines that are not already HTML)
  const lines = html.split('\n');
  const processed = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('<') || trimmed === '') {
      processed.push(line);
      if (trimmed.startsWith('<ul>')) inList = true;
      if (trimmed.startsWith('</ul>')) inList = false;
    } else if (!inList) {
      processed.push(`<p>${line}</p>`);
    } else {
      processed.push(line);
    }
  }

  return processed.join('\n');
}

const bodyContent = markdownToHtml(mdContent);

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

        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
    <div class="container">
${bodyContent}
    </div>
</body>
</html>`;

fs.writeFileSync('./privacy-policy.html', htmlTemplate, 'utf8');
console.log('✅ privacy-policy.html has been generated successfully!');
