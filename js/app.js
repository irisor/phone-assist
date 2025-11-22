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

        // Export Button
        document.getElementById('btn-export').addEventListener('click', () => this.exportTranscript());

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
        // Partner is speaking
        const partnerLang = document.getElementById('partner-lang').value;
        const userLang = document.getElementById('user-lang').value;

        // If it's a new utterance, create a new ID
        if (!this.currentTranscriptId) {
            this.currentTranscriptId = Date.now();
        }

        // Translate live
        const translated = await this.translationService.translate(text, partnerLang, userLang);

        conversationStore.addMessage({
            id: this.currentTranscriptId,
            speaker: 'Partner',
            originalText: text,
            translatedText: translated,
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
            timestamp: Date.now(),
            isFinal: true
        });

        input.value = '';

        // Optional: Speak the translated text (TTS)
        this.speak(translated, partnerLang);
    }

    speak(text, lang) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            window.speechSynthesis.speak(utterance);
        }
    }

    exportTranscript() {
        const text = conversationStore.exportText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcript-${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
