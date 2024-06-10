console.log("МЖИ менеджер запущен");

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
			})
			.catch((err) => {
				chrome.runtime.sendMessage({
					contentScriptQuery: "Error",
					error: `${err}`,
					flow: "activation",
				});
			});
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
		return true;
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
			})
			.catch((err) => {
				chrome.runtime.sendMessage({
					contentScriptQuery: "Error",
					error: `${err}`,
					flow: "logIn",
				});
			});
	}
	if (request.contentScriptQuery == "appdata") {
		await fetch(`${request.url}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ data: request.data }),
		})
			.then(checkResponse)
			.then((res) => {
				console.log("Пришел ответ с данными");
				chrome.runtime.sendMessage({
					data: res,
					contentScriptQuery: "appdata",
				});
			})
			.catch((err) => {
				chrome.runtime.sendMessage({
					contentScriptQuery: "Error",
					error: `${err}`,
					flow: "appdata",
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
		let result = undefined;

		fetch(`http://${variants.local.ip}:${variants.local.port}/checkip`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(checkResponse)
			.then((res) => {
				result = res.IP;
				if (result !== undefined) {
					chrome.runtime.sendMessage({
						contentScriptQuery: "checkIP",
						url: res.IP,
					});
				}
			})
			.catch((err) => {
				console.log("Внешний IP");
			});

		fetch(`http://${variants.out.ip}:${variants.out.port}/checkip`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(checkResponse)
			.then((res) => {
				result = res.IP;
				if (result !== undefined) {
					chrome.runtime.sendMessage({
						contentScriptQuery: "checkIP",
						url: res.IP,
					});
				}
			})
			.catch((err) => {
				console.log("Локальный IP");
			});
	}
});

function checkResponse(res) {
	if (res.ok) {
		return res.json();
	}
	return Promise.reject(res);
}
