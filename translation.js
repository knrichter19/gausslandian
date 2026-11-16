const gaussAlphabet = [ // loops around to the beginning if the index is too high
'+', '=', '/', ' ', '1', '2', '4', '5', '6', '7', '8', '9', ' ', 'x', '!', '-'
]

const engAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

// not sure how to fit these in clearly yet
const specialCasesBaseIndex = new Map([
    ['?', gaussAlphabet.indexOf('!')],
    [',', gaussAlphabet.indexOf('9')],
    ["'", gaussAlphabet.indexOf('4')]
]);

// todo:
// X modulo the newLetterIndex to wrap around the alphabet
// X add () around groups of 5 letters
// ? figure out other punctuation like , ' ?
// - make more efficient by using a dictionary instead of indexOf to find the letter's index

export function engToGauss(toTranslate){
    const wordGroups = toTranslate.toLowerCase().split(' ');
    const translatedGroups = wordGroups.map(group => wordToGauss(group));
    return translatedGroups.join(' ');
}

function wordToGauss(toTranslate){
    let translatedString="";
    for (let i=0; i<toTranslate.length; i++){
        // get current letter to translate
        let currentLetter = toTranslate.charAt(i);
    
        // these characters stay as-is afaik? spaces should be stripped out by now, but just in case
        if (' .'.includes(currentLetter)){
        translatedString=translatedString.concat(currentLetter);
        // todo: figure out how += works with strings in js
        continue;
        }
    
        // get index for the letter
        let alphabetIndex=-1;
    
        if (engAlphabet.includes(currentLetter)){
        // most letters should fall here
        alphabetIndex = engAlphabet.indexOf(currentLetter);
        }
    
        else if ('123456789'.includes(currentLetter)){
        // number indexes are just the number itself. subtract 1 to make 0-indexes. Idk what to do with 0 yet.
        alphabetIndex = currentLetter -1;
        }
        else if (specialCasesBaseIndex.has(currentLetter)){
        // special cases like ? , '
        alphabetIndex = specialCasesBaseIndex.get(currentLetter);
        }
        else{
        // any other characters append a ?
        translatedString=translatedString.concat('?');
        continue;
        }
    
        // adjust index for location in the string
        let newLetterIndex = alphabetIndex+(i % 5);
        newLetterIndex = newLetterIndex % gaussAlphabet.length;
    
        // get Gaussian equivalent
        let currentGaussLetter = gaussAlphabet[newLetterIndex];
        if (currentGaussLetter === ' ' && (i % 5) === 0){
        currentGaussLetter = gaussAlphabet[newLetterIndex +1];
        }
        translatedString=translatedString.concat(currentGaussLetter);

        // every 5 letters wrap the group in parentheses, add a space
        if ((i + 1) % 5 === 0) {
            translatedString = translatedString.slice(0, -5) + '(' + translatedString.slice(-5) + ') ';
        }
    }

    // if the last character is a space, replace it with -
    if (translatedString.endsWith(' ')) {
        translatedString = translatedString.slice(0, -1) + '-';
    }
  
  return translatedString;
}