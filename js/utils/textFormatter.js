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

    if (langCode.startsWith('de')) {
        return convertNumberDE(n);
    }
    return convertNumberEN(n);
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
