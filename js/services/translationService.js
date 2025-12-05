import { formatForSpeech } from '../utils/textFormatter.js';

export class TranslationService {
    constructor() {
        // In a real app, this would be an API key or endpoint
    }

    async translate(text, sourceLang, targetLang, shouldFormat = false) {
        // 1. Format for speech (Numbers -> Words, Special Chars) ONLY if requested (User text)
        let textToTranslate = text;

        if (shouldFormat) {
            textToTranslate = formatForSpeech(text, sourceLang);
        }

        if (sourceLang === targetLang) return textToTranslate;

        // 2. REAL TRANSLATION API (MyMemory)
        // Free tier: 5000 chars/day.
        try {
            // Format language pair: "en|de"
            const langPair = `${sourceLang.split('-')[0]}|${targetLang.split('-')[0]}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${langPair}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.responseStatus === 200) {
                return data.responseData.translatedText;
            } else {
                console.warn("Translation API warning:", data.responseDetails);
                // Fallback if API limit reached or error
                return `[API Error] ${textToTranslate}`;
            }
        } catch (error) {
            console.error("Translation failed:", error);
            if (error.name === 'AbortError') {
                return `[Timeout] ${textToTranslate}`;
            }
            return `[Offline] ${textToTranslate}`;
        }
    }

    // pseudoTranslate removed as we are using real API
}
