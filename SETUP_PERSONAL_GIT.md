# Publishing to Personal GitHub (While Using Enterprise Git)

This guide helps you publish to your personal GitHub account while keeping your enterprise git configuration intact.

## Step 1: Configure Git Locally for This Project

Set your personal email and name for this repository only:

```bash
cd /Users/kevindra/workspace/work/llmo-2/src/MagentaSDK/docs-html

# Set personal email (local to this repo only)
git config user.email "kevindra.singh@gmail.com"
git config user.name "Kevindra Singh"

# Verify it's set
git config user.email
git config user.name
```

**Note**: This only affects this repository. Your enterprise repos will still use your work email.

## Step 2: Set Up GitHub Authentication

You have two options:

### Option A: Using Personal Access Token (Recommended)

1. **Create a Personal Access Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name: "markdown-live-viewer"
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (if using GitHub Actions)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Use token when pushing**:
   ```bash
   # Initialize git
   git init
   git add .
   git commit -m "Initial commit: Markdown Live Viewer v1.0.0"

   # Add remote with token
   git remote add origin https://kevindra:[YOUR_TOKEN]@github.com/kevindra/markdown-live-viewer.git

   # Or if remote already exists, update it
   git remote set-url origin https://kevindra:[YOUR_TOKEN]@github.com/kevindra/markdown-live-viewer.git

   # Push
   git push -u origin main
   ```

3. **Cache credentials** (optional, so you don't need token every time):
   ```bash
   # macOS
   git config --local credential.helper osxkeychain

   # Linux
   git config --local credential.helper cache

   # Or store permanently (less secure)
   git config --local credential.helper store
   ```

### Option B: Using SSH Keys

1. **Generate SSH key for personal GitHub**:
   ```bash
   ssh-keygen -t ed25519 -C "kevindra.singh@gmail.com" -f ~/.ssh/github_personal
   ```

2. **Add SSH key to ssh-agent**:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/github_personal
   ```

3. **Add public key to GitHub**:
   - Copy your public key:
     ```bash
     cat ~/.ssh/github_personal.pub
     ```
   - Go to https://github.com/settings/keys
   - Click "New SSH key"
   - Title: "Personal MacBook"
   - Paste the key
   - Click "Add SSH key"

4. **Configure SSH for this repo**:
   ```bash
   # Add to ~/.ssh/config
   cat >> ~/.ssh/config << 'EOF'

   Host github.com-personal
       HostName github.com
       User git
       IdentityFile ~/.ssh/github_personal
   EOF

   # Set up git remote with SSH
   git remote add origin git@github.com-personal:kevindra/markdown-live-viewer.git
   ```

5. **Push**:
   ```bash
   git push -u origin main
   ```

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `markdown-live-viewer`
3. Description: "Beautiful live markdown viewer with instant reload"
4. Choose **Public**
5. **Do NOT** check "Initialize with README"
6. Click "Create repository"

## Step 4: Push Your Code

```bash
cd /Users/kevindra/workspace/work/llmo-2/src/MagentaSDK/docs-html

# Initialize (if not already done)
git init

# Set main as default branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit: Markdown Live Viewer v1.0.0"

# Push (will use the credentials you set up above)
git push -u origin main
```

## Step 5: Publish to npm

```bash
# Login to npm
npm login
# Enter username: (your npm username)
# Enter password: (your npm password)
# Enter email: kevindra.singh@gmail.com

# Publish
npm publish
```

## Quick Commands

```bash
# One-time setup
cd /Users/kevindra/workspace/work/llmo-2/src/MagentaSDK/docs-html
git config user.email "kevindra.singh@gmail.com"
git config user.name "Kevindra Singh"

# Create repo on GitHub (do this in browser first)
# Then:
git init
git add .
git commit -m "Initial commit: Markdown Live Viewer v1.0.0"
git branch -M main

# Choose one:
# With Personal Access Token:
git remote add origin https://kevindra:[YOUR_TOKEN]@github.com/kevindra/markdown-live-viewer.git

# Or with SSH:
git remote add origin git@github.com:kevindra/markdown-live-viewer.git

# Push
git push -u origin main

# Publish to npm
npm login
npm publish
```

## Troubleshooting

### "Permission denied" when pushing
- Make sure you created the GitHub repository first
- Verify your token has `repo` scope
- Check your remote URL: `git remote -v`

### "Authentication failed"
- Token might be expired or incorrect
- Try removing and re-adding the remote with correct token
- For SSH: Check `ssh -T git@github.com`

### "Repository not found"
- Create the repository on GitHub first at https://github.com/new
- Make sure the name matches exactly: `markdown-live-viewer`

### Git is still using work email
```bash
# Check current config
git config user.email

# If it shows work email, set local config again
git config --local user.email "kevindra.singh@gmail.com"
git config --local user.name "Kevindra Singh"

# Verify
git config --local user.email
```

## Verify Everything

```bash
# Check local git config
git config user.email        # Should show: kevindra.singh@gmail.com
git config user.name         # Should show: Kevindra Singh

# Check remote
git remote -v                # Should show your personal repo

# Check global (should still be work)
git config --global user.email  # Should show your work email
```

Your global git config remains unchanged, only this project uses your personal email!
