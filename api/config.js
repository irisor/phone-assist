export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check which providers are configured based on environment variables
    const config = {
        translation: {
            mymemory: true, // Always available (client-side)
            libretranslate: !!(process.env.LIBRETRANSLATE_URL && process.env.LIBRETRANSLATE_API_KEY), // Requires both URL and Key
            google: !!process.env.GOOGLE_TRANSLATE_API_KEY,
            deepl: !!process.env.DEEPL_API_KEY,
        },
        transcription: {
            webSpeech: true, // Always available (browser API)
            whisper: !!process.env.OPENAI_API_KEY,
            assemblyAi: !!process.env.ASSEMBLYAI_API_KEY,
        }
    };

    // Return configuration to frontend
    res.status(200).json(config);
}
