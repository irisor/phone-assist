class ConversationStore {
    constructor() {
        this.messages = [];
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.messages));
    }

    addMessage(message) {
        // message: { id, speaker, originalText, translatedText, timestamp, isFinal }
        const existingIndex = this.messages.findIndex(m => m.id === message.id);

        if (existingIndex !== -1) {
            // Update existing message (e.g., updating live transcript)
            this.messages[existingIndex] = { ...this.messages[existingIndex], ...message };
        } else {
            // Add new message
            this.messages.push(message);
        }

        this.notify();
    }

    getMessages() {
        return this.messages;
    }

    clear() {
        this.messages = [];
        this.notify();
    }

    exportData() {
        return JSON.stringify(this.messages, null, 2);
    }

    exportText() {
        return this.messages.map(m => {
            const time = new Date(m.timestamp).toLocaleTimeString();
            const speakerDisplay = m.speaker === 'User' ? 'Me' : m.speaker;
            return `[${time}] ${speakerDisplay}:\nOriginal: ${m.originalText}\nTranslated: ${m.translatedText}\n`;
        }).join('\n');
    }

    exportHTML() {
        const rows = this.messages.map(m => {
            const time = new Date(m.timestamp).toLocaleTimeString();
            const speakerDisplay = m.speaker === 'User' ? 'Me' : m.speaker;
            return `
            <div class="message ${m.speaker.toLowerCase()}">
                <div class="meta"><strong>${speakerDisplay}</strong> <span class="time">${time}</span></div>
                <div class="content">
                    <div class="original">${m.originalText}</div>
                    <div class="translated">${m.translatedText}</div>
                </div>
            </div>`;
        }).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Conversation Transcript</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #f4f4f5; }
        .message-container { display: flex; flex-direction: column; width: 100%; }
        .message { padding: 1rem; margin-bottom: 1rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); width: 48%; box-sizing: border-box; }
        
        /* Partner (Left) */
        .message.partner { align-self: flex-start; background: white; border-left: 4px solid #ec4899; border-top-left-radius: 2px; }
        
        /* User (Right) */
        .message.user { align-self: flex-end; background: #e0e7ff; border-right: 4px solid #6366f1; border-top-right-radius: 2px; text-align: left; }
        .message.user .meta { text-align: left; }
        .message.user .time { float: right; }
        
        .meta { color: #71717a; font-size: 0.9rem; margin-bottom: 0.5rem; }
        .time { float: right; }
        .original { color: #52525b; margin-bottom: 0.25rem; font-size: 0.9em; }
        .translated { font-weight: 500; color: #18181b; font-size: 1.1rem; }
    </style>
</head>
<body>
    <h1>Conversation Transcript</h1>
    <div class="message-container">
    ${rows}
    </div>
</body>
</html>`;
    }
}

export const conversationStore = new ConversationStore();
