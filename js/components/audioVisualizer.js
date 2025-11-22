export class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.source = null;
        this.animationId = null;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.source = this.audioContext.createMediaStreamSource(stream);

            this.source.connect(this.analyser);
            this.analyser.fftSize = 256;

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            this.draw();
        } catch (err) {
            console.error("Error accessing microphone for visualizer:", err);
        }
    }

    stop() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        this.animationId = requestAnimationFrame(this.draw.bind(this));

        this.analyser.getByteFrequencyData(this.dataArray);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = this.dataArray[i] / 2;

            // Gradient color
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#ec4899');
            gradient.addColorStop(1, '#6366f1');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
}
