// todo:
// - does a single '4' or 'd' translate to the same thing as a single '5' or 'e' bc first space coersion?
// - convert arrays to hashes for faster lookup

const minAscii = 32;
const maxAscii = 256;
const maxAsciiStandard = 127;

// gets us displayable ascii characters. minus some ones in the middle. I'll figure those out later

const gaussAlphabet = [
    '-', '+', '=', '/', ' ', '1', '2', '4', '5', '6', '7', '8', '9', ' ', 'x', '!'
]

/* 
Handles English to Gausslandian Translation.
Identifies word groups in the given string and concats their translations,
as well as managing punctuation-dependent trailing space replacement.
*/
export function engToGauss(toTranslate){
    let [i, substrStart]= [0,0];
    let [wordGroup, translatedWordGroup, translation] = ["","",""];
    toTranslate = toTranslate.replace(/\s/g, " "); // normalize spaces. maybe need to change html charset?
    while (i <= toTranslate.length){
        if (i<toTranslate.length && !(' .-'.includes(toTranslate.charAt(i)))){
            // we have yet to reach a word boundary
            i++;
            continue;
        }
        // we have either reached a word boundary or are at the end of the sentence

        wordGroup = toTranslate.substr(substrStart, i-substrStart);
        translatedWordGroup = wordToGauss(wordGroup);
        
        // replace ending spaces unless followed by a period
        // todo: can I make this a regex?
        if (
            translatedWordGroup.length > 0
            && translatedWordGroup.at(-1) === " "
            && (
                (i < toTranslate.length && toTranslate.charAt(i) === " ") ||
                i == toTranslate.length
            )
        ){
            translatedWordGroup = translatedWordGroup.slice(0, -1) + '-';
        }

        translation = translation.concat(translatedWordGroup);
        translation = translation.concat(toTranslate.charAt(i));
        substrStart = ++i;
        translatedWordGroup = "";
    }
    return translation;
}

// UNFINISHED
export function gaussToEng(toTranslate){
    return gaussWordToEng(toTranslate).map((x)=>letterListToString(x));
}

function wordToGauss(toTranslate){
    let translatedString="";
    for (let i=0; i<toTranslate.length; i++){
        // get current letter to translate
        let currentLetter = toTranslate.charAt(i);
        let currentLetterAscii = currentLetter.charCodeAt(0);

        if (currentLetterAscii < minAscii || currentLetterAscii > maxAscii){
            // if the character is outside the convertable ascii range, append a ?
            translatedString=translatedString.concat('?');
        }
        else {
            // adjust index for location in the string
            // i % 5 resets the index shift every 5 letters in a word.
            // % 16 lets us loop the 16-letter gauss alphabet array
            let newLetterIndex = mod(currentLetterAscii + (i % 5), 16);

            // get Gaussian equivalent
            let currentGaussLetter = gaussAlphabet[newLetterIndex];
            if (currentGaussLetter === ' ' && (i % 5) === 0 && toTranslate.length - i < 5){
                currentGaussLetter = gaussAlphabet[mod(newLetterIndex +1,16)];
            }
            translatedString=translatedString.concat(currentGaussLetter);
            console.log(`currentLetter: ${currentLetter}, currentLetterAscii: ${currentLetterAscii}, newLetterIndex: ${newLetterIndex}, currentGaussLetter: ${currentGaussLetter}`);
        }

        // every 5 letters wrap the group in parentheses, add a space
        if ((i + 1) % 5 === 0) {
            translatedString = translatedString.slice(0, -5) + '(' + translatedString.slice(-5) + ') ';
        }
    }
  
  return translatedString;
}


function getEngLetterOptions(originalIndex){
    let letterOpts = [];
    // todo: remove duplicate capitals/lowercase
    // todo: add extended ascii
    for (let i = minAscii + originalIndex; i < maxAsciiStandard; i= i+16){
        // skip unprintable chars if we expand this to non-standard ascii
        if (i==32) continue;
        letterOpts.push(String.fromCharCode(i));
    }
    return letterOpts;
}

function letterListToString(letterOpts){
    return letterOpts.sort((a,b) => sortByCategory(a,b)).join('');
}

function isAsciiLetter(char) {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function sortByCategory(a,b){
    const aCode = a.charCodeAt(0);
    const bCode = b.charCodeAt(0);
    let [aRank, bRank] = [0,0];

    // todo: can make this cleaner
    switch(true){
        case (isAsciiLetter(a)):
            // a-z range
            aRank = 2;
            break;
        case (aCode >= 48 && aCode <= 57):
            // numbers 0-9 range
            aRank = 1;
            break;
        default:
            // punctuation & anything else
            aRank = 0;
    }
    switch(true){
        case (isAsciiLetter(b)):
            bRank = 2;
            break;
        case (bCode >= 48 && bCode <= 57):
            bRank = 1;
            break;
        default:
            bRank = 0;
    }

    // rank higher ranks first
    if (aRank != bRank){
        return bRank-aRank;
    }

    // rank in ascii code order if same rank
    return aCode-bCode;
}

// call this when we see a space,
// since space shows up at two separate locations in the alphabet
// returns options for 1st and 2nd space separately in case we know which one it is
function getSpaceMultipleOptions(i){
    const index1 = gaussAlphabet.indexOf(' ');
    const index2 = gaussAlphabet.indexOf(' ', index1 + 1);
    const option1 = getEngLetterOptions(mod(index1-i, 16));
    const option2 = getEngLetterOptions(mod(index2-i, 16));
    return [option1, option2];
}

// if the first eng letter translates to a gaussian space (4?, d, m, or t),
// the first letter of the gauss translation is coerced to 1 or x.
// if we see that at i=0, use this as a shortcut to get both the standard and coerced options
const firstLetterEngLookup = new Map([
    ['1', [...getEngLetterOptions(gaussAlphabet.indexOf('1')), ...getSpaceMultipleOptions(0)[0]]],
    ['x', [...getEngLetterOptions(gaussAlphabet.indexOf('x')), ...getSpaceMultipleOptions(0)[1]]],
]);

// assumes we have confirmed this is a singular english word
const gaussAlphabetRegex = "-+=/12456789x! ";
// todo: do i need both this and the array above

function gaussWordToEng(toTranslate, followingChar=''){
    // extract all parentheses groups
    const parenthesesRegex = new RegExp(`\\(([${gaussAlphabetRegex}]{5})\\)`, 'g');
    const parenthesesGroups = Array.from(toTranslate.matchAll(parenthesesRegex), m => m[1]);
    console.log(`parens: ${parenthesesGroups}`);

    // extract non-parentheses group
    const trailingRegex = new RegExp(`([${gaussAlphabetRegex.slice(0,-1)}][${gaussAlphabetRegex}]{0,3})$`);    
    const trailingMatch = toTranslate.match(trailingRegex);
    // ignore trailing - on 5-letter words: TODO make this nicer
    const trailing = (trailingMatch && (toTranslate.slice(-2) !== ')-')) ? trailingMatch[1] : null; 
    console.log(`trailing: ${trailing}`) ;
    
    let letterGroups = [];
    for (let i = 0; i<parenthesesGroups.length; i++){
        // todo: make a cache of these translations for repeated words
        letterGroups = [...letterGroups, ...fiveLetterGaussToEng(parenthesesGroups[i], 1, followingChar)];
    }

    if (trailing){
        letterGroups = [...letterGroups, ...fiveLetterGaussToEng(trailing, 0, followingChar)];
    }
    return letterGroups;
}

// lets us mod negative index offsets into positives
function mod(n, d) {
  return ((n % d) + d) % d;
}

// compiles letter group options for a string of 5 or fewer gaussian characters
function fiveLetterGaussToEng(toTranslate, isParentheses=0, followingChar=''){
    let letterGroups=[];
    let i=0;

    // check for special first case on trailing groups
    // where space can be replaced with 1/x
    // TODO: confirm, do parentheses groups start with a space?
    const specialFirstCase = firstLetterEngLookup.get(toTranslate[0]);
    if (!isParentheses && specialFirstCase){
        letterGroups.push(specialFirstCase);
        i++;
    }

    while (i<toTranslate.length){
        const gaussLetter = toTranslate.charAt(i);
        if (gaussLetter === ' '){
            letterGroups.push(getSpaceMultipleOptions(i).flat());
            i++;
            continue;
        }
        const gaussIndex = gaussAlphabet.indexOf(gaussLetter); //todo: make a hash?
        const engOptions = getEngLetterOptions(mod(gaussIndex - i, 16));
        letterGroups.push(engOptions);
        console.log(`gaussLetter: ${gaussLetter}, gaussIndex: ${gaussIndex}, gaussIndexAdjusted: ${mod(gaussIndex-i),16}, engOptions: ${engOptions}`);
        i++;
    }

    // if last letter is '-' on a trailing group, it might be a lingering space,
    // so append the space options to the last letter group
    // This does not apply to parentheses groups and to the last word in a sentence
    
    if (!isParentheses && toTranslate.charAt(-1) === '-' && followingChar != '.'){
        letterGroups[i] = [...letterGroups[i], ...getSpaceMultipleOptions(i).flat()];
    }
    return letterGroups;
}