const projects = document.getElementById('projects')

window.electronAPI.ready()

function createBook({title, thumbnail, projectDir, author, launchUrl}) {
    book = document.createElement('div');
    book.setAttribute('class', 'book');
    thumbnailElem = document.createElement('div');
    thumbnailElem.setAttribute('class', 'thumbnail');
    if (thumbnail) {
	thumbnailElem.style.backgroundImage=`url('${thumbnail}')`	
    } else {
	let randomColor = Math.floor(Math.random()*16777215).toString(16);
	thumbnailElem.style.backgroundColor = "#" + randomColor
    }
    titleElem = document.createElement('h2')
    titleElem.innerText = title
    book.appendChild(thumbnailElem)
    book.appendChild(titleElem)
    book.addEventListener('click', () => {
	window.electronAPI.launchBook(launchUrl)
    })
    projects.appendChild(book)
}

window.electronAPI.loadBooks((_event, value) => {
    books = value
    for (i in books) {
	createBook(books[i])
    }
})
