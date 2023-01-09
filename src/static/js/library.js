const projects = document.getElementById("books-slider");
const nextElem = document.querySelector(".next");
const prevElem = document.querySelector(".prev");
const protocol = "librarynb";


DOMPurify.setConfig({ USE_PROFILES: { html: true }});

function removeBook(projectDir) {
    let book = document.getElementById(projectDir);
    book.remove();
}

function scrollForward() {
    console.log("hello");
    if(projects.scrollLeft != projects.offsetWidth){
        let scrollAmount = projects.offsetWidth / 4;
        projects.scrollLeft += scrollAmount;
    }
}

function scrollBack() {
    if(projects.scrollLeft != 0){
        let scrollAmount = projects.offsetWidth / 4;
        projects.scrollLeft -= scrollAmount;
    }
}

nextElem.addEventListener("click", scrollForward);
prevElem.addEventListener("click", scrollBack);

window.electronAPI.ready();

function MetadataEl(prefix, text) {
    let root = document.createElement("p");
    root.className = "metadata";
    root.innerHTML = DOMPurify.sanitize(prefix + text);
    return root;
}

function BookButton(imgPath, func) {
    let button = document.createElement("button");
    button.className = "book-button";
    button.addEventListener("click", (e) => {
        e.stopPropagation();
        func();
    });

    let img = document.createElement("img");
    img.src = imgPath;
    button.appendChild(img);
    return button;
}

function ButtonBar(buttons) {
    let bar = document.createElement("div");
    bar.className = "button-bar";
    buttons.forEach((button) => {
        bar.appendChild(button);
    });
    return bar;
}

function TitleBar(title) {
    let root = document.createElement("div");
    root.className = "title-bar";
    let titleEl = document.createElement("h2");
    titleEl.innerHTML = DOMPurify.sanitize(title);
    root.appendChild(titleEl);
    return root;
}

function Thumbnail(thumbnailPath) {
    
    if (thumbnailPath) {
        let thumbnailElem = document.createElement("img");
        thumbnailElem.setAttribute("class", "thumbnail");
        thumbnailElem.setAttribute("src", thumbnailPath);
        return thumbnailElem;	
    } else {
        let thumbnailElem = document.createElement("div");
        thumbnailElem.setAttribute("class", "thumbnail");
        let randomColor = Math.floor(Math.random()*16777215).toString(16);
        thumbnailElem.style.backgroundColor = "#" + randomColor;
        return thumbnailElem;
    }
}

function Metadata(props) {
    let el = document.createElement("div");
    el.setAttribute("class", "metadata-container");

    let textCon = document.createElement("div");
    textCon.className = "metadata-text-con";
    
    let titleEl = MetadataEl("", props.title);
    textCon.appendChild(titleEl);
    
    let authorEl = MetadataEl("Author: ", props.author);
    textCon.appendChild(authorEl);

    let descriptionEl = MetadataEl("Description: ", props.description);
    textCon.appendChild(descriptionEl);

    let emailEl = MetadataEl("Email: ", props.email);
    textCon.appendChild(emailEl);

    let copyrightEl = MetadataEl("Copyright: ", props.copyright);
    textCon.appendChild(copyrightEl);

    if (props.logoPath) {
        let logoEl = document.createElement("img");
        logoEl.setAttribute("src", props.logoPath);
        textCon.appendChild(logoEl);
    }

    el.appendChild(textCon);

    let gitUrl = "https:/" + props.launchUrl;
    let buttons = [
        BookButton("../images/rocket-launch-icon.svg", () => {
            window.electronAPI.launchBook(protocol + ":/" + props.launchUrl);
        }),
        BookButton("../images/folder-icon.svg", () => {
            window.electronAPI.showFolder(props.projectDir);
            console.log(props.projectDir);
        }),
        BookButton("../images/github-mark.svg", () => {
            window.electronAPI.openRepo(gitUrl);
        }),
        BookButton("../images/delete-icon.svg", async () => {
            const result = await window.electronAPI.deleteBook(props.projectDir);
            if(result) {
                removeBook(props.projectDir);
            }
        })
    ];
    console.log(buttons);
    el.appendChild(ButtonBar(buttons));
   
    return el;
}

function BookCover(title, thumbnailPath, logoPath) {
    let root = document.createElement("div");
    root.className = "book-cover";
    let thumbnail = Thumbnail(thumbnailPath);
    root.appendChild(thumbnail);

    root.appendChild(TitleBar(title));
    return root;
}

function BookEl(props) {
    let el = document.createElement("div");
    el.setAttribute("class", "book");
    el.setAttribute("id", props.projectDir);
    
    let bookCover = BookCover(props.title, props.thumbnailPath, props.logoPath);
    el.appendChild(bookCover);

    let metadata = Metadata(props);
    el.appendChild(metadata);
    
    return el;
}

window.electronAPI.loadBooks((_event, books) => {
    for (let i in books) {
        console.log(books[i]);
        projects.appendChild(BookEl(books[i]));
    }

    let links = document.querySelectorAll("a");
    links.forEach((link) => {
        link.setAttribute("target", "_blank");
    });

    
});
