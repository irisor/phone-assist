import { settingsStore } from '../store/settingsStore.js';

export class SettingsModal {
    constructor(onSave) {
        this.onSave = onSave;
        this.modalElement = null;
        this.isVisible = false;

        // Render immediately so elements exist (fixes race condition if user clicks early)
        this.render();

        // Fetch config asynchronously and update options when ready
        this.init();
    }

    async init() {
        await settingsStore.fetchBackendConfig();
        // Just refresh options now that we have config, structure is already there
        this.populateOptions();
        this.attachEventListeners();
    }

    render() {
        // Create modal structure if it doesn't exist
        if (!document.getElementById('settings-modal')) {
            const modal = document.createElement('div');
            modal.id = 'settings-modal';
            modal.className = 'modal hidden';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Settings</h2>
                    
                    <div class="settings-group">
                        <h3>Translation Provider</h3>
                        <select id="translation-provider-select">
                            <!-- Options populated dynamically -->
                        </select>
                        <p class="help-text">Select which service to use for translating text.</p>
                    </div>

                    <div class="settings-group">
                        <h3>Transcription Provider</h3>
                        <select id="transcription-provider-select">
                            <!-- Options populated dynamically -->
                        </select>
                        <p class="help-text">Select which service to use for speech-to-text.</p>
                    </div>

                    <div class="modal-actions">
                        <button id="save-settings-btn" class="primary-btn">Save Changes</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.modalElement = document.getElementById('settings-modal');
        this.populateOptions();
    }

    populateOptions() {
        const config = settingsStore.getAvailableProviders();
        const output = settingsStore.getSettings();

        // Populate Translation Options
        const transSelect = document.getElementById('translation-provider-select');
        transSelect.innerHTML = '';

        const transOptions = [
            { id: 'mymemory', name: 'MyMemory (Cloud - Free)', available: config?.translation?.mymemory },
            { id: 'google_browser', name: 'Google Translate (Browser - Free)', available: true }, // Always available
            { id: 'google', name: 'Google Translate (Cloud)', available: config?.translation?.google },
            { id: 'deepl', name: 'DeepL Translate (Cloud)', available: config?.translation?.deepl },
            { id: 'libretranslate', name: 'LibreTranslate (Self-Hosted / Local)', available: config?.translation?.libretranslate }
        ];

        transOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.name;
            if (!opt.available) {
                option.disabled = true;
                option.textContent += ' (Not Configured)';
            }
            if (opt.id === output.translationProvider) option.selected = true;
            transSelect.appendChild(option);
        });

        // Populate Transcription Options
        const scribeSelect = document.getElementById('transcription-provider-select');
        scribeSelect.innerHTML = '';

        const scribeOptions = [
            { id: 'webspeech', name: 'Web Speech API (Device Default)', available: config?.transcription?.webSpeech },
            { id: 'whisper', name: 'OpenAI Whisper (Cloud)', available: config?.transcription?.whisper },
            { id: 'assemblyai', name: 'AssemblyAI (Cloud)', available: config?.transcription?.assemblyAi }
        ];

        scribeOptions.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.id;
            option.textContent = opt.name;
            if (!opt.available) {
                option.disabled = true;
                option.textContent += ' (Not Configured)';
            }
            if (opt.id === output.transcriptionProvider) option.selected = true;
            scribeSelect.appendChild(option);
        });
    }

    attachEventListeners() {
        const closeBtn = this.modalElement.querySelector('.close-button');
        const saveBtn = this.modalElement.querySelector('#save-settings-btn');

        closeBtn.onclick = () => this.hide();

        saveBtn.onclick = () => {
            const transProvider = document.getElementById('translation-provider-select').value;
            const scribeProvider = document.getElementById('transcription-provider-select').value;

            settingsStore.saveSettings({
                translationProvider: transProvider,
                transcriptionProvider: scribeProvider
            });

            // Also update localStorage directly for simpler service access
            localStorage.setItem('translationProvider', transProvider);
            localStorage.setItem('transcriptionProvider', scribeProvider);

            if (this.onSave) this.onSave();
            this.hide();
        };

        window.onclick = (event) => {
            if (event.target === this.modalElement) {
                this.hide();
            }
        };
    }

    show() {
        this.populateOptions(); // Refresh availability in case config changed
        this.modalElement.classList.remove('hidden');
        this.isVisible = true;
    }

    hide() {
        this.modalElement.classList.add('hidden');
        this.isVisible = false;
    }
}
