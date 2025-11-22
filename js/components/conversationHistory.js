import { conversationStore } from '../store/conversationStore.js';

export class ConversationHistory {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        conversationStore.subscribe(this.render.bind(this));
    }

    render(messages) {
        this.container.innerHTML = '';

        if (messages.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>Start a call to see transcription...</p>
                </div>`;
            return;
        }

        messages.forEach(msg => {
            const row = document.createElement('div');
            row.className = `message-row ${msg.speaker.toLowerCase()}`;

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';

            // Main text (Translated)
            const translatedText = document.createElement('div');
            translatedText.textContent = msg.translatedText;
            bubble.appendChild(translatedText);

            // Meta info (Original text + timestamp)
            const meta = document.createElement('div');
            meta.className = 'message-meta';

            if (msg.originalText && msg.originalText !== msg.translatedText) {
                const original = document.createElement('span');
                original.className = 'original-text';
                original.textContent = msg.originalText;
                bubble.insertBefore(original, translatedText); // Show original above translated
            }

            // Timestamp
            /*
            const time = document.createElement('span');
            time.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            meta.appendChild(time);
            bubble.appendChild(meta);
            */

            row.appendChild(bubble);
            this.container.appendChild(row);
        });

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }
}
