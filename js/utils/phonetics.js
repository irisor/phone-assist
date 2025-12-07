const phoneticAlphabets = {
    'en': {
        'A': 'Ay', 'B': 'Bee', 'C': 'See', 'D': 'Dee', 'E': 'Ee',
        'F': 'Eff', 'G': 'Jee', 'H': 'Aitch', 'I': 'Eye', 'J': 'Jay',
        'K': 'Kay', 'L': 'El', 'M': 'Em', 'N': 'En', 'O': 'Oh',
        'P': 'Pee', 'Q': 'Cue', 'R': 'Ar', 'S': 'Ess', 'T': 'Tee',
        'U': 'You', 'V': 'Vee', 'W': 'Double-U', 'X': 'Ex', 'Y': 'Why', 'Z': 'Zee',
        '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
        '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
    },
    'de': {
        'A': 'Ah', 'B': 'Beh', 'C': 'Tseh', 'D': 'Deh', 'E': 'Eh',
        'F': 'Eff', 'G': 'Geh', 'H': 'Hah', 'I': 'Ihh', 'J': 'Yott',
        'K': 'Kah', 'L': 'Ell', 'M': 'Emm', 'N': 'Enn', 'O': 'Oh',
        'P': 'Peh', 'Q': 'Kuh', 'R': 'Err', 'S': 'Ess', 'T': 'Teh',
        'U': 'Uh', 'V': 'Fow', 'W': 'Veh', 'X': 'Icks', 'Y': 'Ypsilon', 'Z': 'Tsett',
        'Ä': 'Umlaut-Ah', 'Ö': 'Umlaut-Oh', 'Ü': 'Umlaut-Uh', 'ß': 'Ess-Tsett',
        '0': 'Null', '1': 'Eins', '2': 'Zwei', '3': 'Drei', '4': 'Vier',
        '5': 'Fünf', '6': 'Sechs', '7': 'Sieben', '8': 'Acht', '9': 'Neun'
    },
    'fr': { // French
        'A': 'Ah', 'B': 'Bay', 'C': 'Say', 'D': 'Day', 'E': 'Euh',
        'F': 'Eff', 'G': 'Jay', 'H': 'Ash', 'I': 'Ee', 'J': 'Jee',
        'K': 'Kah', 'L': 'Ell', 'M': 'Emm', 'N': 'Enn', 'O': 'Oh',
        'P': 'Pay', 'Q': 'Kuh', 'R': 'Err', 'S': 'Ess', 'T': 'Tay',
        'U': 'Uuh', 'V': 'Vay', 'W': 'Doobleh-Vay', 'X': 'Icks', 'Y': 'Ee-Grec', 'Z': 'Zed',
        '0': 'Zéro', '1': 'Un', '2': 'Deux', '3': 'Trois', '4': 'Quatre',
        '5': 'Cinq', '6': 'Six', '7': 'Sept', '8': 'Huit', '9': 'Neuf'
    },
    'es': { // Spanish
        'A': 'Ah', 'B': 'Beh', 'C': 'Seh', 'D': 'Deh', 'E': 'Eh',
        'F': 'Eff-eh', 'G': 'Heh', 'H': 'Ah-cheh', 'I': 'Ee', 'J': 'Hoh-tah',
        'K': 'Kah', 'L': 'Ell-eh', 'M': 'Emm-eh', 'N': 'Enn-eh', 'Ñ': 'Enn-yeh', 'O': 'Oh',
        'P': 'Peh', 'Q': 'Cuh', 'R': 'Err-eh', 'S': 'Ess-eh', 'T': 'Teh',
        'U': 'Ooh', 'V': 'Ooh-beh', 'W': 'Doble-Uh', 'X': 'Eh-kis', 'Y': 'Ee-grie-gah', 'Z': 'Seh-tah',
        '0': 'Cero', '1': 'Uno', '2': 'Dos', '3': 'Tres', '4': 'Cuatro',
        '5': 'Cinco', '6': 'Seis', '7': 'Siete', '8': 'Ocho', '9': 'Nueve'
    },
    'it': { // Italian
        'A': 'Ah', 'B': 'Bi', 'C': 'Ci', 'D': 'Di', 'E': 'Eh',
        'F': 'Eff-eh', 'G': 'Gi', 'H': 'Acca', 'I': 'Ee', 'J': 'Ee-lunga',
        'K': 'Kappa', 'L': 'Ell-eh', 'M': 'Emm-eh', 'N': 'Enn-eh', 'O': 'Oh',
        'P': 'Pi', 'Q': 'Cu', 'R': 'Err-re', 'S': 'Ess-eh', 'T': 'Ti',
        'U': 'Uh', 'V': 'Vu', 'W': 'Doppia-Vu', 'X': 'Ics', 'Y': 'Ipsilon', 'Z': 'Zeta',
        '0': 'Zero', '1': 'Uno', '2': 'Due', '3': 'Tre', '4': 'Quattro',
        '5': 'Cinque', '6': 'Sei', '7': 'Sette', '8': 'Otto', '9': 'Nove'
    },
    'he': { // Hebrew Letter Names (in Hebrew script)
        'א': 'אָלֶף', 'ב': 'בֵּית', 'ג': 'גִּימֶל', 'ד': 'דָּלֶת', 'ה': 'הֵא',
        'ו': 'וָו', 'ז': 'זַיִן', 'ח': 'חֵית', 'ט': 'טֵית', 'י': 'יוּד',
        'כ': 'כַּף', 'ך': 'כַּף סוֹפִית', 'ל': 'לָמֶד', 'מ': 'מֵם', 'ם': 'מֵם סוֹפִית',
        'נ': 'נוּן', 'ן': 'נוּן סוֹפִית', 'ס': 'סָמֶךְ', 'ע': 'עַיִן', 'פ': 'פֵּא',
        'ף': 'פֵּא סוֹפִית', 'צ': 'צַדִי', 'ץ': 'צַדִי סוֹפִית', 'ק': 'קוּף', 'ר': 'רֵישׁ',
        'ש': 'שִׁין', 'ת': 'תָּו'
    }
};

const symbolNames = {
    'en': {
        '?': 'Question Mark', '!': 'Exclamation Mark', '.': 'Dot', ',': 'Comma',
        '@': 'At', '#': 'Hash', '$': 'Dollar', '%': 'Percent',
        '&': 'Ampersand', '*': 'Asterisk', '+': 'Plus', '=': 'Equals',
        '-': 'Dash', '/': 'Slash', '\\': 'Backslash',
        "'": 'Apostrophe', "’": 'Apostrophe'
    },
    'de': {
        '?': 'Fragezeichen', '!': 'Ausrufezeichen', '.': 'Punkt', ',': 'Komma',
        '@': 'At-Zeichen', '#': 'Raute', '$': 'Dollar', '%': 'Prozent',
        '&': 'Und-Zeichen', '*': 'Stern', '+': 'Plus', '=': 'Gleich',
        '-': 'Bindestrich', '/': 'Schrägstrich', '\\': 'Rückstrich',
        "'": 'Apostroph', "’": 'Apostroph'
    },
    'fr': {
        '?': 'Point d’interrogation', '!': 'Point d’exclamation', '.': 'Point', ',': 'Virgule',
        '@': 'Arobase', '#': 'Dièse', '-': 'Tiret', '/': 'Slash',
        "'": 'Apostrophe', "’": 'Apostrophe'
    },
    'es': {
        '?': 'Interrogación', '!': 'Exclamación', '.': 'Punto', ',': 'Coma',
        '@': 'Arroba', '#': 'Almohadilla', '-': 'Guión', '/': 'Barra',
        "'": 'Apóstrofe', "’": 'Apóstrofe'
    },
    'it': {
        '?': 'Punto interrogativo', '!': 'Punto esclamativo', '.': 'Punto', ',': 'Virgola',
        '@': 'Chiocciola', '#': 'Cancelletto', '-': 'Trattino', '/': 'Barra',
        "'": 'Apostrofo', "’": 'Apostrofo'
    },
    'he': {
        '?': 'סימן שאלה', '!': 'סימן קריאה', '.': 'נקודה', ',': 'פסיק',
        '@': 'שטרודל', '#': 'סולמית', '$': 'דולר', '%': 'אחוז',
        '&': 'וגם', '*': 'כוכבית', '+': 'פלוס', '=': 'שווה',
        '-': 'מקף', '/': 'לוכסן', '\\': 'לוכסן הפוך',
        '_': 'קו תחתון',
        "'": 'גרש', "’": 'גרש'
    }
};

import { numberToWords } from './textFormatter.js';

export function getPhoneticSpelling(text, lang = 'en') {
    const langCode = lang.split('-')[0].toLowerCase(); // en-US -> en
    const alphabet = phoneticAlphabets[langCode] || phoneticAlphabets['en'];
    const symbols = symbolNames[langCode] || symbolNames['en'];

    // Split into sentences (keeping structure)
    // Regex matches: Any chars that are NOT sentence enders, followed by optional sentence ender.
    const sentences = text.match(/[^.!?]+[.!?]*|/g).filter(s => s.trim().length > 0);

    return sentences.map(sentence => {
        // Group by Words within sentence
        const words = sentence.split(/\s+/).filter(w => w.length > 0);

        const spelledWords = words.map(word => {
            // FIX: Smart Number Handling (Simple & Complex)
            // Matches: Numbers, potentially separated by /, -, ., +
            // Example: "24", "24-26", "3/1", "1+2"
            if (/^[\d\/\-\.\+]+$/.test(word) && /\d/.test(word)) {
                const parts = word.split(/([/\-\.\+])/).filter(p => p.length > 0);

                const pronouncedParts = parts.map(part => {
                    if (/\d+/.test(part)) {
                        return numberToWords(part, langCode);
                    }
                    if (symbols[part]) {
                        // Display symbol name (e.g., "Slash")
                        return symbols[part];
                    }
                    return part;
                });

                // Check if any transformation actually happened (to avoid "1" -> "1")
                // If it looks like speech, show it.
                const pronunciation = pronouncedParts.join(' ');
                return `<span style="opacity:0.7">${word} <span style="font-style:italic">(${pronunciation})</span></span>`;
            }

            return word.toUpperCase().split('').map(char => {
                if (alphabet[char]) {
                    return alphabet[char];
                }
                if (symbols[char]) {
                    return `<span style="opacity:0.7">${char} ${symbols[char]}</span>`;
                }
                return char;
            }).join(' - ');
        });

        // Words on separate lines
        return spelledWords.join('<br>');
    }).join('<br><br>'); // Gap between sentences
}
