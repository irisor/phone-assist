import { conversationStore } from './store/conversationStore.js';
import { TranscriptionService } from './services/transcriptionService.js';
import { TranslationService } from './services/translationService.js';
import { ConversationHistory } from './components/conversationHistory.js';
import { AudioVisualizer } from './components/audioVisualizer.js';
import { debugLogger } from './utils/debugLogger.js';
import { getPhoneticSpelling } from './utils/phonetics.js';
import { toast } from './components/toastNotification.js';
import { SettingsModal } from './components/settingsModal.js';
import { settingsStore } from './store/settingsStore.js';

class App {
    constructor() {
        debugLogger.init(); // Initialize debugger immediately
        this.transcriptionService = new TranscriptionService();
        this.translationService = new TranslationService();
        this.conversationHistory = new ConversationHistory('conversation-history');
        this.audioVisualizer = new AudioVisualizer('audio-visualizer');

        this.isListening = false;
        this.currentTranscriptId = null; // To track the current live message being updated

        this.initTheme();
        this.initLanguages(); // Load saved languages

        // Initialize Settings Modal
        this.settingsModal = new SettingsModal(() => {
            // Callback when settings are saved
            const newSettings = settingsStore.getSettings();

            // Update services with new providers
            if (this.translationService && newSettings.translationProvider) {
                this.translationService.setProvider(newSettings.translationProvider);
            }
            if (this.transcriptionService && newSettings.transcriptionProvider) {
                this.transcriptionService.setProvider(newSettings.transcriptionProvider);
            }

            // Reset status to Ready to clear any potential error messages
            const status = document.getElementById('connection-status');
            if (status) {
                status.textContent = 'Ready';
                status.style.color = '';
                status.classList.remove('listening');
            }

            toast.success('Settings saved!');
        });

        this.initEventListeners();
    }

    initLanguages() {
        const savedPartnerLang = localStorage.getItem('partner-lang');
        const savedUserLang = localStorage.getItem('user-lang');

        if (savedPartnerLang) {
            document.getElementById('partner-lang').value = savedPartnerLang;
            this.transcriptionService.setLanguage(savedPartnerLang);
        }

        if (savedUserLang) {
            document.getElementById('user-lang').value = savedUserLang;
        }
    }

    saveLanguages() {
        localStorage.setItem('partner-lang', document.getElementById('partner-lang').value);
        localStorage.setItem('user-lang', document.getElementById('user-lang').value);
    }

    initTheme() {
        // Load theme from localStorage or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    initEventListeners() {
        // Mic Button
        const btnMic = document.getElementById('btn-mic');
        btnMic.addEventListener('click', () => this.toggleListening());

        // Theme Toggle
        document.getElementById('btn-theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Export Buttons
        document.getElementById('btn-export').addEventListener('click', () => this.exportConversation());
        document.getElementById('btn-clear').addEventListener('click', () => this.clearConversation());
        document.getElementById('btn-clear').addEventListener('click', () => this.clearConversation());
        document.getElementById('btn-reload').addEventListener('click', () => this.reloadApp());

        // Settings Button
        const settingsBtn = document.getElementById('open-settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => this.settingsModal.show();
        }

        // Language Selectors
        document.getElementById('partner-lang').addEventListener('change', (e) => {
            this.transcriptionService.setLanguage(e.target.value);
            this.saveLanguages();
        });

        document.getElementById('user-lang').addEventListener('change', () => {
            this.saveLanguages();
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

        debugLogger.log("toggleListening called. Current state: " + this.isListening);

        if (this.isListening) {
            this.transcriptionService.stop();
            this.audioVisualizer.stop();
            this.isListening = false;
            btnMic.classList.remove('active');
            status.classList.remove('listening');
            status.textContent = 'Ready';
            debugLogger.log("Stopped listening.");
        } else {
            try {
                debugLogger.log("Starting AudioVisualizer (CSS) - Waiting for speech...");
                // await this.audioVisualizer.start(); // Don't start immediately, wait for speech
                debugLogger.log("AudioVisualizer ready.");

                debugLogger.log("Starting TranscriptionService...");
                this.transcriptionService.start(
                    (text, isFinal) => {
                        // debugLogger.log(`Result: ${text} (Final: ${isFinal})`); // Too noisy?
                        this.handleIncomingSpeech(text, isFinal);
                    },
                    (error) => {
                        debugLogger.error(`Transcription error: ${error}`);
                        console.error("Transcription error:", error);
                        if (error === 'not-allowed') {
                            toast.error('Microphone access denied. Please check your settings.');
                            this.toggleListening(); // Stop UI
                        } else if (error === 'browser-not-supported') {
                            toast.error('Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.');
                            this.toggleListening(); // Stop UI
                        } else if (error === 'no-speech') {
                            // Ignore, just silence
                        } else if (error === 'network') {
                            status.textContent = 'Network Error';
                            status.style.color = '#ef4444';
                        } else {
                            status.textContent = `Error: ${error}`;
                            status.style.color = '#ef4444';
                        }
                    },
                    // onSpeechStart (Unreliable for stopping, so we use debounce in handleIncomingSpeech)
                    () => {
                        // debugLogger.log("Speech started");
                    },
                    // onSpeechEnd
                    () => {
                        // debugLogger.log("Speech ended");
                    }
                );
                this.isListening = true;
                btnMic.classList.add('active');
                status.classList.add('listening');
                status.textContent = 'Listening...';
                debugLogger.log("Listening state set to true.");
            } catch (e) {
                debugLogger.error(`Failed to start listening: ${e.message}`);
                console.error("Failed to start listening", e);
                toast.error('Could not access microphone. Please check permissions.');
            }
        }
    }

    async handleIncomingSpeech(text, isFinal) {
        if (!text || !text.trim()) return;

        debugLogger.log(`App received: "${text}" (Final: ${isFinal})`);

        // Visual Feedback: Pulse mic AND animate bars (Debounced)
        const btnMic = document.getElementById('btn-mic');
        const visualizer = document.getElementById('audio-visualizer');

        btnMic.classList.add('receiving');
        this.audioVisualizer.start(); // Add .active

        // Clear existing timeout to keep it alive
        if (this.receivingTimeout) clearTimeout(this.receivingTimeout);

        // Stop after 500ms of silence
        this.receivingTimeout = setTimeout(() => {
            btnMic.classList.remove('receiving');
            this.audioVisualizer.stop(); // Remove .active
        }, 500);

        // Mic always listens to Partner per user request
        const isMe = false;

        const partnerLang = document.getElementById('partner-lang').value;
        const userLang = document.getElementById('user-lang').value;

        // Always Partner -> User
        const sourceLang = partnerLang;
        const targetLang = userLang;
        const speakerName = 'Partner';

        // If it's a new utterance, create a new ID
        if (!this.currentTranscriptId) {
            this.currentTranscriptId = Date.now();
        }

        let translated = text; // Default to showing original text for interim

        // OPTIMIZATION: Only translate FINAL results to save API calls and improve quality
        if (isFinal) {
            // Translate live (Partner -> User) - NO number formatting (false)
            // Partner said "24", we want "24" (easier to read)
            translated = await this.translationService.translate(text, targetLang, sourceLang, false);
        } else {
            // For interim, maybe show a visual indicator that it's raw text?
            // For now, just showing the text is fine.
        }

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
        const btnSend = document.getElementById('btn-send');
        const text = input.value.trim();

        if (!text) return;

        // Visual Feedback: Immediate disable & loading state
        input.disabled = true;
        btnSend.disabled = true;

        // Save original button content
        const originalBtnContent = btnSend.innerHTML;
        // Simple loading spinner
        btnSend.innerHTML = `<svg class="animate-spin" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path></svg>`;

        try {
            const partnerLang = document.getElementById('partner-lang').value;
            const userLang = document.getElementById('user-lang').value;

            // Translate User -> Partner
            // REVERT: Don't format numbers to words. Keep digits "24".
            // Phonetics will handle "24" -> "24 vierundzwanzig".
            const translated = await this.translationService.translate(text, partnerLang, userLang, false);

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
        } catch (error) {
            console.error("Send error:", error);
            toast.error("Failed to translate/send message. Please try again.");
            // Do NOT clear input so user can retry
        } finally {
            // Restore UI state
            input.disabled = false;
            btnSend.disabled = false;
            btnSend.innerHTML = originalBtnContent;

            // Re-focus input for next message
            input.focus();
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

    async clearConversation() {
        const messages = conversationStore.getMessages();

        if (messages.length === 0) {
            toast.info('No conversation to clear.');
            return;
        }

        // Show interactive toast with action buttons
        toast.warning(
            'Clear conversation? This cannot be undone.',
            0, // No auto-dismiss (duration)
            [
                {
                    label: '⬇️ Download & Clear',
                    onClick: async () => {
                        await this.exportConversation();
                        setTimeout(() => {
                            conversationStore.clear();
                            toast.success('Conversation downloaded and cleared!');
                        }, 500);
                    }
                },
                {
                    label: '🗑️ Clear Now',
                    onClick: () => {
                        conversationStore.clear();
                        toast.success('Conversation cleared!');
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => {
                        // Just close the toast
                    }
                }
            ]
        );
    }

    async exportConversation() {
        // Quick export - just download HTML
        await this.exportHTML();
    }

    reloadApp() {
        const messages = conversationStore.getMessages();

        // If there's a conversation, ask if user wants to download first
        if (messages.length > 0) {
            toast.warning(
                'Reload app? Unsaved conversation will be lost.',
                0, // No auto-dismiss
                [
                    {
                        label: '⬇️ Download & Reload',
                        onClick: async () => {
                            await this.exportConversation();
                            setTimeout(() => {
                                this.performReload();
                            }, 500);
                        }
                    },
                    {
                        label: '🔄 Reload Now',
                        onClick: () => {
                            this.performReload();
                        }
                    },
                    {
                        label: 'Cancel',
                        onClick: () => {
                            // Just close the toast
                        }
                    }
                ]
            );
        } else {
            // No conversation, just reload
            this.performReload();
        }
    }

    performReload() {
        // Notify user before reload
        toast.info('Reloading app...', 2000);

        // Force reload for PWA updates
        setTimeout(() => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => {
                        registration.update();
                    });
                });
            }

            // Force hard reload
            window.location.reload(true);
        }, 500);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch((err) => console.error('Service Worker Failed', err));
    }
});
