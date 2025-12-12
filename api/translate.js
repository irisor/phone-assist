export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, targetLang, sourceLang, provider } = req.body;

    if (!text || !targetLang || !provider) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        let translatedText = '';

        switch (provider) {
            case 'google':
                translatedText = await translateGoogle(text, targetLang, sourceLang);
                break;
            case 'deepl':
                translatedText = await translateDeepL(text, targetLang, sourceLang);
                break;
            case 'libretranslate':
                translatedText = await translateLibre(text, targetLang, sourceLang);
                break;
            default:
                return res.status(400).json({ error: 'Invalid provider' });
        }

        res.status(200).json({ translatedText });

    } catch (error) {
        console.error(`Translation error (${provider}):`, error);
        res.status(500).json({
            error: 'Translation failed',
            details: error.message
        });
    }
}

async function translateGoogle(text, targetLang, sourceLang) {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) throw new Error('Google Translate API key not configured');

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    // Google expects simple language codes (e.g., 'en', 'de') not 'en-US'
    const target = targetLang.split('-')[0];
    const source = sourceLang ? sourceLang.split('-')[0] : undefined;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            q: text,
            target: target,
            source: source,
            format: 'text'
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Google Translate API error');
    }

    return data.data.translations[0].translatedText;
}

async function translateDeepL(text, targetLang, sourceLang) {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) throw new Error('DeepL API key not configured');

    const host = process.env.DEEPL_API_TYPE === 'pro' ? 'api.deepl.com' : 'api-free.deepl.com';
    const url = `https://${host}/v2/translate`;

    // DeepL supports some full codes like en-US, but mostly 2-letter.
    // Safe bet is to pass valid ISO codes. DeepL is picky about 'en' vs 'en-US'.
    // For simplicity here, we'll try to use the provided code but fallback logic could be added.
    // DeepL 'target_lang' supports 'EN-US', 'DE', etc.
    let target = targetLang.toUpperCase();
    if (target.startsWith('EN') && !target.includes('-')) target = 'EN-US'; // Default to US if generic EN

    const params = new URLSearchParams({
        auth_key: apiKey,
        text: text,
        target_lang: target
    });

    if (sourceLang) {
        params.append('source_lang', sourceLang.split('-')[0].toUpperCase());
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'DeepL API error');
    }

    return data.translations[0].text;
}

async function translateLibre(text, targetLang, sourceLang) {
    const baseUrl = process.env.LIBRETRANSLATE_URL;
    if (!baseUrl) throw new Error('LibreTranslate URL not configured');

    const url = `${baseUrl}/translate`;

    const body = {
        q: text,
        source: sourceLang ? sourceLang.split('-')[0] : 'auto',
        target: targetLang.split('-')[0],
        format: 'text'
    };

    if (process.env.LIBRETRANSLATE_API_KEY) {
        body.api_key = process.env.LIBRETRANSLATE_API_KEY;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'LibreTranslate API error');
    }

    return data.translatedText;
}
