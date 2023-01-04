const condaPrefixBtn = document.getElementById('conda-prefix-btn')
const condaPrefixElement = document.getElementById('conda-prefix')
const repoDirBtn = document.getElementById('repo-dir-btn')
const repoDirElement = document.getElementById('repo-dir')
const saveBtn = document.getElementById('save')
const condaProgram = document.getElementById('conda-program');

condaPrefixBtn.addEventListener('click', async () => {
  const filePath = await window.electronAPI.selectDir()
  condaPrefixElement.innerText = filePath
})

repoDirBtn.addEventListener('click', async () => {
  const filePath = await window.electronAPI.selectDir()
  repoDirElement.innerText = filePath
})

saveBtn.addEventListener('click', function() {
    let config = {
	condaProgram: condaProgram.value,
	condaPrefix: condaPrefixElement.innerText,
	repoDir: repoDirElement.innerText
    } 
    window.electronAPI.save(config)
});

window.electronAPI.onDisplayErrors((_event, errors) => {
  console.log(errors);
});
