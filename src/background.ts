import {generatePassword, sleep, showBadge, recognizePasswordConditions} from "./utils";
import {copyTextToClipboard, copyText} from "./browser";
import {defaultSettings, storageKey} from "./mapping";
import {Settings} from "./types";

chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "passforge_create",
        title: "Generate and copy password",
        type: 'normal',
        contexts: ['editable'],
    });

    chrome.contextMenus.create({
        id: "passforge_recognize",
        title: "Generate password based on selected criteria",
        type: 'normal',
        contexts: ['selection']
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request);
});


chrome.contextMenus.onClicked.addListener(async (item, tab) => {

    switch (item.menuItemId) {
        default:
        case "passforge_create":
            let currentSettings: Settings;
            let storageSettings = await chrome.storage.local.get([storageKey]);
            currentSettings = (!storageSettings[storageKey] ? defaultSettings : storageSettings[storageKey]);
            let {
                length,
                includeSpecialNoBrackets,
                includeSpecialBrackets,
                includeUppercase,
                includeNumbers
            } = currentSettings;
            let password = generatePassword(length, includeSpecialNoBrackets, includeSpecialBrackets, includeUppercase, includeNumbers);

            if (tab && typeof tab.id === "number") {
                if( !tab.url?.startsWith("chrome://")) {
                    //console.log(chrome.action);

                    await chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        func: copyText,
                        args: [password],
                    }).catch(e => {
                        console.log(e);
                    });

                    await showBadge("📋✅", tab.id, [255, 255, 255, 255], 1);
                }
                else {
                    await showBadge("❌", tab.id, [255, 255, 255, 255], 1);
                }
            }


            /*const [currentTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
            if (currentTab.id != null) {

                let options = {
                    windowId: currentTab.windowId,
                    tabId: currentTab.id
                }
                //console.log(chrome.action);
                //chrome.action.openPopup(options);
                const response = await chrome.tabs.sendMessage(currentTab.id, {options: options});
                // do something with response here, not outside the function
                console.log(response);
            }*/
            // const response = await chrome.runtime.sendMessage({type: "copyTextToClipboard", text: password}).catch(error => {
            //     console.log(error);
            // });


            //chrome.runtime.sendMessage({ message: "copy", text: password });
            // if(tab && typeof tab.id === "number")
            //     chrome.tabs.sendMessage(tab.id, { message: "copy", text: password });
            // chrome.scripting.executeScript({
            //     target: {
            //         tabId: tab!.id
            //     },
            //     files: ["content.js"]
            // });
            // if(tab!.id) {
            //     const runtimePort = chrome.tabs.connect(tab!.id, {});
            //
            //     chrome.tabs.sendMessage(tab!.id, {type: "copyTextToClipboard", text: password});
            //
            //     // const response = await chrome.runtime.sendMessage({type: "copyTextToClipboard", text: password}).catch(error => {
            //     //     console.log(error);
            //     // });
            // }


            break;
        case "passforge_recognize":

            if(item.selectionText) {
                let {
                    length,
                    includeSpecialNoBrackets,
                    includeSpecialBrackets,
                    includeUppercase,
                    includeNumbers
                } = recognizePasswordConditions(item.selectionText);

                let password = generatePassword(length, includeSpecialNoBrackets, includeSpecialBrackets, includeUppercase, includeNumbers);

                if (tab && typeof tab.id === "number") {
                    if( !tab.url?.startsWith("chrome://")) {
                        //console.log(chrome.action);

                        await chrome.scripting.executeScript({
                            target: {tabId: tab.id},
                            func: copyText,
                            args: [password],
                        }).catch(e => {
                            console.log(e);
                        });

                        await showBadge("📋✅", tab.id, [255, 255, 255, 255], 1);
                    }
                    else {
                        await showBadge("❌", tab.id, [255, 255, 255, 255], 1);
                    }
                }
            }



            // let options = {
            //     windowId: tab.windowId,
            //     tabId: tab.id
            // }
            // console.log(chrome.action);
            // chrome.action.openPopup(options);
            //const response = await chrome.runtime.sendMessage({greeting: "hello"});
            break;
    }
    //const response = await chrome.runtime.sendMessage({greeting: "hello"});
    // do something with response here, not outside the function
    //console.log(response);
});