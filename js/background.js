//Listener for getting page ip address
chrome.webRequest.onResponseStarted.addListener(
    function(details) {
        if (details.type == "main_frame") {
            chrome.runtime.sendMessage({
                details: details
            });
        }
    }, {
        urls: ["<all_urls>"]
    }
);

