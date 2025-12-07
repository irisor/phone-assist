import { formatForSpeech } from '../utils/textFormatter.js';
import { debugLogger } from '../utils/debugLogger.js';
import { numberToWords } from '../utils/textFormatter.js';

export class TranslationService {
    constructor() {
        // In a real app, this would be an API key or endpoint
    }

    async translate(text, targetLang, sourceLang = 'en', formatNumbers = false) {
        if (!text) return '';

        // FIX for numbers: User wants "24" to translate to "vierundzwanzig".
        // Solution: Convert "24" to "twenty-four" (source words) before sending to API.
        // API will then translate "twenty-four" -> "vierundzwanzig".
        // Only works if sourceLang is supported by textFormatter (EN/DE).
        // Only done if formatNumbers is true (User -> Partner direction).
        let queryText = text;

        if (formatNumbers) {
            const textWithWords = numberToWords(text, sourceLang);
            if (text !== textWithWords) {
                debugLogger.log(`Number Transformation: "${text}" -> "${textWithWords}"`, 'TRN');
            }
            queryText = textWithWords;
        }

        // PREVIOUS FIX: "1 2 3" -> "g'suffa" Check (Still valid, but now applied to textWithWords?)
        // If the original text was ONLY numbers/symbols, we might want to skip translation.
        // BUT user specifically asked for "24" -> "vierundzwanzig".
        // Conflict: "1 2 3" -> "g'suffa" vs "24" -> "vierundzwanzig".
        // "1 2 3" converted to "one two three" caused "g'suffa".
        // "24" converted to "twenty-four" causes "vierundzwanzig".

        // Let's refine the "1 2 3" check.
        // If the text is purely digits (like a phone number "555 1234"), maybe we SHOULD keep it as digits (skip translation).
        // But "24" in "I live on 24..." is part of a sentence.

        // Compromise: If text is *only* numbers, keep raw. 
        // If text has words, convert numbers to words.

        // Original check: (skips if only digits/symbols)
        if (/^[\d\s.,\-+()]*$/.test(text)) {
            debugLogger.log('Skipping translation for numbers/symbols', 'TRN');
            return text;
        }

        // The `shouldFormat` parameter was removed, so `formatForSpeech` is no longer called here.
        // If `sourceLang` is the same as `targetLang`, we don't need to call the API.
        if (sourceLang === targetLang) {
            debugLogger.log(`Translation skipped: Source (${sourceLang}) == Target (${targetLang})`);
            return queryText;
        }

        // 2. REAL TRANSLATION API (MyMemory)
        // Free tier: 5000 chars/day.
        try {
            // Format language pair: "en|de"
            const langPair = `${sourceLang.split('-')[0]}|${targetLang.split('-')[0]}`;

            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryText)}&langpair=${langPair}`;

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
                if (normalize(result) === normalize(queryText) && data.matches) {
                    debugLogger.log("Top match was identical (fuzzy). Searching alternatives...");
                    for (const match of data.matches) {
                        if (match.translation &&
                            normalize(match.translation) !== normalize(queryText)) {
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
                return queryText;
            }
        } catch (error) {
            console.error("Translation failed:", error);
            if (error.name === 'AbortError') {
                debugLogger.log("Translation timed out");
            } else {
                debugLogger.log(`Translation Exception: ${error.message}`);
            }
            // Fallback: return original text
            return queryText;
        }
    }
}
// pseudoTranslate removed as we are using real API
