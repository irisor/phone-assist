import { formatForSpeech } from '../utils/textFormatter.js';
import { debugLogger } from '../utils/debugLogger.js';

export class TranslationService {
    constructor() {
        // In a real app, this would be an API key or endpoint
    }

    async translate(text, sourceLang, targetLang, shouldFormat = false) {
        // OPTIMIZATION: If original text is only numbers, spaces, or punctuation, do NOT translate.
        // This fixes "1 2 3" -> "g'suffa" (API weirdness)
        if (/^[\d\s.,\-+()]*$/.test(text)) {
            debugLogger.log(`Translation skipped: Number/Symbol detected "${text}"`);
            return text;
        }

        // 1. Format for speech (Numbers -> Words, Special Chars) ONLY if requested (User text)
        let textToTranslate = text;
        if (shouldFormat) {
            textToTranslate = formatForSpeech(text, sourceLang);
        }

        if (sourceLang === targetLang) {
            debugLogger.log(`Translation skipped: Source (${sourceLang}) == Target (${targetLang})`);
            return textToTranslate;
        }

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
            debugLogger.log(`API Response: ${JSON.stringify(data)}`);

            if (data.responseStatus === 200) {
                let result = data.responseData.translatedText;

                // Helper to normalize text (remove punctuation, spaces, lowercase)
                const normalize = (str) => str.toLowerCase().replace(/[?!.,\s]/g, '');

                // FIX: Fuzzy check for identical text (ignoring punctuation like "?")
                if (normalize(result) === normalize(textToTranslate) && data.matches) {
                    debugLogger.log("Top match was identical (fuzzy). Searching alternatives...");
                    for (const match of data.matches) {
                        if (match.translation &&
                            normalize(match.translation) !== normalize(textToTranslate)) {
                            debugLogger.log(`Found better match: "${match.translation}"`);
                            result = match.translation;
                            break;
                        }
                    }
                }

                return result;
            } else {
                debugLogger.log(`Translation API Error: ${data.responseDetails}`);
                console.warn("Translation API warning:", data.responseDetails);
                // Fallback: return original text so conversation isn't disrupted
                return textToTranslate;
            }
        } catch (error) {
            console.error("Translation failed:", error);
            if (error.name === 'AbortError') {
                debugLogger.log("Translation timed out");
            } else {
                debugLogger.log(`Translation Exception: ${error.message}`);
            }
            // Fallback: return original text
            return textToTranslate;
        }
    }
}
// pseudoTranslate removed as we are using real API
