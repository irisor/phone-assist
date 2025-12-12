class SettingsStore {
    constructor() {
        this.STORAGE_KEY = 'phone_assist_settings';
        this.settings = this.loadSettings();
        this.backendConfig = null;
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : this.getDefaults();
        } catch (e) {
            console.error('Failed to load settings', e);
            return this.getDefaults();
        }
    }

    getDefaults() {
        return {
            translationProvider: 'mymemory',
            transcriptionProvider: 'webspeech'
        };
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));

        // Notify any listeners if we added an observer pattern later
        // For now, services pull directly or are updated by app.js
    }

    getSettings() {
        return this.settings;
    }

    async fetchBackendConfig() {
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                this.backendConfig = await response.json();
            } else {
                console.warn('Failed to fetch backend config, using defaults');
                this.backendConfig = {
                    translation: { mymemory: true, libretranslate: false },
                    transcription: { webSpeech: true }
                };
            }
        } catch (error) {
            console.warn('Backend config fetch failed', error);
            // Fallback for purely local/offline mode without backend
            this.backendConfig = {
                translation: { mymemory: true, libretranslate: false },
                transcription: { webSpeech: true }
            };
        }
        return this.backendConfig;
    }

    getAvailableProviders() {
        return this.backendConfig;
    }
}

export const settingsStore = new SettingsStore();
