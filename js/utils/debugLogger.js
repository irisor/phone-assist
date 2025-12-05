export const debugLogger = {
    container: null,

    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'debug-log-overlay';
        this.container.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 9999;
            padding: 10px;
            pointer-events: none; /* Let clicks pass through */
            display: none; /* Hidden by default, toggled by user */
        `;
        document.body.appendChild(this.container);

        // Add a toggle button
        const btn = document.createElement('button');
        btn.textContent = "🐞";
        btn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            z-index: 10000;
            background: #333;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
        `;
        btn.onclick = () => {
            this.container.style.display = this.container.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(btn);
    },

    log(message) {
        if (!this.container) this.init();
        const line = document.createElement('div');
        line.textContent = `[LOG] ${message}`;
        line.style.borderBottom = '1px solid #333';
        this.container.appendChild(line);
        this.container.scrollTop = this.container.scrollHeight;
        console.log(message);
    },

    error(message) {
        if (!this.container) this.init();
        const line = document.createElement('div');
        line.textContent = `[ERR] ${message}`;
        line.style.color = '#ff4444';
        this.container.appendChild(line);
        this.container.scrollTop = this.container.scrollHeight;
        console.error(message);
    }
};
