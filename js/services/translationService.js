import { TranslationProviderFactory } from './translationProviders.js';
import { debugLogger } from '../utils/debugLogger.js';
import { numberToWords } from '../utils/textFormatter.js';
import { toast } from '../components/toastNotification.js';

export class TranslationService {
    constructor() {
        // Default to MyMemory if no setting exists
        this.currentProviderId = localStorage.getItem('translationProvider') || 'mymemory';
    }

    setProvider(providerId) {
        this.currentProviderId = providerId;
        debugLogger.log(`Translation provider switched to: ${providerId}`, 'TRN');
    }

    async translate(text, targetLang, sourceLang = 'en', formatNumbers = false) {
        if (!text) return '';

        // FIX for numbers: User wants "24" to translate to "vierundzwanzig".
        let queryText = text;

        if (formatNumbers) {
            const textWithWords = numberToWords(text, sourceLang);
            if (text !== textWithWords) {
                debugLogger.log(`Number Transformation: "${text}" -> "${textWithWords}"`, 'TRN');
            }
            queryText = textWithWords;
        }

        // Check if text is only numbers/symbols and skip if so (unless formatted)
        // Compromise: If text is *only* numbers, keep raw. 
        if (/^[\d\s.,\-+()]*$/.test(text)) {
            debugLogger.log('Skipping translation for numbers/symbols', 'TRN');
            return text;
        }

        if (sourceLang === targetLang) {
            debugLogger.log(`Translation skipped: Source (${sourceLang}) == Target (${targetLang})`);
            return queryText;
        }

        try {
            const provider = TranslationProviderFactory.getProvider(this.currentProviderId);
            const result = await provider.translate(queryText, targetLang, sourceLang);

            debugLogger.log(`Translated (${this.currentProviderId}): "${queryText}" -> "${result}"`, 'TRN');
            return result;

        } catch (error) {
            console.error("TranslationService failed:", error);
            debugLogger.log(`Translation Exception (${this.currentProviderId}): ${error.message}`, 'ERR');

            // Fallback to MyMemory if the current provider was NOT MyMemory
            if (this.currentProviderId !== 'mymemory') {
                const providerName = this.currentProviderId.charAt(0).toUpperCase() + this.currentProviderId.slice(1);
                toast.warning(`${providerName} failed. Using MyMemory fallback.`);
                debugLogger.log("Attempting fallback to MyMemory...", 'TRN');
                try {
                    const fallbackProvider = TranslationProviderFactory.getProvider('mymemory');
                    const fallbackResult = await fallbackProvider.translate(queryText, targetLang, sourceLang);
                    return fallbackResult;
                } catch (fallbackError) {
                    console.error("Fallback translation failed:", fallbackError);
                    return queryText;
                }
            }

            return queryText;
        }
    }
}
