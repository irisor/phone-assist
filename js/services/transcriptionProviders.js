class TranscriptionProvider {
    constructor() {
        this.onResult = null;
        this.onError = null;
        this.onSpeechStart = null;
        this.onSpeechEnd = null;
        this.language = 'de-DE';
        this.isMuted = false;
    }

    setLanguage(lang) { this.language = lang; }
    setMute(muted) { this.isMuted = muted; }

    start(onResult, onError, onSpeechStart, onSpeechEnd) {
        this.onResult = onResult;
        this.onError = onError;
        this.onSpeechStart = onSpeechStart;
        this.onSpeechEnd = onSpeechEnd;
    }

    stop() { }
    abort() { }
}

export class WebSpeechProvider extends TranscriptionProvider {
    constructor() {
        super();
        this.recognition = null;
        this.isListening = false;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.setupListeners();
        }
    }

    setupListeners() {
        if (!this.recognition) return;

        this.recognition.onspeechstart = () => this.onSpeechStart?.();
        this.recognition.onspeechend = () => this.onSpeechEnd?.();

        this.recognition.onresult = (event) => {
            if (this.isMuted) return;
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                const isFinal = event.results[i].isFinal;
                this.onResult?.(transcript, isFinal);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('WebSpeech error:', event.error);
            this.onError?.(event.error);
        };

        this.recognition.onend = () => {
            if (this.isListening && !this.isMuted) {
                try { this.recognition.start(); } catch (e) { }
            }
        };
    }

    setLanguage(lang) {
        super.setLanguage(lang);
        if (this.recognition) this.recognition.lang = lang;
    }

    start(onResult, onError, onSpeechStart, onSpeechEnd) {
        if (!this.recognition) {
            onError?.('browser-not-supported');
            return;
        }
        super.start(onResult, onError, onSpeechStart, onSpeechEnd);
        this.recognition.lang = this.language;
        try {
            this.recognition.start();
            this.isListening = true;
        } catch (e) {
            onError?.(e.message);
        }
    }

    stop() {
        this.isListening = false;
        this.recognition?.stop();
    }

    abort() {
        this.recognition?.abort();
    }
}

export class WhisperProvider extends TranscriptionProvider {
    constructor() {
        super();
        this.mediaRecorder = null;
        this.stream = null;
        this.isRecording = false;
        this.chunkInterval = null;
    }

    async start(onResult, onError, onSpeechStart, onSpeechEnd) {
        super.start(onResult, onError, onSpeechStart, onSpeechEnd);
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // OpenAI Whisper API takes files, not streams. 
            // We need to record chunks and send them.
            // Using a simple strategy: record 5-second chunks (or on silence if we had VAD)
            // For this implementation, we'll try a time-based chunking

            this.startRecording();
            this.isRecording = true;
            this.onSpeechStart?.(); // Simulate speech start since mic is open

        } catch (err) {
            this.onError?.('mic-access-denied');
        }
    }

    startRecording() {
        this.mediaRecorder = new MediaRecorder(this.stream);
        let audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
            if (this.isMuted || audioChunks.length === 0) return;

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Chrome records webm
            audioChunks = []; // Reset for next chunk

            // Send to backend
            this.sendToBackend(audioBlob);
        };

        this.mediaRecorder.start();

        // Restart recorder every 5 seconds to capture phrases
        // This is a naive implementation; real-time Whisper is complex without VAD
        this.chunkInterval = setInterval(() => {
            if (this.isRecording && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                this.mediaRecorder.start();
            }
        }, 5000);
    }

    async sendToBackend(blob) {
        try {
            const formData = new FormData();
            formData.append('file', blob, 'recording.webm');
            formData.append('language', this.language.split('-')[0]); // ISO code

            // Query parameter selects provider
            const response = await fetch('/api/transcribe?provider=whisper', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Transcription failed');

            const data = await response.json();
            if (data.text?.trim()) {
                this.onResult?.(data.text, true); // Whisper results are always "final" per chunk
            }
        } catch (e) {
            console.error('Whisper transcription error', e);
        }
    }

    stop() {
        this.isRecording = false;
        clearInterval(this.chunkInterval);
        this.mediaRecorder?.stop();
        this.stream?.getTracks().forEach(track => track.stop());
        this.onSpeechEnd?.();
    }
}

export class AssemblyAIProvider extends TranscriptionProvider {
    constructor() {
        super();
        this.socket = null;
        this.recorder = null;
        this.stream = null;
    }

    async start(onResult, onError, onSpeechStart, onSpeechEnd) {
        super.start(onResult, onError, onSpeechStart, onSpeechEnd);

        try {
            // Get ephemeral token from backend
            const response = await fetch('/api/transcribe?provider=assemblyai', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to get auth token');
            const { token } = await response.json();

            // Connect to WebSocket with token
            // V3 Universal Streaming Endpoint with raw PCM encoding
            // Corrected speech_model to universal-streaming-multilingual (was multi, causing 3005 error)
            // Added language_detection=true (required for multilingual model)
            this.socket = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&encoding=pcm_s16le&speech_model=universal-streaming-multilingual&language_detection=true&token=${token}`);

            this.socket.onopen = async () => {
                console.log('AssemblyAI WebSocket connected');
                this.onSpeechStart?.();
                this.startRecording();
            };

            this.socket.onmessage = (message) => {
                if (this.isMuted) return;
                const data = JSON.parse(message.data);
                // console.log('AssemblyAI Message:', data.type); // Uncomment for verbose logs

                if (data.type === 'Turn') {
                    // V3 Universal Streaming "Turn" object
                    // utterance: complete text including partials (use for real-time display)
                    // transcript: finalized text only
                    const text = data.utterance || data.transcript;
                    const isFinal = data.end_of_turn;

                    // console.log('AssemblyAI Transcribed:', text, isFinal); 
                    if (text) {
                        this.onResult?.(text, isFinal);
                    }
                } else if (data.type === 'SessionBegins') {
                    console.log('AssemblyAI Session ID:', data.id);
                } else if (data.type === 'Terminated') {
                    console.log('AssemblyAI Session Terminated');
                } else {
                    console.log('AssemblyAI Received:', data);
                }
            };

            this.socket.onerror = (err) => {
                console.error('AssemblyAI WebSocket error', err);
                this.onError?.('websocket-error');
            };

            this.socket.onclose = (event) => {
                console.log('AssemblyAI WebSocket closed', event.code, event.reason);
            };

        } catch (e) {
            this.onError?.(e.message);
        }
    }

    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            console.log('AudioContext Sample Rate:', audioContext.sampleRate);

            // Inline AudioWorklet Processor for raw PCM conversation
            // Buffers audio to meet AssemblyAI's min duration requirement (50ms)
            // 4096 samples @ 16000Hz = 256ms (well within 50-1000ms range)
            const workletCode = `
                class PCMProcessor extends AudioWorkletProcessor {
                    constructor() {
                        super();
                        this.bufferSize = 4096;
                        this.buffer = new Int16Array(this.bufferSize);
                        this.bytesWritten = 0;
                    }

                    process(inputs, outputs, parameters) {
                        const input = inputs[0];
                        if (input && input.length > 0) {
                            const inputChannel = input[0];
                            
                            for (let i = 0; i < inputChannel.length; i++) {
                                // Convert float32 (-1.0 to 1.0) to int16
                                const s = Math.max(-1, Math.min(1, inputChannel[i]));
                                this.buffer[this.bytesWritten++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                                
                                // Send when buffer is full
                                if (this.bytesWritten >= this.bufferSize) {
                                    this.port.postMessage(this.buffer.buffer, [this.buffer.buffer]);
                                    // Create new buffer (cannot reuse transferred buffer)
                                    this.buffer = new Int16Array(this.bufferSize);
                                    this.bytesWritten = 0;
                                }
                            }
                        }
                        return true;
                    }
                }
                registerProcessor('pcm-processor', PCMProcessor);
            `;

            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);

            await audioContext.audioWorklet.addModule(url);

            const source = audioContext.createMediaStreamSource(this.stream);
            const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

            source.connect(workletNode);
            workletNode.connect(audioContext.destination);

            let firstBufferSent = false;

            workletNode.port.onmessage = (event) => {
                if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
                if (this.isMuted) return;

                // event.data is the ArrayBuffer from the worklet
                this.socket.send(event.data);

                if (!firstBufferSent) {
                    console.log('AssemblyAI: First audio buffer sent');
                    firstBufferSent = true;
                }
            };

            this.recorder = { workletNode, source, audioContext, url };
        } catch (err) {
            console.error('Failed to start recording:', err);
            this.onError?.('mic-access-denied');
        }
    }

    stop() {
        if (this.socket) {
            this.socket.close();
        }
        if (this.recorder) {
            this.recorder.source.disconnect();
            this.recorder.workletNode.disconnect();
            this.recorder.audioContext.close();
            URL.revokeObjectURL(this.recorder.url); // Cleanup blob URL
            this.recorder = null;
        }
        this.stream?.getTracks().forEach(track => track.stop());
        this.onSpeechEnd?.();
    }
}

export const TranscriptionProviderFactory = {
    getProvider(providerId) {
        switch (providerId) {
            case 'whisper': return new WhisperProvider();
            case 'assemblyai': return new AssemblyAIProvider();
            case 'webspeech':
            default:
                return new WebSpeechProvider();
        }
    }
};
