# Markdown Live Viewer

[![npm version](https://badge.fury.io/js/markdown-live-viewer.svg)](https://www.npmjs.com/package/markdown-live-viewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A beautiful, real-time markdown viewer with live reload support. Edit your markdown files and see changes instantly in your browser!

![Demo](https://via.placeholder.com/800x400?text=Screenshot+Coming+Soon)

## Features

- 🎨 Beautiful GitHub-inspired styling
- ⚡ Live reload - changes appear instantly without manual refresh
- 🔍 Syntax highlighting for code blocks (Java, Bash, and more)
- 🔗 Working table of contents with smooth scroll
- 📱 Responsive design
- 🎯 Accepts any markdown file as input

## Installation

### Local Installation

```bash
npm install
```

### Global Installation

```bash
npm link
```

This installs the `mdview` command globally, making it available from anywhere on your system!

## Usage

### Using the global command (recommended)

```bash
# View any markdown file
mdview /path/to/your/file.md

# View from current directory
mdview README.md

# View the MagentaSDK docs
mdview ../docs.md
```

### Using npm start (local)

```bash
# Default (docs.md in parent directory)
npm start

# Specify a markdown file
node server.js /path/to/your/file.md
```

### Examples

```bash
# Global command - use anywhere!
mdview ~/Documents/my-notes.md
mdview ./README.md
mdview ../docs.md

# From current directory
mdview documentation.md

# Local execution
node server.js /path/to/your/file.md
```

## How It Works

1. **Start the server** - Point it to your markdown file
2. **Open browser** - Navigate to http://localhost:8080
3. **Edit markdown** - Make changes to your markdown file
4. **Watch updates** - Changes appear instantly in the browser!

The green "Live" indicator in the top-right shows the connection status.

## Features in Detail

### Live Reload
- Uses WebSocket for instant updates
- Preserves scroll position when content updates
- Shows connection status indicator

### Syntax Highlighting
- GitHub Dark theme for code blocks
- Supports Java, Bash, and many other languages
- Syntax highlighting applies automatically

### Navigation
- All headings get automatic IDs
- Table of contents links work perfectly
- Smooth scrolling to sections

### Styling
- Clean, professional appearance
- Maximum width of 1400px for readability
- Responsive design for mobile devices

## Port Configuration

By default, the server runs on port 8080. You can change it:

```bash
PORT=3000 mdview ../docs.md
```

### Multiple Instances

**Good news!** You can run multiple instances simultaneously. The tool automatically detects if a port is in use and tries the next available port (8081, 8082, etc.).

```bash
# Terminal 1
mdview doc1.md    # Runs on port 8080

# Terminal 2
mdview doc2.md    # Automatically runs on port 8081

# Terminal 3
mdview doc3.md    # Automatically runs on port 8082
```

Each instance watches its own file and runs independently!

## Stopping the Server

Press `Ctrl+C` to stop the server gracefully.

## Uninstalling

### Uninstall global command

```bash
npm unlink -g markdown-live-viewer
```

or from the project directory:

```bash
npm unlink
```

## Troubleshooting

**Connection Lost**: If you see a red "Disconnected" indicator, the server may have stopped. Restart it.

**File Not Found**: Make sure the markdown file path is correct. The tool shows the full path it's watching when it starts.

**Port Already in Use**: Change the port using the PORT environment variable.

## Requirements

- Node.js (v14 or higher)
- npm

## Dependencies

- express - Web server
- marked - Markdown parser
- ws - WebSocket support
- chokidar - File watching
- highlight.js - Syntax highlighting (CDN)
