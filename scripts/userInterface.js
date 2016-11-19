/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

function displayScreen(currentDisplay) {
    const offreader = document.querySelector(".offreader");
    const home = document.querySelector(".home");
    const about = document.querySelector(".about");
    offreader.style.display = "none";
    home.style.display = "none";
    about.style.display = "none";

    if (currentDisplay === "about")
        about.style.display = "block";
    else if (currentDisplay === "home")
        home.style.display = "block";
    else {
        offreader.style.display = "block";
        setTimeout(function(){
            getCurrentChapter();
        }, 1000);
    }
}

function disableButtons() {
    btnScrape.disabled = true;
    btnScrapeAndDrive.disabled = true;
    btnRestore.disabled = true;
    //const btns = document.getElementsByClassName("angka"); //change to delete story class button
    //for (let i = 0; i < elems.length; i++) {
    //    btns[i].disabled = true;
    //}
};
function enableButtons() {
    btnScrape.disabled = false;
    btnScrapeAndDrive.disabled = false;
    btnRestore.disabled = false;
    //const btns = document.getElementsByClassName("angka"); //change to delete story class button
    //for (let i = 0; i < elems.length; i++) {
    //    btns[i].disabled = true;
    //}
};

function toggleSideBar() {
    const sidebar = document.querySelector(".sidebar");
    const navToggle = document.querySelector(".nav-toggle");

    navToggle.classList.toggle("active");
    const style = window.getComputedStyle(sidebar);
    sidebar.style.display = style.display === "none" ? "block" : "none";
}

function populateSelectOptions() {
    const promise = new Promise(function (resolve, reject) {
        const select = document.querySelectorAll(".chapters-select");

        select[0].innerHTML = "";
        select[1].innerHTML = "";

        const optionHtml = document.createDocumentFragment(),
            optionHtml2 = document.createDocumentFragment();
        for (let i = 1; i <= Story.chapters; i++) {
            optionHtml.appendChild(new Option(`Chapter: ${i}`, i));
            optionHtml2.appendChild(new Option(`Chapter: ${i}`, i));
        }

        select[0].appendChild(optionHtml);
        select[1].appendChild(optionHtml2);

        function changeFn(e) {
            console.log(this.value);
            goToChapter(this.value);
            e.preventDefault();
            window.scrollTo(0, 0);
        };

        select[0].addEventListener("change", changeFn)
        select[1].addEventListener("change", changeFn)

        resolve()
    });
    return promise;
}

function closeMobileSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const navToggle = document.querySelector(".nav-toggle");

    if (navToggle.classList.contains("active")) {
        navToggle.classList.remove("active");
        sidebar.style.display = "none";
    }
}

function goToChapter(chapter) {
    Story.currentChapter = Number.parseInt(chapter);
    updateNav();
    getCurrentChapter();
}

function getCurrentChapter() {
    if (!Number.isInteger(Story.currentChapter)) {
        console.error("It's not a FUCKING NUMBER!");
    }
    const nextStoryPath = Story.id + "." + Story.currentChapter;
    console.log("getCurrentChapter", nextStoryPath);
    getChapter(nextStoryPath);
}

function changeToNextChapter(e) {
    const next = document.querySelector(".next");
    if (next.classList.contains("disable"))
        return;

    Story.currentChapter += 1;
    getCurrentChapter();
    updateNav();
    e.preventDefault();
}

function changeToPreviousChapter(e) {
    const prev = document.querySelector(".prev");
    if (prev.classList.contains("disable"))
        return;

    if (Story.currentChapter > 1) {
        Story.currentChapter -= 1;
        getCurrentChapter();
        updateNav();
    }
    e.preventDefault();
}


function updateNav() {
    const chaptersSelect = document.querySelectorAll(".chapters-select");
    chaptersSelect[0].selectedIndex = Story.currentChapter - 1;
    chaptersSelect[1].selectedIndex = Story.currentChapter - 1;

    if (Story.currentChapter > 1) {
        previousChapterLink[0].classList.remove("disable");
        previousChapterLink[1].classList.remove("disable");

        if (Story.currentChapter == Story.chapters) {
            nextChapterLink[0].classList.add("disable");
            nextChapterLink[1].classList.add("disable");
        } else {
            nextChapterLink[0].classList.remove("disable");
            nextChapterLink[1].classList.remove("disable");
        }
    } else if (Story.currentChapter === 1) {
        previousChapterLink[0].classList.add("disable");
        previousChapterLink[1].classList.add("disable");
        if (Story.chapters > 1) {
            nextChapterLink[0].classList.remove("disable");
            nextChapterLink[1].classList.remove("disable");
        }
    }
}

function updateSideBarMenu() {
    const promise = new Promise((resolve, reject) => {
        var data = that.sidebarMenu;
        const strList = document.querySelector(".sidebar-list");
        strList.innerHTML = "";
        data.forEach(function(obj, i) {
            strList.insertAdjacentHTML("beforeend",
                `
        <a href="#" class="sidebar-list--item story-sel" data-story="${i}" title="${obj.storyName}">
            <span class="sidebar-list--text">${obj.storyName} - ${obj.totalOfChapters} chapters</span>
        </a>`);
        });

        const storySelector = document.querySelectorAll(".story-sel");
        for (let i = storySelector.length - 1; i >= 0; i--) {
            storySelector[i].addEventListener("click",
                function(e) {
                    console.log(this);
                    console.log(this.dataset.story);
                    const s = this.dataset.story;
                    console.log(data[s]);
                    Story.name = data[s].storyName;
                    Story.id = data[s].chapterId.split(".")[0];
                    Story.chapters = data[s].totalOfChapters;
                    chaptersTotal.textContent = Story.chapters;
                    title.textContent = Story.name;
                    Story.currentChapter = 1;

                    closeMobileSidebar();
                    getCurrentChapter();
                    updateNav();
                    populateSelectOptions();
                    displayScreen();
                });
        };
        window.performance.mark('endUpdateSideBarMenu');
        resolve();
    });
    return promise;
}