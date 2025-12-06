The server directory follows a common Node.js/TypeScript backend structure with clear separation of concerns:

1. Root files:
- .env: Environment variables
- .gitignore: Git ignore rules
- package*.json: Project dependencies and config
- tsconfig.json: TypeScript configuration

2. src/ directory (main application code):
- app.ts: Likely the main Express app configuration
- index.ts: Entry point that starts the server
- controllers/: Business logic handlers (currently only userController.ts)
- routes/: API route definitions (currently only userRoutes.ts)
- services/: Business logic/services (currently only userServices.ts)
- types/: Type definitions (currently only user.d.ts)

3. The structure suggests a clean MVC-like pattern where:
- Routes define endpoints and call controllers
- Controllers handle requests/responses and call services
- Services contain core business logic
- Types define shared interfaces

## Production Deployment

### ⚠️ CRITICAL: Node.js Version Requirement

**This project requires Node.js version 20 or higher.** The production server must be running Node.js 20.x, 22.x, 23.x, or 24.x.

**Check your Node.js version:**
```bash
node --version
```

If you see `v18.x.x` or lower, you **must upgrade** before deploying.

### Upgrading Node.js on Production Server

#### Option 1: Using NVM (Recommended)

If you have NVM installed:

```bash
# Install Node.js 22 (LTS)
nvm install 22
nvm use 22
nvm alias default 22

# Verify version
node --version  # Should show v22.x.x
```

#### Option 2: Using NodeSource Repository (Ubuntu/Debian)

```bash
# Remove old Node.js if installed via apt
sudo apt remove nodejs npm

# Install Node.js 22.x
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify version
node --version  # Should show v22.x.x
npm --version
```

#### Option 3: Using Binary Installation

```bash
# Download and install Node.js 22.x
cd /tmp
wget https://nodejs.org/dist/v22.11.0/node-v22.11.0-linux-x64.tar.xz
tar -xf node-v22.11.0-linux-x64.tar.xz
sudo cp -r node-v22.11.0-linux-x64/* /usr/local/

# Verify version
node --version
```

### Deployment Steps

1. **Verify Node.js version** (must be 20+):
   ```bash
   node --version
   ```

2. **On your production server**, navigate to the server directory:
   ```bash
   cd /var/www/otherProjects/Real-Fake-News/server
   ```

3. **Remove existing node_modules** (if copied from another machine or after Node.js upgrade):
   ```bash
   rm -rf node_modules package-lock.json
   ```

4. **Install dependencies directly on the production server**:
   ```bash
   npm install --include=optional --legacy-peer-deps
   ```

   The flags ensure:
   - `--include=optional`: `sharp`'s platform-specific optional dependencies are installed correctly
   - `--legacy-peer-deps`: Resolves peer dependency conflicts with `langchain` packages (safe for optional peer deps)

5. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

6. **Start the server**:
   ```bash
   npm start
   ```

### Common Errors and Solutions

#### Error: "Unsupported engine" warnings
- **Cause**: Node.js version is too old (v18 or lower)
- **Solution**: Upgrade to Node.js 20+ using one of the methods above

#### Error: "Could not load the sharp module"
- **Cause**: Wrong platform binaries or Node.js version mismatch
- **Solution**: 
  1. Ensure Node.js is version 20+
  2. Remove `node_modules` and reinstall: `rm -rf node_modules && npm install --include=optional`

#### Error: "better-sqlite3" build errors
- **Cause**: Node.js version mismatch or missing build tools
- **Solution**: 
  1. Upgrade to Node.js 20+
  2. Install build essentials: `sudo apt-get install build-essential python3`

### Why These Requirements Exist

- **Node.js 20+**: Required by `better-sqlite3@12.4.1` and `simple-xml-to-json@1.2.3`
- **Platform-specific binaries**: `sharp` uses native C++ libraries compiled for specific CPU architectures
- **Never copy node_modules**: Always run `npm install` on the target machine to get correct binaries