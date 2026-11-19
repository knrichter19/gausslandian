# Gausslandian
Gausslandian Translator for the game Stip

## How To Use

Hosted at https://knrichter19.github.io/gausslandian/ 

Detailed instructions TBD.

For Gausslandian -> English: The same Gausslandian character can match multiple English characters, so each line returns the possible character options for each character of the original word. Read top to bottom and pick out the letters from each group that make the most sense, until I can make this more readable.

## Status
Development in-progress.

MVP TODO:

Rules checks:
- Does the first space in a parentheses group also get replaced with 1/x?
- Are ? and ! in a 5-letter word treated as the end of a sentence (for - appending behavior?)
- Is a hyphenated word treated as two words? What happens with the -?
- Are double spaces allowed? In both parentheses and not? What about at the end of a sentence?

Eng to Gauss:
- Verify extended ascii mapping for accented characters

Gauss to Eng:
- Display output of Gauss->English character options more readably (ex, output all permutations)

- Verify both translations against most in-game texts


Target TODO:
- Support translating multiple Gaussian words at the same time (human-parsed into words first)
- Larger input box
- Enter submits input
- Add CSS
- Add instructions/info on live page
- Detect invalid Gausslandian syntax
- Support translating full Gausslandian sentences to English (automatic word parsing)
- Display output of Gauss->English word options more readably (ex, multiple ways to break up 1-2 letter character chunks into words)
- Misc code efficiency improvements


Stretch Goal TODO:
- Ranking system for most likely Gauss->English translations
- Fancy UI, more QOL improvements
- Automated tests


# How Does Gausslandian language work? (WIP)

## Gausslandian Character Conversion

The Gausslandian language contains 16 characters, with a repeated space character:
[ TODO ]

Starting with A='1', we can loop over these through the alphabet

### Character Conversion Exceptions

This translator only supports ascii characters 32-126. Other ascii characters have not appeared in the game, to be able to verify their translation.

Periods and spaces (and dashes?) are not converted to Gausslandian characters. (This makes it ambiguous to tell if a space is pre-existing or translated, though...)
Example: "Hello World." => "(52x!/)- (4- !5) ."

When the first letter of a word is one of the two space characters, the letter is replaced with the next letter in the Gausslandian character set.
Example: 'WORD' => ' ORD' => 'WORD'.

When a word ends with a space character, the space is replaced with a '-', unless the space is the last character in a 5-character parenthesis group or the last word in a sentence.
Examples: 
"CAR" -> "/= " -> "/=-"
"PILLARS." -> "(-7x!1) = ."
"SLEEP" -> "(/ 45 )"

## Gausslandian Syntax

### Special characters

Special characters like commas and exclamation points are treated as part of the word they are attached to.

### Parentheses

Gausslandian words are split into 5-character groups. Each 5-character group is wrapped in parentheses.

For example:
"Jonas" => "(7-- 4)"
"Market" => "(x= x6) 1"

If a word has exactly 5 characters:
1. If it is a stand-alone word or a word at the end of a sentence: It stays as-translated above.
2. If there are other words following this word in a sentence: Append a '-' directly after the closing parenthesis.