import { engToGauss } from './translation.js';

function translateFromBox() {
  const inputText = document.getElementById('input-text').value;
  const translatedText = engToGauss(inputText);
  document.getElementById('translated-text').innerText = translatedText;
}
window.translateFromBox = translateFromBox;