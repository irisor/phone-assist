import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false, // Disable default parsing to handle multipart/form-data
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Parse query params to determine provider/action
    // Format: /api/transcribe?provider=whisper OR /api/transcribe?provider=assemblyai
    const url = new URL(req.url, `http://${req.headers.host}`);
    const provider = url.searchParams.get('provider');

    if (!provider) {
        return res.status(400).json({ error: 'Missing provider parameter' });
    }

    try {
        if (provider === 'assemblyai') {
            await handleAssemblyAI(req, res);
        } else if (provider === 'whisper') {
            await handleWhisper(req, res);
        } else {
            return res.status(400).json({ error: 'Invalid provider' });
        }
    } catch (error) {
        console.error(`Transcription error (${provider}):`, error);
        res.status(500).json({
            error: 'Transcription failed',
            details: error.message
        });
    }
}

async function handleAssemblyAI(req, res) {
    // For AssemblyAI real-time, we strictly generate a temporary token.
    // The frontend connects directly via WebSocket using this token.
    // This avoids proxying streaming data through a short-lived serverless function.

    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) throw new Error('AssemblyAI API key not configured');

    // V3 Universal Streaming uses GET /v3/token on the STREAMING host (not api.assemblyai.com)
    // Max expires_in_seconds is 600 (10 mins) for temporary tokens.
    const response = await fetch('https://streaming.assemblyai.com/v3/token?expires_in_seconds=480', {
        method: 'GET',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('AssemblyAI Token Error:', text);
        try {
            const data = JSON.parse(text);
            throw new Error(data.error || 'Failed to generate AssemblyAI token');
        } catch (e) {
            throw new Error(`Failed to generate AssemblyAI token: ${text}`);
        }
    }

    const data = await response.json();
    res.status(200).json({ token: data.token });
}

async function handleWhisper(req, res) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    // Parse the incoming multipart form data (audio file)
    const form = formidable({ keepExtensions: true });

    const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve([fields, files]);
        });
    });

    const file = files.file?.[0] || files.file; // Handle array or single file
    if (!file) throw new Error('No audio file provided');

    // CreateFormData for OpenAI
    // Node.js 18+ FormData + Blob interaction
    const fileData = await fs.promises.readFile(file.filepath);
    const blob = new Blob([fileData], { type: file.mimetype });

    const formData = new FormData();
    formData.append('file', blob, file.originalFilename || 'audio.wav');
    formData.append('model', 'whisper-1');
    if (fields.language) formData.append('language', fields.language[0] || fields.language);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
            // Content-Type header is set automatically by fetch with FormData
        },
        body: formData
    });

    const data = await response.json();

    // Cleanup temp file
    try { await fs.promises.unlink(file.filepath); } catch (e) { /* ignore */ }

    if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI Whisper API error');
    }

    res.status(200).json({ text: data.text });
}
