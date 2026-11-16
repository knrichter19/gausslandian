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
  document.getElementById('translated-text').innerText = engCharacterOptions.join('\n');
}
window.translateToEnglish = translateToEnglish;

function formatEnglishTranslationOptions() {
  const inputText = document.getElementById('input-text').value;
  const translatedOptions = gaussToEng(inputText);
  const optionsContainer = document.getElementById('translation-options');
  optionsContainer.innerHTML = '';
}