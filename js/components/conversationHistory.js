
import { conversationStore } from '../store/conversationStore.js';

export class ConversationHistory {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        conversationStore.subscribe(this.render.bind(this));
    }

    render(messages) {
        // Optimization: Only append new messages, but ALWAYS re-render the last one
        // because it might be receiving live updates (interim results).

        const hasEmptyState = this.container.querySelector('.empty-state');
        if (hasEmptyState) {
            this.container.innerHTML = '';
        }

        if (messages.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <p>Start a call to see transcription...</p>
                </div>`;
            return;
        }

        // If we have fewer messages than before (clear), reset
        if (messages.length < this.container.children.length) {
            this.container.innerHTML = '';
        }

        // Start from the last existing message (to update it) or 0
        let startIndex = Math.max(0, this.container.children.length - 1);

        // Remove the last element so we can re-render it with latest data
        if (this.container.children.length > 0) {
            this.container.lastElementChild.remove();
        }

        for (let i = startIndex; i < messages.length; i++) {
            const msg = messages[i];
            const row = document.createElement('div');
            row.className = `message-row ${msg.speaker.toLowerCase()}`;

            const bubble = document.createElement('div');
            bubble.className = 'message-bubble';

            // Main text (Translated)
            const translatedText = document.createElement('div');
            translatedText.textContent = msg.translatedText;
            bubble.appendChild(translatedText);

            // Meta info (Original text)
            if (msg.originalText && msg.originalText !== msg.translatedText) {
                const original = document.createElement('span');
                original.className = 'original-text';
                original.textContent = msg.originalText;
                bubble.insertBefore(original, translatedText);
            }

            // Speak Button (Only for User messages)
            if (msg.speaker === 'User') {
                const speakBtn = document.createElement('button');
                speakBtn.className = 'btn-speak';
                speakBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
                speakBtn.title = "Speak translation";
                speakBtn.onclick = () => {
                    this.speak(msg.translatedText, msg.targetLang);
                };
                translatedText.appendChild(speakBtn);
            }

            row.appendChild(bubble);
            this.container.appendChild(row);
        }

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    speak(text, lang) {
        if ('speechSynthesis' in window) {
            // Detect language? For now default to partner's lang (German usually) or auto-detect
            // Since we don't have the lang in the message object, we might need to guess or pass it.
            // For MVP, let's assume if it's User speaking, it's translated to Partner's lang.
            // Ideally, we should store 'targetLang' in the message.
            const utterance = new SpeechSynthesisUtterance(text);
            if (lang) {
                utterance.lang = lang;
            }
            window.speechSynthesis.speak(utterance);
        }
    }
}
