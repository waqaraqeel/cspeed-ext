//This function will send timing data to extension untill the page gets loaded 
function measure() {
    if (performance.timing.loadEventEnd == 0) {
        setTimeout(measure, 1000);
        return;
    }
    chrome.runtime.sendMessage({
        time: performance.timing,
        resource: getResource()
    });
}

measure();

function getResource() {
	result = [];
	resource = performance.getEntries();
	for (i in resource) {
		result.push(resource[i]);
	}
	return result;
}

function getTiming(object){
	result = {};
	for (key in object) {
		result[key] = object[key];
	}
	return result;
}