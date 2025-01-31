const voiceSelect = document.querySelector("#voiceSelect");
const playButton = document.querySelector("#playbutton");
const textInput = document.querySelector("textarea");
const languageSelect = document.querySelector("#languageSelect")

// Array of supported languages
const languages = [
    {code: 'en', name: 'English'},
    {code: 'es', name: 'Spanish'},
    {code: 'fr', name: 'French'},
    {code: 'de', name: 'German'},
    {code: 'ja', name: 'Japanese'},
    {code: 'zh-CN', name: 'Chinese (Simplified)'}
];

// Populate language select box
languages.forEach(({code, name}) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = name;
    languageSelect.appendChild(option)
})

// Load voices
let voices = [];
function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = voices.map((voice, index) => {
        return `<option value="${index}">${voice.name} (${voice.lang})</option>`
    }).join('');
}

// Trigger loading voices when available
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// Translate text with serverless function
async function translateText(text, targetLang) {
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                target: targetLang
            })
        });

        if (!response.ok){
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        return data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Translation Error: ', error);
        alert('Failed to Translate text')
        return text;
    }
}

// TTS
function playText(text, voiceIndex) {
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[voiceIndex]){
        utterance.voice = voices[voiceIndex]
    }
    speechSynthesis.speak(utterance);
}

// Play TTS
playButton.addEventListener('click', async () => {
    const text = textInput.value.trim();
    const targetLang = languageSelect.value;
    const voiceSelectedIndex = voiceSelect.value;

    if (!text) {
        alert('Please enter text');
        return;
    }
    
    try {
        // Translate
        const translatedText = await translateText(text, targetLang);
        // Play Text
        playText(translatedText, voiceSelectedIndex)
    } catch (error) {
        console.error('Error during processing: ', error);
        alert('Unexpected error')
    }
})