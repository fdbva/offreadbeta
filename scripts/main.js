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
        .then(reportPerformance);
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
            .then(updateSideBarMenu)    //TODO: not necessary to list and update again
            .then(StartGoogleDrive)
            .then(forceAuthGoogleDrive)
            .then(createAppFolderAsync)
            .then(storyUploadProcess)
            .then(populateSelectOptions)
            .catch((reason) => {
                console.log("inside catch, reason: ", reason);
            })
        .then(reportPerformance);
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
        .then(reportPerformance);
    });
const deleteStoryProcess = (storyId) => {
    deleteStoryDb(storyId);

}
const restoreFromGoogleProcess = () => {
    restoreFromGoogle();
    // flatten resp in arrays of Chapters grouped from same story
    const story1array = [];
    const story2array = [story1array, story2array];
    const arrayOfStories = [];
    //loop arrayOfStories
    let i = 0;
    upsertAllChaptersFromArray(arrayOfStories[i]);
}
