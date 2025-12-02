# Phone Assist App - Walkthrough

I have successfully built the **Phone Assist App** as a premium Vanilla Web Application. Since it uses modern web standards, it requires no installation and runs directly in your browser.

## How to Run
1.  Open the file `index.html` in your browser (Chrome, Edge, or Safari recommended for Web Speech API support).
    -   You can simply double-click the file in your file explorer.
    -   Or right-click -> Open With -> Google Chrome.

## Features Implemented
-   **Real-time Transcription**: Uses the Web Speech API to listen to your partner.
-   **Manual Diarization**: Use the **"Mic Input" toggle** at the top to switch between "Partner" and "Me".
-   **Push-to-Mute (Walkie-Talkie)**: 
    -   **Desktop**: Hold **Alt Key** to temporarily mute the mic.
    -   **Mobile**: Tap the **"Tap to Mute"** button (Toggle).
-   **Live Translation**: 
    -   **Real API**: Uses the **MyMemory Translation API** (Free Tier).
    -   **Number Conversion**: Automatically converts numbers like "50" to "fifty".
-   **Conversation History**: Displays a chat-like interface distinguishing between "Partner" and "User".
-   **Text-to-Speech (TTS)**: 
    -   Auto-TTS is **disabled**.
    -   Click the small **Speaker Icon** next to your translated messages to hear them spoken out loud.
-   **Export Options**: 
    -   **HTML**: Download a formatted HTML file of the transcript.
    -   **PDF**: Opens a print view where you can "Save as PDF".
-   **Visualizer**: A real-time audio visualizer that reacts to microphone input.

## Verification Steps
1.  **Microphone Permission**: Click the microphone button and allow access.
2.  **Test Mute**: Tap "Tap to Mute" and verify no text appears when speaking.
3.  **Test Export**: 
    -   Click the **HTML Icon** to download a `.html` file.
    -   Click the **PDF Icon** to open the print dialog. Choose "Save as PDF".
