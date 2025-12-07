export function numberToWords(text, lang = 'en') {
    // Simple regex replacer for common numbers. 
    return text.replace(/\b\d+\b/g, (match) => {
        const num = parseInt(match, 10);
        if (isNaN(num)) return match;
        return convertNumber(num, lang);
    });
}

function convertNumber(n, lang) {
    // Ensure lang is a string and lower case
    const langCode = (lang || 'en').toLowerCase();

    if (langCode.startsWith('de')) return convertNumberDE(n);
    if (langCode.startsWith('fr')) return convertNumberFR(n);
    if (langCode.startsWith('es')) return convertNumberES(n);
    if (langCode.startsWith('it')) return convertNumberIT(n);
    if (langCode.startsWith('he')) return convertNumberHE(n);
    if (langCode.startsWith('en')) return convertNumberEN(n);
    return n.toString(); // Fallback
}

function convertNumberEN(n) {
    if (n < 0) return "minus " + convertNumberEN(-n);
    if (n == 0) return "zero";

    const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

    if (n < 20) return ones[n];

    if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? "-" + ones[n % 10] : "");
    }

    if (n < 1000) {
        return ones[Math.floor(n / 100)] + " hundred" + (n % 100 ? " " + convertNumberEN(n % 100) : "");
    }

    return n.toString(); // Fallback
}

function convertNumberDE(n) {
    if (n < 0) return "minus " + convertNumberDE(-n);
    if (n == 0) return "null";

    const ones = ["", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
    const tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"];

    if (n < 20) return ones[n];

    if (n < 100) {
        // German says "one-and-twenty" (einundzwanzig)
        if (n % 10 === 0) return tens[n / 10];
        const one = n % 10;
        const ten = Math.floor(n / 10);
        const oneStr = (one === 1 ? "ein" : ones[one]); // "ein" instead of "eins" in compound
        return oneStr + "und" + tens[ten];
    }

    if (n < 1000) {
        const hundred = Math.floor(n / 100);
        const rest = n % 100;
        const hundredStr = (hundred === 1 ? "ein" : ones[hundred]) + "hundert";
        return hundredStr + (rest ? convertNumberDE(rest) : "");
    }

    return n.toString();
}

function convertNumberFR(n) {
    if (n < 0) return "moins " + convertNumberFR(-n);
    if (n == 0) return "zéro";
    const ones = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];

    if (n < 20) return ones[n];

    if (n < 70) {
        return tens[Math.floor(n / 10)] + (n % 10 ? (n % 10 === 1 ? "-et-un" : "-" + ones[n % 10]) : "");
    }
    if (n < 80) { // 70-79
        return "soixante-" + (n === 71 ? "et-onze" : ones[n - 60]);
    }
    if (n < 100) { // 80-99
        if (n < 90) return "quatre-vingt" + (n === 80 ? "s" : "-" + ones[n - 80]);
        return "quatre-vingt-" + ones[n - 80];
    }
    if (n < 1000) {
        if (n === 100) return "cent";
        const hundreds = Math.floor(n / 100);
        return (hundreds > 1 ? ones[hundreds] + "-cent" : "cent") + (n % 100 ? " " + convertNumberFR(n % 100) : "");
    }
    return n.toString();
}

function convertNumberES(n) {
    if (n < 0) return "menos " + convertNumberES(-n);
    if (n == 0) return "cero";
    const ones = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];

    if (n < 20) return ones[n];
    if (n < 30) return "veinti" + ones[n - 20]; // veintiuno

    if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " y " + ones[n % 10] : "");
    }
    if (n < 1000) {
        if (n === 100) return "cien"; // exact 100
        const hundredsMap = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
        return hundredsMap[Math.floor(n / 100)] + (n % 100 ? " " + convertNumberES(n % 100) : "");
    }
    return n.toString();
}

function convertNumberIT(n) {
    if (n < 0) return "meno " + convertNumberIT(-n);
    if (n == 0) return "zero";
    const ones = ["", "uno", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci", "undici", "dodici", "tredici", "quattordici", "quindici", "sedici", "diciassette", "diciotto", "diciannove"];
    const tens = ["", "", "venti", "trenta", "quaranta", "cinquanta", "sessanta", "settanta", "ottanta", "novanta"];

    if (n < 20) return ones[n];

    if (n < 100) {
        let ten = tens[Math.floor(n / 10)];
        let one = ones[n % 10];
        // Vowel drop: venti + uno -> ventuno
        if (one && (one.startsWith('u') || one.startsWith('o'))) {
            ten = ten.slice(0, -1);
        }
        return ten + one;
    }
    if (n < 1000) {
        let hundred = "cento";
        if (Math.floor(n / 100) > 1) {
            hundred = convertNumberIT(Math.floor(n / 100)) + "cento";
        }
        return hundred + (n % 100 ? convertNumberIT(n % 100) : "");
    }
    return n.toString();
}

function convertNumberHE(n) {
    // Feminine counting (default for abstract numbers) - Using Hebrew Script
    if (n < 0) return "מינוס " + convertNumberHE(-n);
    if (n == 0) return "אפס";

    // 0-19
    const ones = ["", "אחת", "שתיים", "שלוש", "ארבע", "חמש", "שש", "שבע", "שמונה", "תשע", "עשר",
        "אחת עשרה", "שתים עשרה", "שלוש עשרה", "ארבע עשרה", "חמש עשרה", "שש עשרה", "שבע עשרה", "שמונה עשרה", "תשע עשרה"];

    // 20-90
    const tens = ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"];

    if (n < 20) return ones[n];

    if (n < 100) {
        // "Esrim ve-achat" -> "עשרים ואחת"
        return tens[Math.floor(n / 10)] + (n % 10 ? " ו" + ones[n % 10] : "");
    }
    if (n < 1000) {
        const hundreds = ["", "מאה", "מאתיים", "שלוש מאות", "ארבע מאות", "חמש מאות", "שש מאות", "שבע מאות", "שמונה מאות", "תשע מאות"];
        return hundreds[Math.floor(n / 100)] + (n % 100 ? " " + convertNumberHE(n % 100) : "");
    }
    return n.toString();
}

export function formatForSpeech(text, lang = 'en') {
    let formatted = text;

    // 1. Convert Special Characters to universal English names
    // Rule: "Data" symbols (/, @, #) -> Words. "Grammar" symbols (?, !) -> Keep as symbols.
    const specialChars = {
        '&': ' ampersand ',
        '%': ' percent ',
        '+': ' plus ',
        '-': ' minus ',
        '=': ' equals ',
        '*': ' asterisk ',
        '/': ' slash ',
        '\\': ' backslash ',
        '@': ' at ',
        '#': ' hash ',
        '$': ' dollar ',
        '€': ' euro ',
        '£': ' pound ',
        '¥': ' yen ',
        '_': ' underscore ',
        '|': ' pipe ',
        '~': ' tilde ',
        '^': ' caret ',
        '<': ' less than ',
        '>': ' greater than '
        // Removed: ? ! . , ( ) [ ] { } : ; ' " (Grammar punctuation stays as symbols)
    };

    // Replace special chars
    for (const [char, replacement] of Object.entries(specialChars)) {
        // Escape special regex characters
        const escapedChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedChar, 'g');
        formatted = formatted.replace(regex, replacement);
    }

    // 2. Convert Numbers to words (language-aware)
    formatted = numberToWords(formatted, lang);

    // 3. Cleanup multiple spaces
    return formatted.replace(/\s+/g, ' ').trim();
}
