export const debugLogger = {
    container: null,
    version: "v1.2-" + new Date().toLocaleTimeString(), // Dynamic version based on load time
    logCounter: 0,

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
            background: rgba(0, 0, 0, 0.9);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 9999;
            padding: 10px;
            pointer-events: auto; /* Allow scrolling and selection */
            display: none; /* Hidden by default, toggled by user */
            border-top: 2px solid #333;
        `;

        // Header with Version
        const header = document.createElement('div');
        header.style.cssText = "border-bottom: 1px solid #555; padding-bottom: 5px; margin-bottom: 5px; color: #fff; font-weight: bold;";
        header.textContent = `Debug Log [${this.version}]`;
        this.container.appendChild(header);

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
            box-shadow: 0 2px 5px rgba(0,0,0,0.5);
        `;
        btn.onclick = () => {
            this.container.style.display = this.container.style.display === 'none' ? 'block' : 'none';
        };
        document.body.appendChild(btn);

        // Override global console
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            originalLog.apply(console, args);
            this.appendLog('LOG', args.join(' '));
        };

        console.error = (...args) => {
            originalError.apply(console, args);
            this.appendLog('ERR', args.join(' '));
        };
    },

    appendLog(type, message) {
        if (!this.container) return;

        this.logCounter++;
        const code = this.logCounter.toString().padStart(3, '0'); // 001, 002...

        const line = document.createElement('div');
        line.innerHTML = `<span style="color: #888; margin-right: 5px;">#${code}</span> <span style="font-weight:bold">[${type}]</span> ${message}`;

        if (type === 'ERR') line.style.color = '#ff4444';
        if (type === 'LOG') line.style.borderBottom = '1px solid #222';

        this.container.appendChild(line);
        this.container.scrollTop = this.container.scrollHeight;
    },

    log(message) {
        console.log(message); // Will trigger the override
    },

    error(message) {
        console.error(message); // Will trigger the override
    }
};
