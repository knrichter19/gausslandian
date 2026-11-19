import { engToGauss, gaussToEng } from './translation.js';

function translateToGauss() {
  const inputText = document.getElementById('input-text').value;
  const translatedText = engToGauss(inputText);
  document.getElementById('translated-text').innerText = translatedText;
}
window.translateToGauss = translateToGauss;

function translateToEnglish() {
  const inputText = document.getElementById('input-text').value;
  const engCharacterOptions = gaussToEng(inputText);
  console.log(engCharacterOptions);
  if (!engCharacterOptions.length){
    document.getElementById('translated-text').innerText = 'Not able to translate (check your spelling?)'
  } else {
    document.getElementById('translated-text').innerText = engCharacterOptions.join('\n');
  }
}
window.translateToEnglish = translateToEnglish;