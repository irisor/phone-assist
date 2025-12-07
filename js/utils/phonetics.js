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
        'Ä': 'Ah-Umlaut', 'Ö': 'Oh-Umlaut', 'Ü': 'Uh-Umlaut', 'ß': 'Ess-Tsett',
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
    'he': { // Hebrew Letter Names (Transliterated for pronunciation)
        'א': 'Aleph', 'ב': 'Bet', 'ג': 'Gimel', 'ד': 'Dalet', 'ה': 'Hey',
        'ו': 'Vav', 'ז': 'Zayin', 'ח': 'Het', 'ט': 'Tet', 'י': 'Yud',
        'כ': 'Khaf', 'ך': 'Khaf Sofit', 'ל': 'Lamed', 'מ': 'Mem', 'ם': 'Mem Sofit',
        'נ': 'Nun', 'ן': 'Nun Sofit', 'ס': 'Samekh', 'ע': 'Ayin', 'פ': 'Pey',
        'ף': 'Pey Sofit', 'צ': 'Tsadi', 'ץ': 'Tsadi Sofit', 'ק': 'Kuf', 'ר': 'Resh',
        'ש': 'Shin', 'ת': 'Tav'
    },
    // Fallback for others to English Letter Names
};

export function getPhoneticSpelling(text, lang = 'en') {
    const langCode = lang.split('-')[0].toLowerCase(); // en-US -> en
    const alphabet = phoneticAlphabets[langCode] || phoneticAlphabets['en'];

    return text.toUpperCase().split('').map(char => {
        if (alphabet[char]) {
            return alphabet[char];
        }
        if (char === ' ') return '[Space]';
        return char;
    }).join(' - ');
}
