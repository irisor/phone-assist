export class TranscriptionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.language = 'de-DE'; // Default partner language

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
        } else {
            console.error('Web Speech API not supported in this browser.');
        }
    }

    setLanguage(lang) {
        this.language = lang;
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }

    start(onResult, onError) {
        if (!this.recognition) return;

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;

        this.recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                const isFinal = event.results[i].isFinal;
                if (this.onResultCallback) {
                    this.onResultCallback(transcript, isFinal);
                }
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Auto-restart if it stops unexpectedly while supposed to be listening
                try {
                    this.recognition.start();
                } catch (e) {
                    console.log("Restarting recognition...");
                }
            }
        };

        this.recognition.lang = this.language;
        this.recognition.start();
        this.isListening = true;
    }

    stop() {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
    }
}
