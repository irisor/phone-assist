

import { conversationStore } from '../store/conversationStore.js';
import { getPhoneticSpelling } from '../utils/phonetics.js';
import { toast } from './toastNotification.js';

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

            // Speak & Spell Buttons (Only for User messages - they need to spell to Partner)
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
                spellBtn.onclick = (e) => {
                    e.stopPropagation(); // Stop edit mode from triggering
                    let spellingRow = bubble.querySelector('.spelling-row');
                    if (spellingRow) {
                        spellingRow.remove();
                    } else {
                        spellingRow = document.createElement('div');
                        spellingRow.className = 'spelling-row';
                        spellingRow.style.fontSize = '0.9em';
                        spellingRow.style.marginTop = '8px';
                        spellingRow.style.color = '#eee';
                        spellingRow.style.background = 'rgba(0,0,0,0.2)'; // Darker bg for contrast
                        spellingRow.style.padding = '8px';
                        spellingRow.style.borderRadius = '4px';
                        spellingRow.style.lineHeight = '1.5';
                        // FIX: Use innerHTML for multi-line formatting
                        spellingRow.innerHTML = getPhoneticSpelling(msg.translatedText, msg.targetLang);
                        bubble.appendChild(spellingRow);
                    }
                };
                actionsDiv.appendChild(spellBtn);

                // Speak Button
                const speakBtn = document.createElement('button');
                speakBtn.className = 'btn-icon-small';
                speakBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
                speakBtn.title = "Speak translation";
                speakBtn.onclick = (e) => {
                    e.stopPropagation(); // Stop edit mode from triggering
                    // Get user's language for fallback
                    const userLang = document.getElementById('user-lang')?.value || 'en-US';
                    this.speak(msg.translatedText, msg.targetLang, userLang);
                };
                actionsDiv.appendChild(speakBtn);

                bubble.appendChild(actionsDiv);
            }

            row.appendChild(bubble);
            this.container.appendChild(row);
        }

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    speak(text, lang, fallbackLang = 'en-US') {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Special handling for German TTS
            let textToSpeak = text;
            if (lang && lang.startsWith('de')) {
                // Replace "text/text" with "text Schrägstrich text"
                // Using regex with global flag to catch all occurrences
                textToSpeak = textToSpeak.replace(/\//g, ' Schrägstrich ');
            }

            const utterance = new SpeechSynthesisUtterance(textToSpeak);

            if (lang) {
                utterance.lang = lang;

                // Try to find a voice for the specified language
                const voices = window.speechSynthesis.getVoices();
                const langCode = lang.split('-')[0]; // he-IL -> he

                // Find a voice that matches the language
                const matchingVoice = voices.find(voice =>
                    voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
                );

                if (matchingVoice) {
                    utterance.voice = matchingVoice;
                } else {
                    console.warn(`No voice found for language: ${lang}. Falling back to ${fallbackLang}.`);

                    // Notify user that voice is not available
                    const langName = lang.split('-')[0].toUpperCase();
                    const fallbackName = fallbackLang.split('-')[0].toUpperCase();
                    toast.warning(
                        `${langName} voice not available. Using ${fallbackName} voice instead.\n\nTo install ${langName} voice, check your system's Text-to-Speech settings.`,
                        8000
                    );

                    // Fallback to user's language if target language not available
                    const fallbackCode = fallbackLang.split('-')[0];
                    const fallbackVoice = voices.find(voice =>
                        voice.lang.toLowerCase().startsWith(fallbackCode.toLowerCase())
                    );
                    if (fallbackVoice) {
                        utterance.voice = fallbackVoice;
                        utterance.lang = fallbackVoice.lang;
                    }
                }
            }

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
            };

            window.speechSynthesis.speak(utterance);
        } else {
            console.error('Speech synthesis not supported in this browser');
        }
    }
}
