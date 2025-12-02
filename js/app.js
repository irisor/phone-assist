import { conversationStore } from './store/conversationStore.js';
import { TranscriptionService } from './services/transcriptionService.js';
import { TranslationService } from './services/translationService.js';
import { ConversationHistory } from './components/conversationHistory.js';
import { AudioVisualizer } from './components/audioVisualizer.js';

class App {
    constructor() {
        this.transcriptionService = new TranscriptionService();
        this.translationService = new TranslationService();
        this.conversationHistory = new ConversationHistory('conversation-history');
        this.audioVisualizer = new AudioVisualizer('audio-visualizer');

        this.isListening = false;
        this.currentTranscriptId = null; // To track the current live message being updated

        this.initEventListeners();
    }

    initEventListeners() {
        // Mic Button
        const btnMic = document.getElementById('btn-mic');
        btnMic.addEventListener('click', () => this.toggleListening());

        // Export Buttons
        document.getElementById('btn-export-html').addEventListener('click', () => this.exportHTML());
        document.getElementById('btn-export-pdf').addEventListener('click', () => this.exportPDF());

        // Language Selectors
        document.getElementById('partner-lang').addEventListener('change', (e) => {
            this.transcriptionService.setLanguage(e.target.value);
        });

        // User Input (Send)
        document.getElementById('btn-send').addEventListener('click', () => this.handleUserSend());
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserSend();
            }
        });

        // Push-to-Mute (Alt Key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Alt') {
                e.preventDefault();
                if (!this.isMuted) this.setMute(true);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                this.setMute(false);
            }
        });

        // Toggle Mute (Button) - Changed from Hold to Toggle per user feedback
        const btnMute = document.getElementById('btn-mute-hold');

        btnMute.addEventListener('click', (e) => {
            e.preventDefault();
            // Toggle state
            this.setMute(!this.isMuted);
        });
    }

    setMute(shouldMute) {
        if (this.isMuted === shouldMute) return; // No change
        this.isMuted = shouldMute;
        this.transcriptionService.setMute(shouldMute); // Sync state

        // Hard Mute: Abort recognition to drop buffered audio
        if (shouldMute) {
            this.transcriptionService.abort();
        } else {
            // Restart if we were supposed to be listening
            if (this.isListening) {
                // Wait a bit for abort to complete
                setTimeout(() => {
                    try {
                        this.transcriptionService.start(
                            (text, isFinal) => this.handleIncomingSpeech(text, isFinal),
                            (error) => console.error(error)
                        );
                    } catch (e) {
                        console.error("Failed to restart after mute:", e);
                    }
                }, 200);
            }
        }

        const btnMute = document.getElementById('btn-mute-hold');
        const status = document.getElementById('connection-status');
        const btnText = btnMute.querySelector('span');

        if (shouldMute) {
            btnMute.classList.add('active');
            status.textContent = 'Muted (Reading...)';
            status.style.color = '#ef4444';
            if (btnText) btnText.textContent = "Tap to Unmute";
        } else {
            btnMute.classList.remove('active');
            if (btnText) btnText.textContent = "Tap to Mute";

            if (this.isListening) {
                status.textContent = 'Listening...';
                status.style.color = ''; // Reset
            } else {
                status.textContent = 'Ready';
                status.style.color = '';
            }
        }
    }

    async toggleListening() {
        const btnMic = document.getElementById('btn-mic');
        const status = document.getElementById('connection-status');

        if (this.isListening) {
            this.transcriptionService.stop();
            this.audioVisualizer.stop();
            this.isListening = false;
            btnMic.classList.remove('active');
            status.classList.remove('listening');
            status.textContent = 'Ready';
        } else {
            try {
                this.audioVisualizer.start();
                this.transcriptionService.start(
                    (text, isFinal) => this.handleIncomingSpeech(text, isFinal),
                    (error) => console.error(error)
                );
                this.isListening = true;
                btnMic.classList.add('active');
                status.classList.add('listening');
                status.textContent = 'Listening...';
            } catch (e) {
                console.error("Failed to start listening", e);
                alert("Could not access microphone. Please check permissions.");
            }
        }
    }

    async handleIncomingSpeech(text, isFinal) {
        // Check toggle state: Checked = Me, Unchecked = Partner
        const isMe = document.getElementById('speaker-toggle').checked;

        const partnerLang = document.getElementById('partner-lang').value;
        const userLang = document.getElementById('user-lang').value;

        // Determine Source/Target based on who is speaking
        const sourceLang = isMe ? userLang : partnerLang;
        const targetLang = isMe ? partnerLang : userLang;
        const speakerName = isMe ? 'User' : 'Partner';

        // If it's a new utterance, create a new ID
        if (!this.currentTranscriptId) {
            this.currentTranscriptId = Date.now();
        }

        // Translate live
        const translated = await this.translationService.translate(text, sourceLang, targetLang);

        conversationStore.addMessage({
            id: this.currentTranscriptId,
            speaker: speakerName,
            originalText: text,
            translatedText: translated,
            targetLang: targetLang, // Store for TTS
            timestamp: Date.now(),
            isFinal: isFinal
        });

        if (isFinal) {
            this.currentTranscriptId = null; // Reset for next utterance
        }
    }

    async handleUserSend() {
        const input = document.getElementById('user-input');
        const text = input.value.trim();
        if (!text) return;

        const partnerLang = document.getElementById('partner-lang').value;
        const userLang = document.getElementById('user-lang').value;

        // Translate User -> Partner
        const translated = await this.translationService.translate(text, userLang, partnerLang);

        conversationStore.addMessage({
            id: Date.now(),
            speaker: 'User',
            originalText: text,
            translatedText: translated,
            targetLang: partnerLang, // User speaks to Partner
            timestamp: Date.now(),
            isFinal: true
        });

        input.value = '';

        // Auto-TTS removed per user request.
        // this.speak(translated, partnerLang); 
    }

    speak(text, lang) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        }
    }

    exportHTML() {
        const html = conversationStore.exportHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportPDF() {
        const html = conversationStore.exportHTML();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            // printWindow.close(); // Optional: close after print
        };
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
