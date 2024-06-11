//import {copyTextToClipboard} from "./browser";

// chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
//     console.log(request);
//     sendResponse({ received: true });
//     // if(message?.type === "copyTextToClipboard") {
//     //     copyTextToClipboard(message?.text);
//     // }
// });

chrome.runtime.onMessage.addListener(async (message, callback, sendResponse) => {
    console.log(message);
    sendResponse({"yo": 1});
    //await chrome.browserAction.op(message.options);
    // if(message?.type === "copyTextToClipboard") {
    //     copyTextToClipboard(message?.text);
    // }
});
// chrome.runtime.sendMessage({ message: "copy", text: "info.selectionText" });
//
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     if (request.message === "copy") {
//         copyTextToClipboard(request.text)
//         sendResponse({});
//     }
// });

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//         console.log(sender.tab ?
//             "from a content script:" + sender.tab.url :
//             "from the extension");
//         if (request.greeting === "hello")
//             sendResponse({farewell: "goodbye"});
//     }
// );