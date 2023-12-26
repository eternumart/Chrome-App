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
	if (request.contentScriptQuery == "activation") {
		// WARNING: SECURITY PROBLEM - a malicious web page may abuse
		// the message handler to get access to arbitrary cross-origin
		// resources.
		console.log(`${request.url}`);
		fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: "somedata" }),
		})
			.then(checkResponse)
			.then((res) => {
				return res;
			});
		return true; // Will respond asynchronously.
	}
	if (request.contentScriptQuery == "checkActivation") {
		console.log(`${request.url}`);
		fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				sendResponse(res);
			});
		return true; // Will respond asynchronously.
	}
	if (request.contentScriptQuery == "setUsid") {
		fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				sendResponse(res);
			});
		return true; // Will respond asynchronously.
	}
});

function checkResponse(res) {
	if (res.ok) {
		console.log("res OK");
		return res.json();
	}
	return Promise.reject(`Ошибка: ${res.status}`);
}
