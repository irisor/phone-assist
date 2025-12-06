export class TranscriptionService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isMuted = false; // New flag
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

    start(onResult, onError, onSpeechStart, onSpeechEnd) {
        if (!this.recognition) {
            console.error("TranscriptionService: No recognition object available.");
            if (onError) onError("browser-not-supported");
            return;
        }

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;

        // Speech detection events for visualizer
        this.recognition.onspeechstart = () => {
            console.log("TranscriptionService: Speech started");
            if (onSpeechStart) onSpeechStart();
        };

        this.recognition.onspeechend = () => {
            console.log("TranscriptionService: Speech ended");
            if (onSpeechEnd) onSpeechEnd();
        };

        this.recognition.onresult = (event) => {
            if (this.isMuted) return; // Ignore if muted

            let hasResults = false;
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                const isFinal = event.results[i].isFinal;
                hasResults = true;
                console.log(`Transcription result: "${transcript}" (Final: ${isFinal})`);
                if (this.onResultCallback) {
                    this.onResultCallback(transcript, isFinal);
                }
            }
            if (!hasResults) {
                console.log("TranscriptionService: onresult fired but no results found.");
            }
        };

        this.recognition.onnomatch = (event) => {
            console.log("TranscriptionService: No match found.");
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            if (this.onErrorCallback) this.onErrorCallback(event.error);
        };

        this.recognition.onend = () => {
            console.log("TranscriptionService: Recognition ended.");
            if (this.isListening && !this.isMuted) {
                // Auto-restart if it stops unexpectedly while supposed to be listening
                console.log("TranscriptionService: Auto-restarting...");
                try {
                    this.recognition.start();
                } catch (e) {
                    console.log("TranscriptionService: Restart failed", e);
                }
            }
        };

        this.recognition.lang = this.language;
        try {
            this.recognition.start();
            this.isListening = true;
            console.log(`TranscriptionService: Started listening in ${this.language}`);
        } catch (e) {
            console.error("TranscriptionService: Failed to start", e);
            if (this.onErrorCallback) this.onErrorCallback(e.message);
        }
    }

    stop() {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
    }

    abort() {
        if (!this.recognition) return;
        // abort() stops immediately and does not fire 'end' event in some browsers, or fires it differently.
        // We want to drop current buffer.
        this.recognition.abort();
    }

    setMute(muted) {
        this.isMuted = muted;
    }
}
