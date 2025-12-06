export class AudioVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        // No canvas context needed for CSS visualizer
    }

    async start() {
        // CSS Visualizer: Just add the active class to start animation
        if (this.container) {
            this.container.classList.add('active');
        }
    }

    stop() {
        // CSS Visualizer: Remove active class
        if (this.container) {
            this.container.classList.remove('active');
        }
    }
}
