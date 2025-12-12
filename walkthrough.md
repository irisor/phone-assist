# Phone Assist App - Walkthrough

I have enhanced the **Phone Assist App** with a secure backend server, support for multiple translation/transcription providers, and a new settings UI.

## 🚀 How to Run Locally

Because the app now uses secure backend functions for API keys, you cannot simply open `index.html` directly. You need to run it using the Vercel CLI or a local server.

### 1. Prerequisites
- **Node.js** (v18 or higher) installed.
- **Vercel CLI** installed globally:
  ```bash
  npm install -g vercel
  ```

### 2. Setup Configuration
1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and add your API keys for the providers you want to use (e.g., Google, DeepL, OpenAI).
    -   *Note: MyMemory and Web Speech API work without keys.*
3.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Start the Server
Run the local development server:
```bash
vercel dev
```
- **Login:** You may be asked to log in to Vercel the first time.
- **Alternative if you don't use Vercel:** You can theoretically use `http-server` or `live-server`, but the `/api/*` endpoints (Google/DeepL/Whisper) **will not work**. The app will fall back to MyMemory and Web Speech API.

### 4. Access the App
Open your browser to: **http://localhost:3000**

## ✨ New Features

### 🔧 Multiple Providers (Settings)
Click the **Gear Icon** in the header to open Settings.
-   **Translation**:
    -   **MyMemory** (Free, Default) - Client-side.
    -   **Google Cloud Translate** - High quality, requires API Key.
    -   **DeepL** - Best nuance, requires API Key.
    -   **LibreTranslate** - Open source, requires URL.
-   **Transcription**:
    -   **Web Speech API** (Free, Default) - Uses browser capability.
    -   **OpenAI Whisper** - High accuracy, requires OpenAI Key.
    -   **AssemblyAI** - Real-time streaming, requires API Key.

### 🔒 Security
-   **No API Keys in Client**: All private API keys are stored in `.env` (server-side) and never exposed to the browser.
-   **Secure Proxy**: The `/api/*` endpoints handle the requests safely.
-   **NPM Security**: Configured `.npmrc` to lock dependency versions and prevent malicious scripts.

## ✅ Verification Steps

1.  **Check Settings**: Open the Settings modal. You should see providers enabled based on which keys you added to `.env`.
2.  **Test Translation**:
    -   Select **Google** or **DeepL** (if configured).
    -   Type a message and send. Verify it translates correctly.
3.  **Test Transcription**:
    -   Select **Web Speech API** (default). Press Mic and speak.
    -   Select **Whisper** (if configured). Press Mic, speak, and stop. Note: Whisper sends audio *after* you stop speaking (file upload).
    -   Select **AssemblyAI** (if configured). Press Mic and speak. You should see real-time updates via WebSocket.
4.  **Security Check**: Open Network Tab in DevTools. Verify requests go to `http://localhost:3000/api/translate` and **NOT** directly to Google/DeepL APIs with keys visible.

## 📱 Mobile Notes
-   To test on mobile with the backend, your phone must be on the same network.
-   Run `vercel dev --listen 0.0.0.0` to expose to the network.
-   Access via `http://YOUR_PC_IP:3000`.
-   *Note: Functionality requiring HTTPS (like Microphone) might be blocked on mobile browsers when using HTTP (localhost).* Use localhost debugging or deploy to Vercel for full HTTPS support.
