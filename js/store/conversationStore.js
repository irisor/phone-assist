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
            return `[${time}] ${m.speaker}: ${m.translatedText} (${m.originalText})`;
        }).join('\n');
    }
}

export const conversationStore = new ConversationStore();
