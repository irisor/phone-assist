import { debugLogger } from '../utils/debugLogger.js';

class TranslationProvider {
    async translate(text, targetLang, sourceLang) {
        throw new Error('Method not implemented');
    }
}

export class MyMemoryProvider extends TranslationProvider {
    async translate(text, targetLang, sourceLang = 'en') {
        const langPair = `${sourceLang.split('-')[0]}|${targetLang.split('-')[0]}`;
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.responseStatus === 200) {
                // Fuzzy match improvement logic can stay in the service or move here
                // For now, returning the main translation
                return data.responseData.translatedText;
            } else {
                throw new Error(data.responseDetails || 'MyMemory API Error');
            }
        } catch (error) {
            throw error;
        }
    }
}

class BackendProxyProvider extends TranslationProvider {
    constructor(providerName) {
        super();
        this.providerName = providerName;
    }

    async translate(text, targetLang, sourceLang) {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                targetLang,
                sourceLang,
                provider: this.providerName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || `${this.providerName} translation failed`);
        }

        return data.translatedText;
    }
}

export class GoogleBrowserProvider extends TranslationProvider {
    async translate(text, targetLang, sourceLang = 'auto') {
        const target = targetLang.split('-')[0];
        const source = sourceLang === 'auto' ? 'auto' : sourceLang.split('-')[0];

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data[0]) {
                // Google returns an array of arrays, we need to join the parts
                return data[0].map(part => part[0]).join('');
            } else {
                throw new Error('Invalid response from Google Browser API');
            }
        } catch (error) {
            console.error('Google Browser Translation Error:', error);
            throw new Error('Google Browser API failed');
        }
    }
}

export class GoogleTranslateProvider extends BackendProxyProvider {
    constructor() { super('google'); }
}

export class DeepLProvider extends BackendProxyProvider {
    constructor() { super('deepl'); }
}

export class LibreTranslateProvider extends BackendProxyProvider {
    // LibreTranslate can be self-hosted (frontend direct) or proxied
    // For simplicity/security/CORS, we'll route through backend if configured there
    // But wait, the plan said "client-side OR backend".
    // If we use the public libretranslate.com, we might hit CORS or rate limits.
    // Using our backend proxy allows us to use a custom instance URL defined in env vars.
    constructor() { super('libretranslate'); }
}

export const TranslationProviderFactory = {
    getProvider(providerId) {
        switch (providerId) {
            case 'google': return new GoogleTranslateProvider();
            case 'google_browser': return new GoogleBrowserProvider();
            case 'deepl': return new DeepLProvider();
            case 'libretranslate': return new LibreTranslateProvider();
            case 'mymemory':
            default:
                return new MyMemoryProvider();
        }
    }
};
