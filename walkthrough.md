# Phone Assist App - Walkthrough

I have successfully built the **Phone Assist App** as a premium Vanilla Web Application. Since it uses modern web standards, it requires no installation and runs directly in your browser.

## How to Run
1.  Open the file `index.html` in your browser (Chrome, Edge, or Safari recommended for Web Speech API support).
    -   You can simply double-click the file in your file explorer.
    -   Or right-click -> Open With -> Google Chrome.

## Features Implemented
-   **Real-time Transcription**: Uses the Web Speech API to listen to your partner.
-   **Live Translation**: Mocks translation (e.g., English <-> German) for demonstration.
-   **Conversation History**: Displays a chat-like interface distinguishing between "Partner" and "User".
-   **Text-to-Speech**: When you send a reply, it is spoken out loud in the partner's language.
-   **Visualizer**: A real-time audio visualizer that reacts to microphone input.
-   **Export**: Click the download icon to save the transcript as a text file.

## Verification Steps
1.  **Microphone Permission**: When you first click the microphone button, the browser will ask for permission. Click "Allow".
2.  **Test Partner Speech**: Speak into the microphone (simulating the partner). You should see "Partner" bubbles appear with the text.
3.  **Test User Reply**: Type a message in the input box and hit Enter. A "User" bubble will appear, and you should hear the computer speak the translation.
4.  **Test Language Switch**: Change the "Partner" language dropdown and speak again.
5.  **Test Export**: Click the download icon in the bottom right to save the conversation.

## Note on APIs
-   **Speech-to-Text**: Currently uses the browser's built-in API. It works best in Chrome.
-   **Translation**: Currently using a **mock** service (it just appends language tags). To make it real, you would update `js/services/translationService.js` with a call to an API like DeepL or Google Translate.
