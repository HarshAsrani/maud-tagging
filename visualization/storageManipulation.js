function setStorage(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function updateStorage(xpaths, texts, highlighted_xpaths, sTexts, tagged_sequence){
    setStorage('xpaths', xpaths);
    setStorage('texts', texts);
    setStorage('highlighted_xpaths', highlighted_xpaths)
    setStorage('highlighted_segmented_text', sTexts)
    setStorage('tagged_sequence', tagged_sequence)
}

function getStorage(){
    texts = JSON.parse(sessionStorage.getItem('texts'));
    sTexts = JSON.parse(sessionStorage.getItem('highlighted_segmented_text'));
    highlighted_xpaths = JSON.parse(sessionStorage.getItem('highlighted_xpaths'));
    xpaths = JSON.parse(sessionStorage.getItem('xpaths'));
    tagged_sequence = JSON.parse(sessionStorage.getItem('tagged_sequence'));
    return [xpaths, texts, highlighted_xpaths, sTexts, tagged_sequence]
}