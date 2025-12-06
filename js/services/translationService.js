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
            // Hack: Append a full stop to force the API to treat it as a sentence
            // This prevents "1 2 3" -> "7 8 9 10" completion behavior
            const queryText = textToTranslate.trim() + ".";
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=${langPair}`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.responseStatus === 200) {
                let result = data.responseData.translatedText;
                // Remove the trailing dot if we added it and it's still there
                if (result.endsWith('.')) {
                    result = result.slice(0, -1);
                }
                return result;
            } else {
                console.warn("Translation API warning:", data.responseDetails);
                // Fallback: return original text so conversation isn't disrupted
                return textToTranslate;
            }
        } catch (error) {
            console.error("Translation failed:", error);
            if (error.name === 'AbortError') {
                console.warn("Translation timed out");
            }
            // Fallback: return original text
            return textToTranslate;
        }
    }

    // pseudoTranslate removed as we are using real API
}
