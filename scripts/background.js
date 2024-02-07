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

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
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
				chrome.runtime.sendMessage(res);
			});
		return true; // Will respond asynchronously.
	}
	if (request.contentScriptQuery == "logIn") {
		await fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				chrome.runtime.sendMessage(res);
			});
	}
	if (request.contentScriptQuery == "checkusid") {
		await fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				chrome.runtime.sendMessage(res);
			});
	}
	if (request.contentScriptQuery == "checkIP") {
		const variants = request.data;

		fetch(`${variants.local.ip}:${variants.local.port}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		}).then((res) => {
			if (res.ok) {
				onsole.log("seems you're in the office")
				chrome.runtime.sendMessage(`${variants.local.ip}:${variants.local.port}`);
			}
		})
		.catch(err => {
			console.log("seems you're out of office")
			chrome.runtime.sendMessage(`${variants.out.ip}:${variants.out.port}`);
		})
	}
});

function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return Promise.reject(`Ошибка: ${res.status}`);
}
