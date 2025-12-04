const express = require('express');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const http = require('http');

const app = express();
let PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;

// Get markdown file path from command line arguments
const args = process.argv.slice(2);
let markdownFilePath;

if (args.length === 0) {
  // Default to docs.md in parent directory
  markdownFilePath = path.join(__dirname, '..', 'docs.md');
  console.log('No file specified, using default: ../docs.md');
} else {
  markdownFilePath = path.resolve(args[0]);
}

// Verify file exists
if (!fs.existsSync(markdownFilePath)) {
  console.error(`Error: File not found: ${markdownFilePath}`);
  console.log('\nUsage: node server.js [markdown-file-path]');
  console.log('Example: node server.js ../docs.md');
  process.exit(1);
}

console.log(`\n📄 Watching markdown file: ${markdownFilePath}\n`);

// Configure marked for better code rendering and header IDs
const renderer = new marked.Renderer();

renderer.heading = function(text, level, raw) {
  const id = raw.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${level} id="${id}">${text}</h${level}>\n`;
};

marked.setOptions({
  renderer: renderer,
  breaks: false,
  gfm: true
});

// Serve static files
app.use(express.static(__dirname));

// Function to read and convert markdown
function getHtmlContent() {
  try {
    const markdown = fs.readFileSync(markdownFilePath, 'utf8');
    const htmlContent = marked.parse(markdown);
    return htmlContent;
  } catch (err) {
    console.error('Error reading markdown file:', err);
    return '<h1>Error loading markdown file</h1><pre>' + err.toString() + '</pre>';
  }
}

// Main route - convert markdown to HTML
app.get('/', (req, res) => {
  const htmlContent = getHtmlContent();

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Viewer - ${path.basename(markdownFilePath)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/java.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f7fa;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .content {
            background: white;
            padding: 60px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .live-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .live-indicator.disconnected {
            background: #f56565;
        }

        .live-indicator .pulse {
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        h1, h2, h3, h4, h5, h6 {
            scroll-margin-top: 20px;
        }

        h1 {
            color: #1a202c;
            font-size: 2.5em;
            margin-bottom: 0.5em;
            border-bottom: 3px solid #4299e1;
            padding-bottom: 0.3em;
        }

        h2 {
            color: #2d3748;
            font-size: 2em;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.3em;
        }

        h3 {
            color: #4a5568;
            font-size: 1.5em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
        }

        h4 {
            color: #718096;
            font-size: 1.2em;
            margin-top: 1em;
            margin-bottom: 0.5em;
        }

        p {
            margin-bottom: 1em;
        }

        ul, ol {
            margin-left: 2em;
            margin-bottom: 1em;
        }

        li {
            margin-bottom: 0.5em;
        }

        code {
            background: #f7fafc;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.9em;
            color: #c7254e;
        }

        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 1.5em;
            border-radius: 6px;
            overflow-x: auto;
            margin: 1.5em 0;
        }

        pre code {
            background: none !important;
            padding: 0 !important;
            color: inherit !important;
            font-size: 0.95em;
            line-height: 1.5;
            border: none !important;
            border-radius: 0 !important;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
            border: 1px solid #e2e8f0;
        }

        th {
            background: #4299e1;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
        }

        tr:nth-child(even) {
            background: #f7fafc;
        }

        tr:hover {
            background: #edf2f7;
        }

        a {
            color: #4299e1;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        hr {
            border: none;
            border-top: 2px solid #e2e8f0;
            margin: 2em 0;
        }

        blockquote {
            border-left: 4px solid #cbd5e0;
            padding-left: 1em;
            margin: 1em 0;
            color: #718096;
            font-style: italic;
        }

        @media (max-width: 768px) {
            .content {
                padding: 30px 20px;
            }

            h1 {
                font-size: 2em;
            }

            h2 {
                font-size: 1.5em;
            }

            .live-indicator {
                top: 10px;
                right: 10px;
                font-size: 0.8em;
            }
        }
    </style>
</head>
<body>
    <div class="live-indicator" id="liveIndicator">
        <span class="pulse"></span>
        <span>Live</span>
    </div>
    <div class="container">
        <div class="content" id="content">
            ${htmlContent}
        </div>
    </div>
    <script>
        // WebSocket connection for live reload
        const ws = new WebSocket('ws://' + window.location.host);
        const indicator = document.getElementById('liveIndicator');

        ws.onopen = function() {
            console.log('WebSocket connected');
            indicator.classList.remove('disconnected');
        };

        ws.onclose = function() {
            console.log('WebSocket disconnected');
            indicator.classList.add('disconnected');
            indicator.innerHTML = '<span>⚠️</span><span>Disconnected</span>';
        };

        ws.onmessage = function(event) {
            if (event.data === 'reload') {
                console.log('File changed, reloading content...');

                // Save scroll position
                const scrollPos = window.scrollY;

                // Reload the page content
                fetch('/')
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const newContent = doc.getElementById('content').innerHTML;
                        document.getElementById('content').innerHTML = newContent;

                        // Re-apply syntax highlighting
                        document.querySelectorAll('pre code').forEach((block) => {
                            hljs.highlightElement(block);
                        });

                        // Restore scroll position
                        window.scrollTo(0, scrollPos);

                        console.log('Content reloaded');
                    })
                    .catch(err => console.error('Error reloading content:', err));
            }
        };

        // Apply syntax highlighting on initial load
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
    </script>
</body>
</html>`;

  res.send(fullHtml);
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Track connected clients
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Watch markdown file for changes
const watcher = chokidar.watch(markdownFilePath, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (path) => {
  console.log(`File changed: ${path}`);

  // Notify all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload');
    }
  });
});

// Function to find an available port
function findAvailablePort(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    function tryPort() {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find available port after ${maxAttempts} attempts`));
        return;
      }

      const testServer = http.createServer();

      testServer.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          currentPort++;
          tryPort();
        } else {
          reject(err);
        }
      });

      testServer.once('listening', () => {
        testServer.close();
        resolve(currentPort);
      });

      testServer.listen(currentPort);
    }

    tryPort();
  });
}

// Start server with auto port detection
findAvailablePort(PORT)
  .then(availablePort => {
    PORT = availablePort;

    server.listen(PORT, () => {
      console.log(`✅ Markdown Live Viewer is running!`);
      console.log(`\n📚 View at: http://localhost:${PORT}`);
      console.log(`📝 Watching: ${markdownFilePath}`);
      console.log(`\n💡 Edit the markdown file to see live updates!`);
      console.log(`🛑 Press Ctrl+C to stop\n`);
    });
  })
  .catch(err => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  watcher.close();
  server.close();
  process.exit(0);
});
