
import { conversationStore } from '../store/conversationStore.js';
import { getPhoneticSpelling } from '../utils/phonetics.js';

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
            translatedText.className = 'translated-text';
            translatedText.textContent = msg.translatedText;

            // Allow editing of translated text (only for User messages?)
            // Actually, useful for both if transcription is wrong, but mostly for Translation.
            // Let's enable for all.
            translatedText.title = "Click to edit";
            translatedText.style.cursor = "text";
            translatedText.onclick = () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = msg.translatedText;
                input.className = 'edit-input';

                const save = () => {
                    const newText = input.value.trim();
                    if (newText && newText !== msg.translatedText) {
                        conversationStore.updateMessage(msg.id, newText);
                    } else {
                        // Revert visual if canceled/empty
                        this.render(conversationStore.getMessages());
                    }
                };

                input.onblur = save;
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') {
                        save();
                    }
                };

                translatedText.replaceWith(input);
                input.focus();
            };

            bubble.appendChild(translatedText);

            // Meta info (Original text)
            if (msg.originalText) {
                const original = document.createElement('span');
                original.className = 'original-text';
                original.textContent = msg.originalText;
                bubble.insertBefore(original, translatedText);
            }

            // Speak Button (Only for User messages)
            if (msg.speaker === 'User') {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'message-actions';
                actionsDiv.style.marginTop = '5px';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '8px';

                // Spell Button
                const spellBtn = document.createElement('button');
                spellBtn.className = 'btn-icon-small';
                spellBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7V17M4 17L9 7M4 17L9 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 7V17M14 17L19 7M14 17L19 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
                spellBtn.title = "Show Phonetic Spelling";
                spellBtn.onclick = () => {
                    let spellingRow = bubble.querySelector('.spelling-row');
                    if (spellingRow) {
                        spellingRow.remove();
                    } else {
                        spellingRow = document.createElement('div');
                        spellingRow.className = 'spelling-row';
                        spellingRow.style.fontSize = '0.85em';
                        spellingRow.style.marginTop = '8px';
                        spellingRow.style.color = '#fff';
                        spellingRow.style.background = 'rgba(255,255,255,0.1)';
                        spellingRow.style.padding = '4px 8px';
                        spellingRow.style.borderRadius = '4px';
                        // FIX: Spell the TRANSLATED text (Partner's language), not the original
                        spellingRow.textContent = getPhoneticSpelling(msg.translatedText, msg.targetLang);
                        bubble.appendChild(spellingRow);
                    }
                };
                actionsDiv.appendChild(spellBtn);

                // Speak Button
                const speakBtn = document.createElement('button');
                speakBtn.className = 'btn-icon-small';
                speakBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
                speakBtn.title = "Speak translation";
                speakBtn.onclick = () => {
                    this.speak(msg.translatedText, msg.targetLang);
                };
                actionsDiv.appendChild(speakBtn);

                translatedText.appendChild(actionsDiv);
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
