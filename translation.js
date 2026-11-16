// todo:
// ? figure out logic for other punctuation like , ' ?
// - what does '0' map to?
// - does a single '4' or 'd' translate to the same thing as a single '5' or 'e' bc first space coersion?
// - 5-letter words: sometimes don't have a trailing -? like 'jonas'. maybe depends if there are following words?
// - make more efficient by using a dictionary instead of indexOf to find the letter's index

const gaussAlphabet = [ // loops around to the beginning if the index is too high
'+', '=', '/', ' ', '1', '2', '4', '5', '6', '7', '8', '9', ' ', 'x', '!', '-'
]

const engAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

// not sure how to fit these in cleanly yet
const specialCasesBaseIndex = new Map([
    ['!', gaussAlphabet.indexOf('+')],
    ["'", gaussAlphabet.indexOf('4')],
    [',', gaussAlphabet.indexOf('9')],
    ['?', gaussAlphabet.indexOf('!')],
]);

export function engToGauss(toTranslate){
    const wordGroups = toTranslate.toLowerCase().split(' ');
    const translatedGroups = wordGroups.map(group => wordToGauss(group));
    return translatedGroups.join(' ');
}

// UNFINISHED
export function gaussToEng(toTranslate){
    return fiveLetterGaussToEng(toTranslate);
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

const engLookup = new Map([
    ['+', '1aq!'],
    ['=', '2br'],
    ['/', '3cs'],
    [' ', '4dtm'],
    ['1', '5eu'],
    ['2', '6fv'],
    ['4', "7gw'"],
    ['5', '8hx'],
    ['6', '9iy'],
    ['7', 'jz'],
    ['8', 'k'],
    ['9', ',l'],
    ['x', 'n'],
    ['!', 'o?'],
    ['-', 'p'],
]);

// if the first eng letter translates to a gaussian space (4?, d, m, or t),
// the first letter of the gauss translation is coerced to 1 or x.
// if we see that at i=0, use this as a shortcut to get both the standard and coerced options
const firstLetterEngLookup = new Map([
    ['1', '14detu'],
    ['x', 'mn'],
]);

// call this when we see a space in the middle of a word,
// since space shows up at two separate locations in the alphabet
function getSpaceMultipleOptions(i){
    const index1 = gaussAlphabet.indexOf(' ');
    const index2 = gaussAlphabet.indexOf(' ', index1 + 1);
    const newLetter1 = gaussAlphabet[index1 - i];
    const newLetter2 = gaussAlphabet[index2 - i];
    const option1 = engLookup.get(newLetter1);
    const option2 = engLookup.get(newLetter2);
    return option1 + option2;
}

function fiveLetterGaussToEng(toTranslate){
    let letterGroups=[];
    let i=0;

    // check for special first case
    const specialFirstCase = firstLetterEngLookup.get(toTranslate[0]);
    if (specialFirstCase){
        letterGroups.push(specialFirstCase);
        i++;
    }

    while (i<toTranslate.length){
        const gaussLetter = toTranslate.charAt(i);
        if (gaussLetter === ' '){
            letterGroups.push(getSpaceMultipleOptions(i));
            i++;
            continue;
        }
        const gaussIndex = gaussAlphabet.indexOf(gaussLetter); //todo: make a hash?
        const gaussLetterIndexAdjusted = gaussAlphabet[gaussIndex - i]; // may wrap around to negatives
        const engOptions = engLookup.get(gaussLetterIndexAdjusted);
        letterGroups.push(engOptions);
        i++;
    }
    // if last letter is '-', it might be a lingering space, so append the space options to the last letter group
    // todo: does this still apply for the last char in a paren group? like (1234-)?
    if (toTranslate.charAt(--i) === '-'){
        letterGroups[i] = letterGroups[i] + getSpaceMultipleOptions(i);
    }
    return letterGroups;
}