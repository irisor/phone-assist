import { numberToWords } from '../utils/textFormatter.js';

export class TranslationService {
    constructor() {
        // In a real app, this would be an API key or endpoint
    }

    async translate(text, sourceLang, targetLang) {
        // 1. Convert numbers to words (User requirement)
        // Pass sourceLang so we convert "123" to "einhundert..." if source is DE
        const textWithWords = numberToWords(text, sourceLang);

        if (sourceLang === targetLang) return textWithWords;

        // 2. REAL TRANSLATION API (MyMemory)
        // Free tier: 5000 chars/day.
        try {
            // Format language pair: "en|de"
            const langPair = `${sourceLang.split('-')[0]}|${targetLang.split('-')[0]}`;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textWithWords)}&langpair=${langPair}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.responseStatus === 200) {
                return data.responseData.translatedText;
            } else {
                console.warn("Translation API warning:", data.responseDetails);
                // Fallback if API limit reached or error
                return `[API Error] ${textWithWords}`;
            }
        } catch (error) {
            console.error("Translation failed:", error);
            return `[Offline] ${textWithWords}`;
        }
    }

    // pseudoTranslate removed as we are using real API
}
