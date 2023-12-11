console.log("background.js working...");

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
// 	if (request.contentScriptQuery == "getdata") {
// 		var url = request.url;
// 		fetch(url)
// 			.then((response) => response.text())
// 			.then((response) => sendResponse(response))
// 			.catch();
// 		return true;
// 	}
// 	if (request.contentScriptQuery == "postData") {
// 		fetch(request.url, {
// 			method: "POST",
// 			headers: {
// 				Accept: "application/json, application/xml, text/plain, text/html, *.*",
// 				"Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
// 			},
// 			body: "result=" + request.data,
// 		})
// 			.then((response) => response.json())
// 			.then((response) => sendResponse(response))
// 			.catch((error) => console.log("Error:", error));
// 		return true;
// 	}
// });

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log(request.json(), sender, sendResponse)
	debugger
	if (request.contentScriptQuery == "fetchUrl") {
		// WARNING: SECURITY PROBLEM - a malicious web page may abuse
		// the message handler to get access to arbitrary cross-origin
		// resources.
		fetch(request.url)
			.then((response) => response.text())
			.then((text) => sendResponse(text));
		return true; // Will respond asynchronously.
	}
});
