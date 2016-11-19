/*eslint-env browser, parsedInput */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

document.addEventListener("DOMContentLoaded", (event) => {
    openDb()
        .then(getListOfStoriesInDb)
        .then(updateSideBarMenu)
        .catch((reason) => {
            console.log("DOMContentLoaded catch, reason: ", reason);
        })
        .then(() => {
            console.groupEnd("pageStart");
            window.performance.clearMarks();
        })
        .finally(() => {
            enableButtons();
        });
});
//btnScrape.addEventListener("click", StartScrap);
aboutbtn.addEventListener("click", displayScreen.bind(this, "about"));
homebtn.addEventListener("click", displayScreen.bind(this, "home"));
mobileNav.addEventListener("click", toggleSideBar.bind(this));

nextChapterLink[0].addEventListener("click", changeToNextChapter.bind(this));
previousChapterLink[0].addEventListener("click", changeToPreviousChapter.bind(this));
nextChapterLink[1].addEventListener("click", changeToNextChapter.bind(this));
previousChapterLink[1].addEventListener("click", changeToPreviousChapter.bind(this));

inputScrape.addEventListener("focus", (e) => {
    this.value = "";
}); //optionally clear on 'beforepaste'

//ScrapeButtonStarter();
btnScrape.addEventListener("click",
    () => {
        ScrapeButtonStarter()
            .then(getStoryInfo)
            .then(parseStoryInfo)
            .then(buildChapterPromises)
            .then(getAllChapters)
            .then(upsertAllChaptersFromArray)
            .then(getListOfStoriesInDb) //TODO: only disable loader gif? still need to create/enable gif
            .then(updateSideBarMenu) //TODO: not necessary to list and update again
            .then(populateSelectOptions)
            .catch((reason) => {
                console.log("inside catch, reason: ", reason);
            })
            .then(reportPerformance)
            .finally(() => {
                enableButtons();
            });;
    });
btnScrapeAndDrive.addEventListener("click",
    () => {
        ScrapeButtonStarter()
            .then(getStoryInfo)
            .then(parseStoryInfo)
            .then(buildChapterPromises)
            .then(getAllChapters)
            .then(upsertAllChaptersFromArray)
            .then(getListOfStoriesInDb) //TODO: only disable loader gif? still need to create/enable gif
            .then(updateSideBarMenu) //TODO: not necessary to list and update again
            .then(StartGoogleDrive)
            .then(forceAuthGoogleDrive)
            .then(createAppFolderAsync)
            .then(storyUploadProcess)
            .then(populateSelectOptions)
            .catch((reason) => {
                console.log("inside catch, reason: ", reason);
            })
            .then(reportPerformance)
            .finally(() => {
                enableButtons();
            });
    });

btnRestore.addEventListener("click",
    () => {
        StartGoogleDrive()
            .then(forceAuthGoogleDrive)
            .then(createAppFolderAsync)
            .then(restoreFromGoogle)
            .catch((reason) => {
                console.log("inside catch, reason: ", reason);
            })
            .then(reportPerformance)
            .finally(() => {
                enableButtons();
            });;
    });

const deleteStoryProcess = (storyId) => {
    console.log("enter deleteStoryProcess", storyId);
    globalDeleteStoryId = storyId;
    deleteStoryDb(storyId);
    StartGoogleDrive()
        .then(checkAuthGoogleDrive)
        .then(deleteStoryGd)
        .catch((reason) => {
            console.log("inside catch, reason: ", reason);
        });

};
