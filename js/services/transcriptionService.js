import { TranscriptionProviderFactory } from './transcriptionProviders.js';

export class TranscriptionService {
    constructor() {
        this.currentProviderId = localStorage.getItem('transcriptionProvider') || 'webspeech';
        this.provider = null;
        this.isListening = false;
        this.isMuted = false;

        // Cache callbacks so we can re-attach when switching providers
        this.callbacks = { onResult: null, onError: null, onSpeechStart: null, onSpeechEnd: null };
        this.language = 'de-DE';

        this.initProvider();
    }

    initProvider() {
        // Cleanup old provider if exists
        if (this.provider) {
            this.provider.stop();
        }

        this.provider = TranscriptionProviderFactory.getProvider(this.currentProviderId);
        this.provider.setLanguage(this.language);
        this.provider.setMute(this.isMuted);
    }

    setProvider(providerId) {
        if (this.currentProviderId === providerId) return;

        this.currentProviderId = providerId;
        const wasListening = this.isListening;

        this.stop(); // Stop current
        this.initProvider(); // Create new

        // If we were listening, restart with new provider
        if (wasListening) {
            // Pass cached callbacks
            this.start(
                this.callbacks.onResult,
                this.callbacks.onError,
                this.callbacks.onSpeechStart,
                this.callbacks.onSpeechEnd
            );
        }
    }

    setLanguage(lang) {
        const oldLang = this.language;
        this.language = lang;

        if (this.provider) {
            this.provider.setLanguage(lang);

            // WebSpeech (and others) often require a restart to pick up the new language
            if (this.isListening && oldLang !== lang) {
                console.log(`TranscriptionService: Restarting to apply language change (${oldLang} -> ${lang})`);

                // Stop the current session
                this.stop();

                // Restart immediately with the new language
                // We use a small timeout to ensure the 'stop' and 'end' events clear up
                setTimeout(() => {
                    if (!this.isListening) { // Double check we didn't get stopped elsewhere
                        this.start(
                            this.callbacks.onResult,
                            this.callbacks.onError,
                            this.callbacks.onSpeechStart,
                            this.callbacks.onSpeechEnd
                        );
                    }
                }, 100);
            }
        }
    }

    start(onResult, onError, onSpeechStart, onSpeechEnd) {
        this.callbacks = { onResult, onError, onSpeechStart, onSpeechEnd };

        if (!this.provider) this.initProvider();

        try {
            this.provider.start(
                onResult,
                onError,
                onSpeechStart,
                onSpeechEnd
            );
            this.isListening = true;
            console.log(`TranscriptionService: Started listening in ${this.language} using ${this.currentProviderId}`);
        } catch (e) {
            console.error("TranscriptionService: Failed to start", e);
            if (onError) onError(e.message);
        }
    }

    stop() {
        if (!this.provider) return;
        this.isListening = false;
        this.provider.stop();
    }

    abort() {
        if (!this.provider) return;
        this.provider.abort();
    }

    setMute(muted) {
        this.isMuted = muted;
        if (this.provider) {
            this.provider.setMute(muted);
        }
    }
}
