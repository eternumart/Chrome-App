console.log("MJI-Manager started succsessfully");

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
	if (request.contentScriptQuery == "activation") {
		fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				chrome.runtime.sendMessage({
					data: res,
					contentScriptQuery: "activation",
				});
			});
	}
	if (request.contentScriptQuery == "checkActivation") {
		fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				chrome.runtime.sendMessage({
					data: res,
					contentScriptQuery: "checkActivation",
				});
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
				chrome.runtime.sendMessage({
					data: res,
					contentScriptQuery: "logIn",
				});
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
		}).then((res) => {
			if (res.ok) {
				chrome.runtime.sendMessage({
					contentScriptQuery: "checkIP",
					url: res.url,
				});
			}
		}).catch(err => {
			console.log(err)
		});

		fetch(`http://${variants.out.ip}:${variants.out.port}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		}).then((res) => {
			if (res.ok) {
				chrome.runtime.sendMessage({
					contentScriptQuery: "checkIP",
					url: res.url,
				});
			}
		}).catch(err => {
			console.log(err)
		});
	}
});

function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return Promise.reject(`Ошибка: ${res.status}`);
}
