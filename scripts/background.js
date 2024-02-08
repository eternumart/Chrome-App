console.log("MJI-Manager started succsessfully");

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

		fetch(`http://${variants.local.ip}:${variants.local.port}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		})
			.then((res) => {
				chrome.runtime.sendMessage(`${variants.local.ip}:${variants.local.port}`);
			})
			.catch((err) => {
				chrome.runtime.sendMessage(`${variants.out.ip}:${variants.out.port}`);
			});
	}
});

function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return Promise.reject(`Ошибка: ${res.status}`);
}
