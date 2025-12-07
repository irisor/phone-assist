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

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">×</button>
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => this.remove(toast);

        // Add to container
        this.container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-dismiss
        if (duration > 0) {
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
    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    warning(message, duration = 7000) {
        return this.show(message, 'warning', duration);
    }

    error(message, duration = 10000) {
        return this.show(message, 'error', duration);
    }
}

// Create singleton instance
export const toast = new ToastNotification();
