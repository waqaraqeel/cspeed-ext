// open the tab of the main extension
var url = chrome.extension.getURL('index.html');
chrome.tabs.create({
    url: url
})
