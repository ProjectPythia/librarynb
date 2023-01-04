const text = document.getElementById('text')

window.electronAPI.ready()

window.electronAPI.onUpdateText((_event, value) => {
    text.innerText = text.innerText + value;
    updateScroll(text)
});

function updateScroll(elem){
    elem.scrollTop = elem.scrollHeight;
}
