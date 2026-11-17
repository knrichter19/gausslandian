// todo:
// - does a single '4' or 'd' translate to the same thing as a single '5' or 'e' bc first space coersion?
// - convert arrays to hashes for faster lookup

const minAscii = 32;
const maxAscii = 256;
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
        
        // replace ending spaces if more words follow
        // todo: can I make this a regex?
        if (
            translatedWordGroup.length > 0
            && i < toTranslate.length
            && toTranslate.charAt(i) === " "
            && translatedWordGroup.at(-1) === " "
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
    return fiveLetterGaussToEng(toTranslate);
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
            let newLetterIndex = (currentLetterAscii + (i % 5)) % 16;

            // get Gaussian equivalent
            let currentGaussLetter = gaussAlphabet[newLetterIndex];
            if (currentGaussLetter === ' ' && (i % 5) === 0){
                currentGaussLetter = gaussAlphabet[newLetterIndex +1];
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
        const gaussLetterIndexAdjusted = gaussAlphabet.at(gaussIndex - i); // may wrap around to negatives
        const engOptions = engLookup.get(gaussLetterIndexAdjusted);
        letterGroups.push(engOptions);
        console.log(`gaussLetter: ${gaussLetter}, gaussIndex: ${gaussIndex}, gaussLetterIndexAdjusted: ${gaussLetterIndexAdjusted}, engOptions: ${engOptions}`);
        i++;
    }
    // if last letter is '-', it might be a lingering space, so append the space options to the last letter group
    // todo: does this still apply for the last char in a paren group? like (1234-)?
    
    if (toTranslate.charAt(--i) === '-'){
        letterGroups[i] = letterGroups[i] + getSpaceMultipleOptions(i);
    }
    return letterGroups;
}