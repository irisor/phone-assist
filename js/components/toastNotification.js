export class ToastNotification {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', duration = 5000, actions = []) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        const actionsHTML = actions.length > 0
            ? `<div class="toast-actions">
                ${actions.map((action, index) =>
                `<button class="toast-action-btn toast-action-${index}" data-action="${index}">${action.label}</button>`
            ).join('')}
               </div>`
            : '';

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-content">
                <span class="toast-message">${message}</span>
                ${actionsHTML}
            </div>
            <button class="toast-close" aria-label="Close">×</button>
        `;

        // Action button handlers
        if (actions.length > 0) {
            actions.forEach((action, index) => {
                const btn = toast.querySelector(`[data-action="${index}"]`);
                btn.onclick = () => {
                    if (action.onClick) {
                        action.onClick();
                    }
                    this.remove(toast);
                };
            });
        }

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => this.remove(toast);

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-dismiss (disabled if actions present)
        if (duration > 0 && actions.length === 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    }

    remove(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300); // Match CSS transition duration
    }

    // Convenience methods
    info(message, duration = 5000, actions = []) {
        return this.show(message, 'info', duration, actions);
    }

    success(message, duration = 5000, actions = []) {
        return this.show(message, 'success', duration, actions);
    }

    warning(message, duration = 7000, actions = []) {
        return this.show(message, 'warning', duration, actions);
    }

    error(message, duration = 10000, actions = []) {
        return this.show(message, 'error', duration, actions);
    }
}

// Create singleton instance
export const toast = new ToastNotification();
