/*eslint-env browser */
/*eslint no-var: "error"*/
/*eslint prefer-const: "error"*/
/*eslint-env es6*/

const StartGoogleDrive = () => {
    const promise = new Promise((resolve, reject) => {
        disableButtons();
        console.groupCollapsed("Google Drive");
        console.log("StartGoogleDrive");
        loadInitialGoogleScript().then(()=>resolve());
    });
    return promise;
};
function loadInitialGoogleScript() {
    return new Promise(function(resolve, reject) {
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://apis.google.com/js/client.js";
        script.onreadystatechange = script.onload = function() {
            //setTimeout(function() { resolve() }, 3000);
            resolve();
        };
        head.appendChild(script);
    });
}

function checkAuthGoogleDrive() {
    return new Promise((resolve, reject) => {
        authGoogleDriveRequest(true, false)
            .then((response) => {
                if (response && !response.error) {
                    // Access token has been successfully retrieved, requests can be sent to the API.
                    //loadDriveApi().then((response) => { resolve(response) });
                    resolve(response);
                } else {
                    reject("authGoogleDriveRequest else, reject");
                }
            });
    });
};

function forceAuthGoogleDrive(data) {
    console.log(gapi);
    return new Promise((resolve, reject) => {
        console.log("authGoogleDriveRequest before auth");
        authGoogleDriveRequest(false, true)
            .then((response) => {
                console.log("authGoogleDriveRequest INSIDE");
                resolve(response);
                //const authButton = document.getElementById("authorizeButton");
                //authButton.style.display = "none";
                //if (response === "loadGapiWait") resolve();
                //if (response && !response.error) {
                //    // Access token has been successfully retrieved, requests can be sent to the API.
                //    authButton.style.display = "none";
                //    loadDriveApi().then((response) => { resolve(response) });
                //} else {
                //    // No access token could be retrieved, show the button to start the authorization flow.
                //    console.log("authResult need authorization click");
                //    authButton.style.display = "block";
                //    authButton.onclick = () => {
                //        authGoogleDriveRequest(false, true);
                //    };
                //};
            });
    });
};

function authGoogleDriveRequest(immediate, force) {
    return new Promise((resolve, reject) => {
        try {
            console.log("immediate: ", immediate);
            console.log("CLIENT_ID: ", CLIENT_ID);
            console.log("SCOPES: ", SCOPES);
            gapi.auth.authorize(
                { 'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false },
                undefined)
            .then((response) => {
                console.log("gapi.auth.authorize .then()");
                if (response && !response.error) {
                    console.log("gapi.auth.authorize .then() in if");
                    loadDriveApi().then((response) => { resolve(response) });
                } else {
                    resolve(response);
                }
            });
            console.log("not catch");
        } catch (e) {
            console.log("gapiAuthorizeError: ",e);
            setTimeout(function() {
                console.log("calling self: ");
                authGoogleDriveRequest(immediate, force).then((resp) => { 
                    console.log("loadGapiWait: ", resp);
                    resolve("loadGapiWait: ");
                });},
                400);
        } 
        
    });
};

function loadDriveApi() {
    const promise = new Promise((resolve, reject) => {
        gapi.client.load("drive", "v2", undefined).then((response) => {
            console.log("loadDriveApi");
            resolve(response);
        });
    });
    return promise;
};

function createAppFolderAsync(resp) {
    const promise = new Promise((resolve, reject) => {
        window.performance.mark('startStartGoogleDriveToCreateAppFolder');
        try {
            gapi.client.drive.files.list(
                {
                    'q': "mimeType = 'application/vnd.google-apps.folder' and title = 'offread' and trashed = false"
                }).then((response) => {
                    console.log("createAppFolderAsync");//, response: ", response);
                    if (response.result.items.length === 0) {
                        console.log("CRIAR");
                        resolve(createAppFolderAsyncHelper());
                    } else {
                        globalAppFolderGoogleId = response.result.items[0].id;
                        window.performance.mark('endStartGoogleDriveToCreateAppFolder');
                        resolve();
                    }
                });
        } catch (e) {
            console.log("gapiAuthorizeError: ",e);
            setTimeout(function() {
                console.log("calling self: ");
                createAppFolderAsync(resp).then((resp) => { 
                    console.log("createAppFolderAsync: ", resp);
                    resolve(resp);
                });},
                400);
        } 
    });
    return promise;
};

function createAppFolderAsyncHelper(resp) {
    const promise = new Promise((resolve, reject) => {
        const data = new Object();
        data.title = "offread";
        data.mimeType = "application/vnd.google-apps.folder";
        gapi.client.drive.files.insert({ 'resource': data }).execute((fileList) => {
            globalAppFolderGoogleId = fileList.id;
            console.log(fileList);
            window.performance.mark('endStartGoogleDriveToCreateAppFolder');
            resolve();
        });
    });
    return promise;
};

function storyUploadProcess(resp) {
    const promise = new Promise((resolve, reject) => {
        window.performance.mark('startUploadStory');
        gapi.client.drive.files.list(
            {
                'q': "mimeType = 'application/json' and title = '" + that.scrape.parsedInput.storyId + "' and trashed = false"
            }).then((response) => {
                console.log("storyUploadProcess", response);
                if (response.result.items.length !== 0) {
                    deleteFileById(response.result.items[0].id)
                        .then((resp) => {
                            console.log("deleteFileById, resp", resp);
                            uploadStory(that.chaptersArray, globalAppFolderGoogleId).then((resp) => {resolve(resp);});
                        });
                } else {
                    uploadStory(that.chaptersArray, globalAppFolderGoogleId).then((resp) => {resolve(resp);});
                }
            });
    });
    return promise;
};

function uploadStory(storyObject, appFolderGoogleId) {
    storyObject = that.chaptersArray;
    appFolderGoogleId = globalAppFolderGoogleId;
    const promise = new Promise((resolve, reject) => {
        if (!storyObject) {
            console.log("uploadStory !chapterObject", storyObject);
        }
        if (!appFolderGoogleId) {
            console.log("uploadStory !storyFolderGoogleId", appFolderGoogleId);
        }
        console.info(`Uploading story ${storyObject[0].storyName} to Google Drive...`);
        const boundary = "-------314159265358979323846264";
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const contentType = "application/json";
        const metadata = {
            'title': that.scrape.parsedInput.storyId,
            'mimeType': contentType,
            "parents": [{ "id": appFolderGoogleId }]
        };
        window.performance.mark('startPakoDeflateStory');
        const jsonObj = JSON.stringify(storyObject);
        const deflatedObj = pako.deflate(jsonObj, { to: 'string' });
        console.log("estimated file size (length*1.5): ", deflatedObj.length*1.5);
        console.log("estimated file size without compression (length*1): ", jsonObj.length);
        window.performance.mark('endPakoDeflateStory');

        const multipartRequestBody =
            delimiter +
                "Content-Type: application/json\r\n\r\n" +
                JSON.stringify(metadata) +
                delimiter +
                "Content-Type: " +
                contentType +
                "\r\n\r\n" +
                deflatedObj +
                close_delim;
        const request = gapi.client.request({
            'path': "/upload/drive/v2/files",
            'method': "POST",
            'params': { 'uploadType': "multipart" },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        request.execute((arg) => {
            window.performance.mark('endUploadStory');
            console.info(`File size reported by google: `, arg.fileSize);
            console.info(`Story ${storyObject[0].storyName} uploaded to Google Drive. arg: `, arg);
            console.groupEnd("Google Drive");
            resolve();
        });
    });
    return promise;
};

function deleteFileById(fileId) {
    const promise = new Promise((resolve, reject) => {
        gapi.client.drive.files.delete({
            'fileId': fileId
        }).execute((resp) => {
            console.log(`File ${fileId} deleted from Google Drive`);
            resolve();
        });
    });
    return promise;
};

function deleteStoryGd() {
    console.log("enter deleteStoryGd", globalDeleteStoryId);
    const promise = new Promise((resolve, reject) => {
        console.log("deleteStoryGd pre-files.list");
        const request = gapi.client.drive.files.list(
            {
                'q': "mimeType = 'application/json' and title = '" + globalDeleteStoryId + "' and trashed = false"
            });
        console.log("deleteStoryGd pre-execute");
        request.execute((resp) => {
            const files = resp.items;
            console.log(resp);
            deleteFileById(files[0].id)
            .then((resp) => {
                console.groupEnd("Google Drive"); 
                resolve();
                });
        });
    });
    return promise;
};

function restoreFromGoogle() {
    const promise = new Promise((resolve, reject) => {
        const request = gapi.client.drive.files.list(
        {
            'q': "mimeType = 'application/json' and '"+globalAppFolderGoogleId+"' in parents  and trashed = false"
        });
        request.execute((resp) => {
            console.log("restoreFromGoogle, id: ", globalAppFolderGoogleId);
            const files = resp.items;
            console.log("restoreFromGoogle, files: ", files);
            if (files.length <= 0) {
                console.groupEnd("Google Drive");
                resolve();
            }
            downloadFiles(files).then((resp)=>resolve(resp));
        });
    });
    return promise;
};

function downloadFiles(files) {
    const promise = new Promise((resolve, reject) => {
        const concurrency = 49;
        return files.map(function (response, i, [{concurrency: concurrency}])  {
            return makeRequestGoogleDrive(files[i].downloadUrl)
                .then((response) => {
                    upsertAllChaptersFromArray(that.chaptersArray).then(()=>resolve());
                    console.log("downloadFiles.then, response: ", response);
            });
        });
    });
    return promise;
};

//function downloadFile(file) {
//    const promise = new Promise((resolve, reject) => {
//        if (file.downloadUrl) {
//            const accessToken = gapi.auth.getToken().access_token;
//            const xhr = new XMLHttpRequest();
//            xhr.open('GET', file.downloadUrl);
//            xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
//            xhr.onload = () => {
//                console.log('Data downloaded:');
//                appState = JSON.parse(xhr.responseText);
//                console.log(appState);
//                addOrReplaceStory(appState.ChapterId, appState.StoryName, appState.Url, appState.Content, appState.NumberOfChapters);
//            };
//            xhr.onerror = () => {
//                console.log('XHR error!');
//                reject();
//            };
//            xhr.send();
//        } else {
//            console.log('Can\'t download...');
//        }
//    });
//    return promise;
//};

function makeRequestGoogleDrive(downloadUrl, retryCount = maxRequestRetry) {
    if (!downloadUrl) return;
    return new Promise((resolve, reject) => {
        const accessToken = gapi.auth.getToken().access_token;
        const xhr = new XMLHttpRequest();
        console.log(`making request with url: ${downloadUrl}`);
        xhr.open('GET', downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                console.log(xhr);
                console.groupEnd("Google Drive");
                const appState = JSON.parse(pako.inflate(xhr.responseText, { to: 'string' }));
                console.log(appState);
                that.chaptersArray = appState;
                resolve(appState);
            } else {
                if (retryCount) {
                    setTimeout(makeRequest(data, --retryCount), 100);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            }
        };
        xhr.onerror = function () {
            //retry to download could enter here before rejecting
            if (retryCount) {
                setTimeout(makeRequest(data, --retryCount), 100);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.send();
    });
};

    /*** Deprecated ***/

    const uploadAllStoryChapters = (data) => {
        const promise = new Promise((resolve, reject) => {
            console.log("uploadAllStoryChapters, data", that.chaptersArray);
            return that.chaptersArray.map((response, i) => {
                return uploadChapter(that.chaptersArray[i], globalStoryFolderGoogleId)
                    .then((response) => {
                        resolve();
                    });
            });
        });
        return promise;
    };

    function createStoryFolderAsyncHelper(resp) {
        const promise = new Promise((resolve, reject) => {
            const data = new Object();
            data.title = that.scrape.parsedInput.storyId;
            data.parents = [{ "id": globalAppFolderGoogleId }];
            data.mimeType = "application/vnd.google-apps.folder";
            gapi.client.drive.files.insert({ 'resource': data }).execute((fileList) => {
                globalStoryFolderGoogleId = fileList.id;
                console.log(`StoryFolder ${that.scrape.parsedInput.storyName} created`);
                console.assert(fileList !== null, fileList);
                resolve();
            });
        });
        return promise;
    };

    function createStoryFolderAsync(resp) {
        const promise = new Promise((resolve, reject) => {
            gapi.client.drive.files.list(
                {
                    'q': "mimeType = 'application/vnd.google-apps.folder' and title = '" + that.scrape.parsedInput.storyId + "' and trashed = false"
                }).then((response) => {
                    console.log("createStoryFolderAsync", response);
                    if (response.result.items.length !== 0) {
                        deleteFileById(response.result.items[0].id)
                            .then(() => {
                                resolve(createStoryFolderAsyncHelper());
                            });
                    } else {
                        resolve(createStoryFolderAsyncHelper());
                    }
                });
        });
        return promise;
    };

    function uploadChapter(chapterObject, storyFolderGoogleId) {
        const promise = new Promise((resolve, reject) => {
            if (!chapterObject) {
                console.log("uploadChapterHelper !chapterObject", chapterObject);
            }
            if (!storyFolderGoogleId) {
                console.log("uploadChapterHelper !storyFolderGoogleId", storyFolderGoogleId);
            }
            const boundary = "-------314159265358979323846264";
            const delimiter = "\r\n--" + boundary + "\r\n";
            const close_delim = "\r\n--" + boundary + "--";
            const contentType = "application/json";
            const metadata = {
                'title': chapterObject.chapterId,
                'mimeType': contentType,
                "parents": [{ "id": storyFolderGoogleId }]
            };
            const obj = (JSON.stringify(chapterObject));
            const multipartRequestBody =
                delimiter +
                    "Content-Type: application/json\r\n\r\n" +
                    JSON.stringify(metadata) +
                    delimiter +
                    "Content-Type: " +
                    contentType +
                    "\r\n\r\n" +
                    obj +
                    close_delim;
            const request = gapi.client.request({
                'path': "/upload/drive/v2/files",
                'method': "POST",
                'params': { 'uploadType': "multipart" },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            });
            request.execute((arg) => {
                console.info(`Chapter ${chapterObject.chapterId.split('.')[1]} from story ${chapterObject.storyName} uploaded to Google Drive`);
                resolve();
            });
        });
        return promise;
    };

    function uploadFile(evt) {
        const promise = new Promise((resolve, reject) => {
            gapi.client.load("drive",
                "v2",
                () => {
                    resolve();
                },
                () => {
                    reject();
                });
        });
        return promise;
    };