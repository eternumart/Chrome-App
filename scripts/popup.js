const formsTabs = document.querySelectorAll(".tabs__button");
const formsAll = document.querySelectorAll(".auth__form");
const authContainer = document.querySelector(".auth");
const loggedContainer = document.querySelector(".logged");
const loggedLogin = loggedContainer.querySelector(".logged__login");
const loggedExitButton = loggedContainer.querySelector(".logged__button");
const accountInfo = document.querySelector(".account");
const accountFio = accountInfo.querySelector(".account__fio");

const loginForm = document.querySelector(".auth__form_login");
const loginFormLogin = loginForm.querySelector("#login");
const loginFormPassword = loginForm.querySelector("#password");
const loginFormErrors = loginForm.querySelectorAll(".auth__error");
const loginFormButton = loginForm.querySelector("#login-btn");
const loginFormActivationError = loginForm.querySelector("#error-activation");

const activateForm = document.querySelector(".auth__form_first");
const activateFormLogin = activateForm.querySelector("#login");
const activateFormPassword = activateForm.querySelector("#password");
const activateFormKey = activateForm.querySelector("#key");
const activateFormButton = activateForm.querySelector("#activate-btn");
const activateFormErrors = activateForm.querySelectorAll(".auth__error");
const activateFormKeyError = activateForm.querySelector("#error-key");

const serverError = document.querySelector(".server-error");

const loader = document.querySelector(".loader");

// Конфиг Out & Local // Временно. Далее в планах применение только с VPN. Уберем getCurrentIP
const server = {
	local: {
		ip: "192.168.0.99",
		port: "3000",
	},
	out: {
		ip: "82.149.216.198",
		port: "57861",
	},
};

let currentState = false;
let currentIP = "";
let appData = undefined;
let timeout = undefined;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.contentScriptQuery == "Error") {
		if (request.flow === "checkip" && currentIP !== "") {
			return;
		}
		serverError.classList.add("server-error_visible");
		serverError.textContent = `Ошибка в процессе ${request.flow}. ${request.error}`;
	}
});

loggedExitButton.addEventListener("click", signOut);
loginForm.addEventListener("submit", (evt) => {
	logIn(loginFormLogin.value, loginFormPassword.value, loginForm, evt);
});

activateForm.addEventListener("submit", (evt) => {
	initActivation(activateFormLogin.value, activateFormPassword.value, activateForm, evt);
});

formsTabs.forEach((tab) => {
	tab.addEventListener("click", () => {
		changeTab(tab);
	});
});

loggedLogin.addEventListener("click", showAccountInfo);
accountFio.addEventListener("change", saveUserFio);

getCurrentIP();

function showAccountInfo() {
	accountInfo.classList.toggle("account_hidden");
}

function saveUserFio() {
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.contentScriptQuery == "savefio") {
			console.log(request);
			if (request.data) {
				accountFio.classList.add("account__fio_saved");
				setTimeout(() => {
					accountFio.classList.remove("account__fio_saved");
				}, 500);
				chrome.storage.local.set({ fio: `${request.data.fio}` });
			} else {
				accountFio.classList.add("account__fio_error");
				setTimeout(() => {
					accountFio.classList.remove("account__fio_error");
				}, 500);
			}
		}
	});
	chrome.runtime.sendMessage({
		contentScriptQuery: "savefio",
		data: {
			login: loggedLogin.textContent,
			fio: accountFio.value,
		},
		url: `${currentIP}savefio`,
	});
}

function getCurrentIP() {
	if (appData !== undefined) {
		clearInterval(timeout);
	}
	if (currentIP !== "") {
		return;
	}
	initLoader(loginForm, true);
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.contentScriptQuery == "checkIP" && request.url !== undefined) {
			currentIP = `http://${request.url}/`;
			checkLogin(undefined, true, true);
			getAppData();
			console.log(`IP сервера: ${currentIP}`);

			initLoader(loginForm, false);
		}
		if (request.url === undefined) {
			timeout = setInterval(getCurrentIP, 3000);
		}
	});

	chrome.runtime.sendMessage({
		contentScriptQuery: "checkIP",
		data: server,
	});
}

function randomFio() {
	fioArr = ["А. Я. Забывчивый", "У. Е. Денюжкин", "Ф. Ф. Ристайлов", "Е. Б. Мамкович", "К. С. Игроманов", "Ж. Е. Кавказов"];
	const randomIndex = Math.floor(Math.random() * fioArr.length);
	const randomValue = fioArr[randomIndex];

	return randomValue;
}

function signOut() {
	console.log("Вышли из приложения");
	authContainer.classList.remove("auth_hidden");
	loggedContainer.classList.add("logged_hidden");
	loggedLogin.textContent = "#####";
	accountFio.value = "#. #. #####";
	accountInfo.classList.add("account_hidden");
	chrome.storage.local.clear();
	refresh();
}

function changeTab(clickedTab) {
	formsTabs.forEach((tab) => {
		if (tab === clickedTab) {
			tab.classList.add("tabs__button_active");
		} else {
			tab.classList.remove("tabs__button_active");
		}
	});
	formsAll.forEach((form) => {
		if (clickedTab.id === form.id) {
			form.classList.add("auth__form_active");
		} else {
			form.classList.remove("auth__form_active");
		}
	});
}

function initActivation(log, pass, form, evt) {
	console.log("Запуск активации продукта");
	evt.preventDefault();

	initLoader(form, true);

	const usid = generateID();

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.contentScriptQuery == "activation") {
			if (request.data.boolean == true) {
				chrome.storage.local.set({ logged: `${log}` }).then(() => {});
				checkLogin(log, true, "launched");
				initLoader(form, false);
			}
			if (request.data.boolean === false) {
				activateFormKeyError.classList.add("auth__error_visible");
				initLoader(form, false);
			}
		}
	});

	if (log !== "" && pass !== "") {
		if (!currentState) {
			chrome.runtime.sendMessage({
				contentScriptQuery: "activation",
				data: {
					login: log,
					password: pass,
					key: activateFormKey.value,
					usid: usid,
				},
				url: `${currentIP}activation`,
			});
		}
	} else {
		activateFormKeyError.classList.add("auth__error_visible");
		activateFormKeyError.textContent = "Поля не могут быть пустыми";
		initLoader(form, false);
	}
}

function initLoader(form, flag) {
	if (flag) {
		loader.classList.add("loader_loading");
		form.classList.remove("auth__form_active");
	} else {
		loader.classList.remove("loader_loading");
		form.classList.add("auth__form_active");
	}
	if (flag === "clear") {
		loader.classList.remove("loader_loading");
	}
}

function logIn(log, pass, form, evt) {
	console.log("Запуск авторизации");
	evt.preventDefault();

	initLoader(form, true);
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.contentScriptQuery == "logIn") {
			let fio = "";
			if (request.data.loginIsPossible === true && request.data.activated) {
				if (request.data.fio) {
					fio = request.data.fio;
				} else {
					fio = randomFio();
				}
				chrome.storage.local.set({ logged: `${log}`, fio: `${fio}` }).then(() => {
					checkLogin(log, request.data.loginIsPossible, true);
					initLoader(form, false);
				});
			} else {
				loginFormActivationError.classList.add("auth__error_visible");
				loginFormActivationError.textContent = request.data.activation;
				initLoader(form, false);
			}
		}
	});
	if (log !== "" && pass !== "") {
		chrome.runtime.sendMessage({
			contentScriptQuery: "logIn",
			data: {
				login: log,
				password: pass,
			},
			url: `${currentIP}logIn`,
		});
	} else {
		loginFormActivationError.classList.add("auth__error_visible");
		loginFormActivationError.textContent = "Поля не могут быть пустыми";
		initLoader(form, false);
	}
}

function changePopupState(status) {
	if (status === "logged") {
		authContainer.classList.add("auth_hidden");
		loggedContainer.classList.remove("logged_hidden");
	} else {
		return;
	}
}

function checkLogin(log, loginIsPossible, launchStatus) {
	console.log("Запуск проверки логина");
	initLoader(loginForm, true);
	let currentLogin = "";
	let currentFio = "";
	chrome.storage.local.get(["fio"]).then((result) => {
		if (result.fio !== undefined) {
			accountFio.value = result.fio;
			currentFio = result.fio;
		}
	});
	chrome.storage.local.get(["logged"]).then((result) => {
		if (result.logged !== undefined) {
			if (log !== undefined && log !== result.logged) {
				loggedLogin.textContent = log;
				currentLogin = log;
			} else {
				loggedLogin.textContent = result.logged;
				currentLogin = result.logged;
			}
			changePopupState("logged");
			checkLayoutBeforeInit();
			initialization(currentFio, currentLogin, loginIsPossible, launchStatus);
		}
	});
}

// Получаем данные о дефектах и верстку приложения с бекенда
function getAppData() {
	console.log("Запрашиваем данные приложения");
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.contentScriptQuery == "appdata") {
			appData = request.data;
		}
	});
	chrome.runtime.sendMessage({
		contentScriptQuery: "appdata",
		data: "give me data",
		url: `${currentIP}appdata`,
	});
}

function generateID() {
	const time = Date.now();
	const randomNumber = Math.floor(Math.random() * 1000000001);
	const usid = `${time}_${randomNumber}`;
	return usid;
}

function checkUsid(login, usid) {
	let usidInBase;
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		usidInBase = request.usid;

		if (usidInBase) {
			chrome.storage.local.set({ usid: `${usidInBase}` }).then(() => {});
		}
	});

	chrome.runtime.sendMessage({
		contentScriptQuery: "checkUsid",
		data: {
			login: login,
			usid: usid,
		},
		url: `${currentIP}/checkusid`,
	});

	chrome.storage.local.get(["usid"]).then((result) => {});
}

function setUsid(login) {
	const usid = generateID();
	let usidInBase;
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		usidInBase = request.usid;

		if (usidInBase) {
			chrome.storage.local.set({ usid: `${usidInBase}` }).then(() => {});
		}
	});

	chrome.runtime.sendMessage({
		contentScriptQuery: "setUsid",
		data: {
			login: login,
			usid: usid,
		},
		url: `${currentIP}/setusid`,
	});
}

// Если в storage "status" остался статус init: true - рабочее окно не откроется. Эта функция обнуляет storage "status" до исходного.
function checkLayoutBeforeInit() {
	console.log("Проверили статус запуска");
	chrome.tabs.query({ active: true }, (tabs) => {
		const tab = tabs[0];
		if (tab) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: true },
				func: () => {
					try {
						document.querySelector(".mji-manager-app").remove();
					} catch {}
					localStorage.setItem("status", JSON.stringify({ layout: false, init: false, authorized: false, uid: null }));
				},
			});
		}
	});
}

// При выходе из аккаунта - обнуляется storage "status" до исходного и закрывается рабочее окно если оно было открыто.
function refresh() {
	console.log("Вышли из аккаунта");
	chrome.tabs.query({ active: true }, (tabs) => {
		const tab = tabs[0];
		if (tab) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: true },
				func: () => {
					localStorage.setItem("status", JSON.stringify({ layout: false, init: false, authorized: false, uid: null }));
					try {
						document.querySelector(".mji-manager-app").remove();
					} catch {}
				},
			});
		}
	});
}

// Инициализация запуска рабочего окна
function initialization(currentFio, login, loginIsPossible, launchStatus) {
	console.log("Запуск приложения");
	debugger
	initLoader(loginForm, true);
	function init() {
		if (appData) {
			serverError.classList.remove("server-error_visible");
			chrome.tabs.query({ active: true }, (tabs) => {
				const tab = tabs[0];
				if (tab) {
					chrome.scripting.executeScript({
						args: [currentFio, login, loginIsPossible, launchStatus, appData],
						target: { tabId: tab.id, allFrames: true },
						func: launchApp,
					});
				}
			});
			initLoader(loginForm, false);
		} else {
			setTimeout(init, 200);
		}
	}
	init();
}

function launchApp(currentFio, login, loginIsPossible, launchStatus, appData) {
	// Хранилище всех переменных приложения
	const appVariables = {};
	const resultsDefectsInputs = {
		empty: true,
		inputs: [],
	};
	const representativesInputs = {
		empty: true,
	};
	const allRatesPercentsInputs = {};

	// Предотвращение двойного старта
	if (!localStorage.getItem("status")) {
		setToStorage(false, launchStatus, null, null);
	} else {
		const storageData = JSON.parse(localStorage.getItem("status"));
		if (storageData.init) {
			return;
		} else {
			if (loginIsPossible) {
				setToStorage(false, launchStatus, null, null);
			}
		}
	}

	// Верстка внутреннего попапа со стилями и верстка выпадающих окон с бекенда
	const popupLayout = appData.appLayout.popupLayout;
	const stylesLayout = appData.appLayout.stylesLayout;
	const fakeSelectList = appData.appLayout.fakeSelectList;
	const selectsValues = appData.defectsData;
	const representatives = appData.representativesData;

	// Определение наличия iFrame на странице встраивания
	appVariables.html = document.querySelector("#formCanvas").contentWindow.document.querySelector("html") || document.querySelector("html");
	appVariables.wholeAddress = document.querySelector("#title").textContent;

	// Определение тегов head и body в документе
	appVariables.htmlHead = appVariables.html.querySelector("head");
	appVariables.htmlBody = appVariables.html.querySelector("body");

	// Определение страницы встраивания с фото или с отчетом
	appVariables.form = appVariables.htmlBody.querySelector("#formData107") || appVariables.htmlBody.querySelector("#formData181");

	if (appVariables.form.id === "formData107") {
		appVariables.currentPage = "photo";
	}
	// } else {
	if (appVariables.form.id === "formData181") {
		appVariables.currentPage = "main";
	}

	createPopup(appVariables.currentPage);
	setToStorage(true, true, null, null);

	appVariables.dragIco = appVariables.app.querySelector(".header__drag-button");
	appVariables.inputDate = appVariables.app.querySelector("#date");
	appVariables.cleanButton = appVariables.app.querySelector("#cleanButton");
	appVariables.minimizeButton = appVariables.app.querySelector("#minimizeButton");
	appVariables.closeButton = appVariables.app.querySelector("#closeButton");
	appVariables.copyButton = appVariables.app.querySelector("#copy");
	appVariables.clearDataButton = appVariables.app.querySelector("#clean");
	appVariables.pasteButton = appVariables.app.querySelector("#paste");
	appVariables.fakeSelectsButton = appVariables.app.querySelector("#fakeSelects");
	appVariables.photoDownload = appVariables.app.querySelector(".form");
	appVariables.submitButton = appVariables.photoDownload.querySelector(".form__button");
	appVariables.formInput = appVariables.app.querySelector("#file");
	appVariables.userLogin = appVariables.app.querySelector(".account-info__login").querySelector("span");

	// Обработчики действий пользователя
	appVariables.dragIco.addEventListener("mousedown", startDraggingDiv);
	appVariables.dragIco.addEventListener("dragstart", removeDefaultDrag);
	appVariables.cleanButton.addEventListener("click", clearCache);
	appVariables.minimizeButton.addEventListener("click", minimizeApp);
	appVariables.closeButton.addEventListener("click", closeApp);
	appVariables.clearDataButton.addEventListener("click", clearData);
	appVariables.copyButton.addEventListener("click", saveData);
	appVariables.pasteButton.addEventListener("click", loadData);
	appVariables.photoDownload.addEventListener("submit", downloadPhotos);
	appVariables.fakeSelectsButton.addEventListener("click", createFakeSelects);
	appVariables.tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			changeTab(tab);
		});
	});

	appVariables.userLogin.textContent = `${currentFio}, ${login}`;

	setInitialDate(appVariables.inputDate);

	// Встраивание верстки приложения в страницу
	function createPopup(currentPage) {
		appVariables.htmlHead.insertAdjacentHTML("beforeEnd", stylesLayout);
		appVariables.htmlBody.insertAdjacentHTML("afterBegin", popupLayout);
		appVariables.app = appVariables.htmlBody.querySelector(".mji-manager-app");
		appVariables.tabs = appVariables.app.querySelectorAll(".tabs__button");
		appVariables.tabsContent = appVariables.app.querySelectorAll(".content");

		// Установка табов и контента под текущую страницу
		currentPage === "main" ? appVariables.tabs[0].classList.add("tabs__button_active") : appVariables.tabs[1].classList.add("tabs__button_active");
		currentPage === "main" ? appVariables.tabsContent[1].classList.add("content_deactive") : appVariables.tabsContent[0].classList.add("content_deactive");

		appVariables.html.addEventListener("keyup", (evt) => {
			minimizeAppByEscape(evt);
		});
	}

	// Статус инициализации запуска в страницу
	function setToStorage(layout, init, authorized, uid) {
		let status;
		if (localStorage.getItem("status")) {
			status = JSON.parse(localStorage.getItem("status"));
			if (layout !== null) {
				status.layout = layout;
			}
			if (init !== null) {
				status.init = init;
			}
			if (authorized !== null) {
				status.authorized = authorized;
			}
			if (uid !== null) {
				status.uid = uid;
			}
		} else {
			status = {};
			if (layout !== null) {
				status.layout = layout;
			}
			if (init !== null) {
				status.init = init;
			}
			if (authorized !== null) {
				status.authorized = authorized;
			}
			if (uid !== null) {
				status.uid = uid;
			}
		}
		localStorage.setItem("status", JSON.stringify(status));
	}

	// Очистка памяти LocalStorage от сохраненных копий отчетов
	function clearCache() {
		appVariables.cleanButton.firstElementChild.firstElementChild.classList.add("animation");
		localStorage.removeItem("MJIDATA");
		localStorage.removeItem("DataLoaded");
		setTimeout(() => {
			appVariables.cleanButton.firstElementChild.firstElementChild.classList.remove("animation");
		}, 1100);
	}

	// Минимизация приложения в нижний край экрана
	function minimizeApp() {
		appVariables.app.style.transition = "0.5s";
		appVariables.app.classList.toggle("app_minimized");
		setTimeout(() => {
			appVariables.app.style.transition = null;
		}, 500);
	}

	function minimizeAppByEscape(evt) {
		if (evt.key === "Escape") {
			minimizeApp();
		}
	}

	// Закрытие приложения
	function closeApp() {
		appVariables.cleanButton.removeEventListener("click", clearCache);
		appVariables.minimizeButton.removeEventListener("click", minimizeApp);
		appVariables.closeButton.removeEventListener("click", closeApp);
		appVariables.dragIco.removeEventListener("mousedown", startDraggingDiv);
		setToStorage(false, false, null, null);
		appVariables.app.remove();
		appVariables.htmlHead.querySelector("style").remove();
		appVariables.htmlBody.querySelectorAll(".fakeSelect").forEach((select) => {
			select.remove();
		});
		appVariables.htmlBody.querySelectorAll(".fakeSelect__selector").forEach((selector) => {
			selector.remove();
		});
	}

	// Установка текущей даты
	function setInitialDate(tag) {
		const date = new Date();
		let day = date.getDate();
		let month = date.getMonth() + 1;
		const year = date.getFullYear();
		if (day < 10) {
			day = `0${day}`;
		}
		if (month < 10) {
			month = `0${month}`;
		}

		tag.value = `${year}-${month}-${day}`;
	}

	// Смена вкладки в приложении
	function changeTab(clickedTab) {
		appVariables.tabs.forEach((tab) => {
			if (tab === clickedTab) {
				tab.classList.add("tabs__button_active");
			} else {
				tab.classList.remove("tabs__button_active");
			}
		});
		appVariables.tabsContent.forEach((content) => {
			if (clickedTab.id === content.id) {
				content.classList.remove("content_deactive");
			} else {
				content.classList.add("content_deactive");
			}
		});
	}

	// Управление перетаскиванием рабочего окна по странице с помощью мыши
	function startDraggingDiv(event) {
		appVariables.dragIco.style.cursor = "grabbing";
		let shiftX = event.clientX - appVariables.app.getBoundingClientRect().left;

		appVariables.html.addEventListener("mousemove", onMouseMove);
		appVariables.html.addEventListener("mouseup", () => {
			appVariables.html.removeEventListener("mousemove", onMouseMove);
			appVariables.dragIco.style.cursor = "grab";
			appVariables.dragIco.onmouseup = null;
		});

		function moveAt(screenX, screenY) {
			appVariables.app.style.left = screenX - 255 + "px";
			appVariables.app.style.top = screenY - 142 + "px";
		}

		function onMouseMove(event) {
			moveAt(event.screenX, event.screenY);
		}

		moveAt(event.screenX, event.screenY);
	}
	function removeDefaultDrag() {
		return false;
	}

	// Отображение ошибки при неправильном действии
	function buttonError(button, currentPage, needPage, stdValue) {
		if (currentPage !== needPage) {
			button.classList.add("main__button_error");
			button.textContent = "Ошибка!";
			setTimeout(() => {
				button.classList.remove("main__button_error");
				button.textContent = stdValue;
			}, 1500);
			return false;
		} else {
			return true;
		}
	}

	// Определение всех переменных для полей отчета
	function searchAllInputs() {
		appVariables.area = appVariables.wholeAddress.split(",")[0];
		appVariables.district = appVariables.wholeAddress.split(",")[1];
		appVariables.address = appVariables.htmlBody.querySelector("#comboboxTextcomp_12339").value;
		appVariables.repairProjectsTable = appVariables.form.querySelector("#group_22130");
		appVariables.repairProjectsTableRows = appVariables.repairProjectsTable.querySelectorAll("tr");
		appVariables.conclusionsPrevSurvey = appVariables.form.querySelector("#gridSql_22131").querySelector(".data");
		appVariables.conclusionsPrevSurveyRows = appVariables.conclusionsPrevSurvey.querySelectorAll("tr");

		appVariables.recomendationsDone = appVariables.form.querySelector("#group_22127");
		appVariables.recomendationsRoofBlock = appVariables.recomendationsDone.querySelector("#group_22193");
		appVariables.roofTable = appVariables.recomendationsRoofBlock.querySelector("tbody");
		appVariables.roofRows = appVariables.roofTable.querySelectorAll("tr");

		appVariables.balconyBlock = appVariables.recomendationsDone.querySelector("#group_22196");
		appVariables.balconyTable = appVariables.balconyBlock.querySelector("tbody");
		appVariables.balconyRows = appVariables.balconyTable.querySelectorAll("tr");

		appVariables.mopBlock = appVariables.recomendationsDone.querySelector("#group_22201");
		appVariables.mopTable = appVariables.mopBlock.querySelector("tbody");
		appVariables.mopRows = appVariables.mopTable.querySelectorAll("tr");

		appVariables.heatSystemBlock = appVariables.recomendationsDone.querySelector("#group_22204");
		appVariables.heatSystemTable = appVariables.heatSystemBlock.querySelector("tbody");
		appVariables.heatSystemRows = appVariables.heatSystemTable.querySelectorAll("tr");

		appVariables.gvsBlock = appVariables.recomendationsDone.querySelector("#group_22205");
		appVariables.gvsTable = appVariables.gvsBlock.querySelector("tbody");
		appVariables.gvsRows = appVariables.gvsTable.querySelectorAll("tr");

		appVariables.hvsBlock = appVariables.recomendationsDone.querySelector("#group_22206");
		appVariables.hvsTable = appVariables.hvsBlock.querySelector("tbody");
		appVariables.hvsRows = appVariables.hvsTable.querySelectorAll("tr");

		appVariables.sewerBlock = appVariables.recomendationsDone.querySelector("#group_22207");
		appVariables.sewerTable = appVariables.sewerBlock.querySelector("tbody");
		appVariables.sewerRows = appVariables.sewerTable.querySelector("tr");

		appVariables.results = appVariables.form.querySelector("#group_22125");
		appVariables.resultsRoofBlock = appVariables.results.querySelector("#group_22243");
		appVariables.resultsRoofTable = appVariables.resultsRoofBlock.querySelector("tbody");
		appVariables.resultsRoofRows = appVariables.resultsRoofTable.querySelectorAll("tr");

		appVariables.resultsBalconyBlock = appVariables.results.querySelector("#group_22264");
		appVariables.resultsBalconyTable = appVariables.resultsBalconyBlock.querySelector("tbody");
		appVariables.resultsBalconyRows = appVariables.resultsBalconyTable.querySelectorAll("tr");

		appVariables.resultsMopBlock = appVariables.results.querySelector("#group_22268");
		appVariables.resultsMopTable = appVariables.resultsMopBlock.querySelector("tbody");
		appVariables.resultsMopRows = appVariables.resultsMopTable.querySelectorAll("tr");

		appVariables.resultHeatSystemBlock = appVariables.results.querySelector("#group_22271");
		appVariables.resultsHeatSystemTable = appVariables.resultHeatSystemBlock.querySelector("tbody");
		appVariables.resultsHeatSystemRows = appVariables.resultsHeatSystemTable.querySelectorAll("tr");

		appVariables.resultsGvsBlock = appVariables.results.querySelector("#group_22272");
		appVariables.resultsGvsTable = appVariables.resultsGvsBlock.querySelector("tbody");
		appVariables.resultsGvsRows = appVariables.resultsGvsTable.querySelectorAll("tr");

		appVariables.resultsHvsBlock = appVariables.results.querySelector("#group_22273");
		appVariables.resultsHvsTable = appVariables.resultsHvsBlock.querySelector("tbody");
		appVariables.resultsHvsRows = appVariables.resultsHvsTable.querySelectorAll("tr");

		appVariables.resultsSewerBlock = appVariables.results.querySelector("#group_22274");
		appVariables.resultsSewerTable = appVariables.resultsSewerBlock.querySelector("tbody");
		appVariables.resultsSewerRows = appVariables.resultsSewerTable.querySelectorAll("tr");

		appVariables.signatoriesBlock = appVariables.html.querySelector("#group_22133");
		appVariables.signatoriesTable = appVariables.signatoriesBlock.querySelector("tbody");
		appVariables.signatoriesRows = appVariables.signatoriesTable.querySelectorAll("tr");

		appVariables.options = new Object();
		appVariables["options"]["Крыша"] = new Object();
		appVariables["options"]["Крыша"]["Конструкция крыши"] = appVariables.results.querySelector("#lookupTextcomp_12453");
		appVariables["options"]["Крыша"]["Материал кровли"] = appVariables.results.querySelector("#lookupTextcomp_12454");

		appVariables["options"]["Водоотвод"] = new Object();
		appVariables["options"]["Водоотвод"]["Тип водоотвода"] = appVariables.results.querySelector("#lookupTextcomp_12456");
		appVariables["options"]["Водоотвод"]["Материал водоотвода"] = appVariables.results.querySelector("#lookupTextcomp_12457");

		appVariables["options"]["Межпанельные стыки"] = new Object();
		appVariables["options"]["Межпанельные стыки"]["Тип стыков"] = appVariables.results.querySelector("#lookupTextcomp_12458");
		appVariables["options"]["Межпанельные стыки"]["Тип стыков"] = appVariables.results.querySelector("#lookupTextcomp_12458");

		appVariables["options"]["Фасад"] = new Object();
		appVariables["options"]["Фасад"]["Отделка стен"] = appVariables.results.querySelector("#lookupTextcomp_12460");
		appVariables["options"]["Фасад"]["Отделка цоколя"] = appVariables.results.querySelector("#lookupTextcomp_12461");
		appVariables["options"]["Фасад"]["Оконные заполнения"] = appVariables.results.querySelector("#lookupTextcomp_12462");

		appVariables["options"]["Стены"] = new Object();
		appVariables["options"]["Стены"]["Материал стен"] = appVariables.results.querySelector("#lookupTextcomp_12444");
		appVariables["options"]["Стены"]["Теплофизические свойства"] = appVariables.results.querySelector("#lookupTextcomp_12445");

		appVariables["options"]["Лестницы"] = new Object();
		appVariables["options"]["Лестницы"]["Конструкция"] = appVariables.results.querySelector("#lookupTextcomp_12370");

		appVariables["options"]["Перекрытия"] = new Object();
		appVariables["options"]["Перекрытия"]["Материал перекрытия"] = appVariables.results.querySelector("#lookupTextcomp_12371");

		appVariables["options"]["Система отопления"] = new Object();
		appVariables["options"]["Система отопления"]["Вид отопления"] = appVariables.results.querySelector("#lookupTextcomp_12605");
		appVariables["options"]["Система отопления"]["Материал трубопроводов"] = appVariables.results.querySelector("#lookupTextcomp_13393");
		appVariables["options"]["Система отопления"]["Тип приборов"] = appVariables.results.querySelector("#lookupTextcomp_12372");
		appVariables["options"]["Система отопления"]["Термо-регуляторы в квартирах"] = appVariables.results.querySelector("#lookupTextcomp_12373");
		appVariables["options"]["Система отопления"]["Наличие ОДУУ"] = appVariables.results.querySelector("#lookupTextcomp_12375");
		appVariables["options"]["Система отопления"]["Тип стояков"] = appVariables.results.querySelector("#lookupTextcomp_12299");

		appVariables["options"]["ГВС"] = new Object();
		appVariables["options"]["ГВС"]["Тип системы"] = appVariables.results.querySelector("#lookupTextcomp_12378");
		appVariables["options"]["ГВС"]["Материал трубопроводов"] = appVariables.results.querySelector("#lookupTextcomp_12379");
		appVariables["options"]["ГВС"]["Наличие ОДУУ"] = appVariables.results.querySelector("#lookupTextcomp_12380");
		appVariables["options"]["ГВС"]["Тип стояков"] = appVariables.results.querySelector("#lookupTextcomp_13394");

		appVariables["options"]["ХВС"] = new Object();
		appVariables["options"]["ХВС"]["Материал трубопроводов"] = appVariables.results.querySelector("#lookupTextcomp_12382");
		appVariables["options"]["ХВС"]["Наличие ОДУУ"] = appVariables.results.querySelector("#lookupTextcomp_12381");
		appVariables["options"]["ХВС"]["Тип стояков"] = appVariables.results.querySelector("#lookupTextcomp_13395");

		appVariables["options"]["Канализация"] = new Object();
		appVariables["options"]["Канализация"]["Материал трубопроводов"] = appVariables.results.querySelector("#lookupTextcomp_12383");
		appVariables["options"]["Канализация"]["Тип стояков"] = appVariables.results.querySelector("#lookupTextcomp_13396");

		// ПАСПОРТНЫЕ ДАННЫЕ
		appVariables.passportDannye = new Object();

		appVariables.passportDannye.etajei = appVariables.form.querySelector("#comp_12472");
		appVariables.passportDannye.podjezdov = appVariables.form.querySelector("#comp_12473");
		appVariables.passportDannye.stroyObjem = appVariables.form.querySelector("#comp_12474");
		appVariables.passportDannye.kvartir = appVariables.form.querySelector("#comp_12475");
		appVariables.passportDannye.poleznayaPloschad = appVariables.form.querySelector("#comp_12476");
		appVariables.passportDannye.jilayaPloschad = appVariables.form.querySelector("#comp_12477");
		appVariables.passportDannye.neJilayaPloschad = appVariables.form.querySelector("#comp_12478");
		appVariables.passportDannye.seriyaProekta = appVariables.form.querySelector("#lookupTextcomp_12479");
		appVariables.passportDannye.godPostrioki = appVariables.form.querySelector("#comp_12480");
		appVariables.passportDannye.godRekonstrukcii = appVariables.form.querySelector("#comp_12481");
		appVariables.passportDannye.klassEnergoeffectivnosti = appVariables.form.querySelector("#lookupTextcomp_12482");
		appVariables.passportDannye.fizIznos = appVariables.form.querySelector("#comp_12661");
		appVariables.passportDannye.dannyeBtiData = appVariables.form.querySelector("#comp_12662");
		appVariables.passportDannye.nalichVstroenSooruj = appVariables.form.querySelector("#lookupTextcomp_12663");
		appVariables.passportDannye.kolichVstroenSooruj = appVariables.form.querySelector("#comp_12664");
		appVariables.passportDannye.kolichNadstroenSooruj = appVariables.form.querySelector("#comp_12671");
		appVariables.passportDannye.tp = appVariables.form.querySelector("#comp_12665");
		appVariables.passportDannye.maslyanieTp = appVariables.form.querySelector("#comp_12666");
		appVariables.passportDannye.magistraliTranzit = appVariables.form.querySelector("#lookupTextcomp_12667");
		appVariables.passportDannye.potreblenieTeplaFact = appVariables.form.querySelector("#comp_12668");
		appVariables.passportDannye.potreblenieTeplaProekt = appVariables.form.querySelector("#comp_12669");
		appVariables.passportDannye.potreblenieTeplaOtklonenie = appVariables.form.querySelector("#comp_12670");

		// ТЕХ ЗАКЛЮЧЕНИЯ И ПРОЕКТЫ РЕМОНТОВ
		appVariables.tehZakluchenia = new Object();

		for (let i = 0; i < appVariables.repairProjectsTableRows.length; i++) {
			if (i < 1 || appVariables.repairProjectsTableRows[i].classList.contains("gridBGTotal")) {
				continue;
			}
			if (i > 1) {
				appVariables["tehZakluchenia"][i] = new Object();
				appVariables["tehZakluchenia"][i]["organizacia"] = appVariables.repairProjectsTableRows[i].querySelector("#comp_12333");
				appVariables["tehZakluchenia"][i]["dataNomer"] = appVariables.repairProjectsTableRows[i].querySelector("#comp_12334");
				appVariables["tehZakluchenia"][i]["naimenovanieSoderjanie"] = appVariables.repairProjectsTableRows[i].querySelector("#comp_12335");
			}
		}

		// ВЫВОДЫ ПО РЕЗУЛЬТАТАМ ПРЕДЫДУЩЕГО ОБСЛЕДОВАНИЯ
		appVariables.vivodyPoRezultatam = new Object();
		for (let i = 0; i < appVariables.conclusionsPrevSurveyRows.length; i++) {
			appVariables["vivodyPoRezultatam"][i] = new Object();

			appVariables["vivodyPoRezultatam"][i]["id"] = appVariables.conclusionsPrevSurveyRows[i].querySelector("td:nth-child(1)").firstElementChild;
			appVariables["vivodyPoRezultatam"][i]["data"] = appVariables.conclusionsPrevSurveyRows[i].querySelector("td:nth-child(2)");
			appVariables["vivodyPoRezultatam"][i]["number"] = appVariables.conclusionsPrevSurveyRows[i].querySelector("td:nth-child(3)");
			appVariables["vivodyPoRezultatam"][i]["tehSostoyanie"] = appVariables.conclusionsPrevSurveyRows[i].querySelector("td:nth-child(4)");
		}

		// РЕКОМЕНДАЦИИ ПО КАП РЕМОНТУ
		appVariables.recomend = new Object();
		// Крыша
		appVariables.recomend.krisha = new Object();
		for (let i = 1; i < appVariables.roofRows.length; i++) {
			switch (appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent) {
				case "Кровля":
					appVariables.recomend.krisha.krovla = new Object();
					appVariables.recomend.krisha.krovla.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.krovla.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.krovla.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.krovla.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.krovla.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
				case "Свесы":
					appVariables.recomend.krisha.svesy = new Object();
					appVariables.recomend.krisha.svesy.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.svesy.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.svesy.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.svesy.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.svesy.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
				case "Стропильная система":
					appVariables.recomend.krisha.stropilnayaSistema = new Object();
					appVariables.recomend.krisha.stropilnayaSistema.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.stropilnayaSistema.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.stropilnayaSistema.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.stropilnayaSistema.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.stropilnayaSistema.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
				case "Чердак":
					appVariables.recomend.krisha.cherdak = new Object();
					appVariables.recomend.krisha.cherdak.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.cherdak.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.cherdak.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.cherdak.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.cherdak.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
				case "Покрытие ж/б":
					appVariables.recomend.krisha.pokritieJB = new Object();
					appVariables.recomend.krisha.pokritieJB.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.pokritieJB.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.pokritieJB.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.pokritieJB.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.pokritieJB.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
				case "Все элементы":
					appVariables.recomend.krisha.vseElementy = new Object();
					appVariables.recomend.krisha.vseElementy.name = appVariables.roofRows[i].querySelector("#lookupTextcomp_12483").textContent;
					appVariables.recomend.krisha.vseElementy.recomend = appVariables.roofRows[i].querySelector("#comp_12484");
					appVariables.recomend.krisha.vseElementy.trebObjom = appVariables.roofRows[i].querySelector("#comp_12485");
					appVariables.recomend.krisha.vseElementy.vypolnenGod = appVariables.roofRows[i].querySelector("#comp_12486");
					appVariables.recomend.krisha.vseElementy.factObjom = appVariables.roofRows[i].querySelector("#comp_12487");
					break;
			}
		}

		// Водоотвод
		appVariables.recomend.vodootvod = new Object();
		appVariables.recomend.vodootvod.recomend = appVariables.recomendationsDone.querySelector("#comp_12489");
		appVariables.recomend.vodootvod.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12490");
		appVariables.recomend.vodootvod.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12491");
		appVariables.recomend.vodootvod.factObjom = appVariables.recomendationsDone.querySelector("#comp_12492");

		// Герметизация
		appVariables.recomend.germetizacia = new Object();
		appVariables.recomend.germetizacia.recomend = appVariables.recomendationsDone.querySelector("#comp_12359");
		appVariables.recomend.germetizacia.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12366");
		appVariables.recomend.germetizacia.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12365");
		appVariables.recomend.germetizacia.factObjom = appVariables.recomendationsDone.querySelector("#comp_12364");

		// Фасад
		appVariables.recomend.fasad = new Object();
		appVariables.recomend.fasad.recomend = appVariables.recomendationsDone.querySelector("#comp_12494");
		appVariables.recomend.fasad.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12495");
		appVariables.recomend.fasad.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12496");
		appVariables.recomend.fasad.factObjom = appVariables.recomendationsDone.querySelector("#comp_12364");

		// Балконы
		appVariables.recomend.balkony = new Object();
		appVariables.recomend.balkony.balkony = new Object();
		appVariables.recomend.balkony.lodjii = new Object();
		appVariables.recomend.balkony.kozirki = new Object();
		appVariables.recomend.balkony.erkery = new Object();
		appVariables.recomend.balkony.vseElementy = new Object();

		for (let i = 1; i < appVariables.balconyRows.length; i++) {
			switch (appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent) {
				case "Балконы":
					appVariables.recomend.balkony.balkony.name = appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent;
					appVariables.recomend.balkony.balkony.recomend = appVariables.balconyRows[i].querySelector("#comp_12499");
					appVariables.recomend.balkony.balkony.trebObjom = appVariables.balconyRows[i].querySelector("#comp_12500");
					appVariables.recomend.balkony.balkony.vypolnenGod = appVariables.balconyRows[i].querySelector("#comp_12501");
					appVariables.recomend.balkony.balkony.factObjom = appVariables.balconyRows[i].querySelector("#comp_12502");
					break;
				case "Лоджии":
					appVariables.recomend.balkony.lodjii.name = appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent;
					appVariables.recomend.balkony.lodjii.recomend = appVariables.balconyRows[i].querySelector("#comp_12499");
					appVariables.recomend.balkony.lodjii.trebObjom = appVariables.balconyRows[i].querySelector("#comp_12500");
					appVariables.recomend.balkony.lodjii.vypolnenGod = appVariables.balconyRows[i].querySelector("#comp_12501");
					appVariables.recomend.balkony.lodjii.factObjom = appVariables.balconyRows[i].querySelector("#comp_12502");
					break;
				case "Козырьки":
					appVariables.recomend.balkony.kozirki.name = appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent;
					appVariables.recomend.balkony.kozirki.recomend = appVariables.balconyRows[i].querySelector("#comp_12499");
					appVariables.recomend.balkony.kozirki.trebObjom = appVariables.balconyRows[i].querySelector("#comp_12500");
					appVariables.recomend.balkony.kozirki.vypolnenGod = appVariables.balconyRows[i].querySelector("#comp_12501");
					appVariables.recomend.balkony.kozirki.factObjom = appVariables.balconyRows[i].querySelector("#comp_12502");
					break;
				case "Эркеры":
					appVariables.recomend.balkony.erkery.name = appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent;
					appVariables.recomend.balkony.erkery.recomend = appVariables.balconyRows[i].querySelector("#comp_12499");
					appVariables.recomend.balkony.erkery.trebObjom = appVariables.balconyRows[i].querySelector("#comp_12500");
					appVariables.recomend.balkony.erkery.vypolnenGod = appVariables.balconyRows[i].querySelector("#comp_12501");
					appVariables.recomend.balkony.erkery.factObjom = appVariables.balconyRows[i].querySelector("#comp_12502");
					break;
				case "Все элементы":
					appVariables.recomend.balkony.vseElementy.name = appVariables.balconyRows[i].querySelector("#lookupTextcomp_12498").textContent;
					appVariables.recomend.balkony.vseElementy.recomend = appVariables.balconyRows[i].querySelector("#comp_12499");
					appVariables.recomend.balkony.vseElementy.trebObjom = appVariables.balconyRows[i].querySelector("#comp_12500");
					appVariables.recomend.balkony.vseElementy.vypolnenGod = appVariables.balconyRows[i].querySelector("#comp_12501");
					appVariables.recomend.balkony.vseElementy.factObjom = appVariables.balconyRows[i].querySelector("#comp_12502");
					break;
			}
		}
		appVariables.recomend.balkony.balkony.osteklenie = appVariables.recomendationsDone.querySelector("#lookupTextcomp_12604");
		appVariables.recomend.balkony.lodjii.osteklenie = appVariables.recomendationsDone.querySelector("#lookupTextcomp_12603");

		// Стены
		appVariables.recomend.steny = new Object();
		appVariables.recomend.steny.recomend = appVariables.recomendationsDone.querySelector("#comp_12504");
		appVariables.recomend.steny.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12505");
		appVariables.recomend.steny.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12506");
		appVariables.recomend.steny.factObjom = appVariables.recomendationsDone.querySelector("#comp_12348");
		appVariables.recomend.steny.uteplenie = appVariables.recomendationsDone.querySelector("#lookupTextcomp_12602");

		// Подвал
		appVariables.recomend.podval = new Object();
		appVariables.recomend.podval.recomend = appVariables.recomendationsDone.querySelector("#comp_12360");
		appVariables.recomend.podval.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12361");
		appVariables.recomend.podval.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12362");
		appVariables.recomend.podval.factObjom = appVariables.recomendationsDone.querySelector("#comp_12363");

		// Тех.подполье
		appVariables.recomend.tehPodpolie = new Object();
		appVariables.recomend.tehPodpolie.recomend = appVariables.recomendationsDone.querySelector("#comp_12353");
		appVariables.recomend.tehPodpolie.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12507");
		appVariables.recomend.tehPodpolie.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12508");
		appVariables.recomend.tehPodpolie.factObjom = appVariables.recomendationsDone.querySelector("#comp_12509");

		// Тех.этаж
		appVariables.recomend.tehEtaj = new Object();
		appVariables.recomend.tehEtaj.recomend = appVariables.recomendationsDone.querySelector("#comp_12511");
		appVariables.recomend.tehEtaj.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12512");
		appVariables.recomend.tehEtaj.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12513");
		appVariables.recomend.tehEtaj.factObjom = appVariables.recomendationsDone.querySelector("#comp_12514");

		// Гараж стоянка (подземный)
		appVariables.recomend.garage = new Object();
		appVariables.recomend.garage.recomend = appVariables.recomendationsDone.querySelector("#comp_12516");
		appVariables.recomend.garage.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12517");
		appVariables.recomend.garage.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12518");
		appVariables.recomend.garage.factObjom = appVariables.recomendationsDone.querySelector("#comp_12519");

		// Места общего пользования
		appVariables.recomend.mop = new Object();
		for (let i = 1; i < appVariables.mopRows.length; i++) {
			switch (appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent) {
				case "Вестибюли":
					appVariables.recomend.mop.vestibuli = new Object();
					appVariables.recomend.mop.vestibuli.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.vestibuli.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.vestibuli.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.vestibuli.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.vestibuli.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Крыльца":
					appVariables.recomend.mop.krilca = new Object();
					appVariables.recomend.mop.krilca.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.krilca.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.krilca.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.krilca.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.krilca.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Пандусы наружные":
					appVariables.recomend.mop.pandusyNaruzh = new Object();
					appVariables.recomend.mop.pandusyNaruzh.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.pandusyNaruzh.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.pandusyNaruzh.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.pandusyNaruzh.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.pandusyNaruzh.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Пандусы внутриподъездные":
					appVariables.recomend.mop.pandusyVnutr = new Object();
					appVariables.recomend.mop.pandusyVnutr.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.pandusyVnutr.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.pandusyVnutr.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.pandusyVnutr.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.pandusyVnutr.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Сходы/съезды":
					appVariables.recomend.mop.shodySiezdy = new Object();
					appVariables.recomend.mop.shodySiezdy.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.shodySiezdy.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.shodySiezdy.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.shodySiezdy.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.shodySiezdy.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Окна, двери":
					appVariables.recomend.mop.oknaDveri = new Object();
					appVariables.recomend.mop.oknaDveri.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.oknaDveri.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.oknaDveri.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.oknaDveri.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.oknaDveri.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Внутренняя отделка помещений":
					appVariables.recomend.mop.vnOtdelkaPomesh = new Object();
					appVariables.recomend.mop.vnOtdelkaPomesh.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.vnOtdelkaPomesh.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.vnOtdelkaPomesh.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.vnOtdelkaPomesh.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.vnOtdelkaPomesh.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
				case "Все элементы":
					appVariables.recomend.mop.vseElementy = new Object();
					appVariables.recomend.mop.vseElementy.name = appVariables.mopRows[i].querySelector("#lookupTextcomp_12520").textContent;
					appVariables.recomend.mop.vseElementy.recomend = appVariables.mopRows[i].querySelector("#comp_12521");
					appVariables.recomend.mop.vseElementy.trebObjom = appVariables.mopRows[i].querySelector("#comp_12522");
					appVariables.recomend.mop.vseElementy.vypolnenGod = appVariables.mopRows[i].querySelector("#comp_12523");
					appVariables.recomend.mop.vseElementy.factObjom = appVariables.mopRows[i].querySelector("#comp_12524");
					break;
			}
		}

		// Лестницы
		appVariables.recomend.lestnicy = new Object();
		appVariables.recomend.lestnicy.recomend = appVariables.recomendationsDone.querySelector("#comp_12526");
		appVariables.recomend.lestnicy.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12527");
		appVariables.recomend.lestnicy.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12528");
		appVariables.recomend.lestnicy.factObjom = appVariables.recomendationsDone.querySelector("#comp_12529");

		// Перекрытия
		appVariables.recomend.perekritya = new Object();
		appVariables.recomend.perekritya.recomend = appVariables.recomendationsDone.querySelector("#comp_12531");
		appVariables.recomend.perekritya.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12532");
		appVariables.recomend.perekritya.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12533");
		appVariables.recomend.perekritya.factObjom = appVariables.recomendationsDone.querySelector("#comp_12534");

		// Система отопления
		appVariables.recomend.sistemaOtoplenia = new Object();
		for (let i = 1; i < appVariables.heatSystemRows.length; i++) {
			switch (appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.recomend.sistemaOtoplenia.tehPodpolie = new Object();
					appVariables.recomend.sistemaOtoplenia.tehPodpolie.name = appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent;
					appVariables.recomend.sistemaOtoplenia.tehPodpolie.recomend = appVariables.heatSystemRows[i].querySelector("#comp_12536");
					appVariables.recomend.sistemaOtoplenia.tehPodpolie.trebObjom = appVariables.heatSystemRows[i].querySelector("#comp_12537");
					appVariables.recomend.sistemaOtoplenia.tehPodpolie.vypolnenGod = appVariables.heatSystemRows[i].querySelector("#comp_12538");
					appVariables.recomend.sistemaOtoplenia.tehPodpolie.factObjom = appVariables.heatSystemRows[i].querySelector("#comp_12539");
					break;
				case "Транзит питающий":
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush = new Object();
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush.name = appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent;
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush.recomend = appVariables.heatSystemRows[i].querySelector("#comp_12536");
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush.trebObjom = appVariables.heatSystemRows[i].querySelector("#comp_12537");
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush.vypolnenGod = appVariables.heatSystemRows[i].querySelector("#comp_12538");
					appVariables.recomend.sistemaOtoplenia.tranzitPitaush.factObjom = appVariables.heatSystemRows[i].querySelector("#comp_12539");
					break;
				case "Чердак":
					appVariables.recomend.sistemaOtoplenia.cherdak = new Object();
					appVariables.recomend.sistemaOtoplenia.cherdak.name = appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent;
					appVariables.recomend.sistemaOtoplenia.cherdak.recomend = appVariables.heatSystemRows[i].querySelector("#comp_12536");
					appVariables.recomend.sistemaOtoplenia.cherdak.trebObjom = appVariables.heatSystemRows[i].querySelector("#comp_12537");
					appVariables.recomend.sistemaOtoplenia.cherdak.vypolnenGod = appVariables.heatSystemRows[i].querySelector("#comp_12538");
					appVariables.recomend.sistemaOtoplenia.cherdak.factObjom = appVariables.heatSystemRows[i].querySelector("#comp_12539");
					break;
				case "Этажи":
					appVariables.recomend.sistemaOtoplenia.etaji = new Object();
					appVariables.recomend.sistemaOtoplenia.etaji.name = appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent;
					appVariables.recomend.sistemaOtoplenia.etaji.recomend = appVariables.heatSystemRows[i].querySelector("#comp_12536");
					appVariables.recomend.sistemaOtoplenia.etaji.trebObjom = appVariables.heatSystemRows[i].querySelector("#comp_12537");
					appVariables.recomend.sistemaOtoplenia.etaji.vypolnenGod = appVariables.heatSystemRows[i].querySelector("#comp_12538");
					appVariables.recomend.sistemaOtoplenia.etaji.factObjom = appVariables.heatSystemRows[i].querySelector("#comp_12539");
					break;
				case "Вся система":
					appVariables.recomend.sistemaOtoplenia.vsaSistema = new Object();
					appVariables.recomend.sistemaOtoplenia.vsaSistema.name = appVariables.heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent;
					appVariables.recomend.sistemaOtoplenia.vsaSistema.recomend = appVariables.heatSystemRows[i].querySelector("#comp_12536");
					appVariables.recomend.sistemaOtoplenia.vsaSistema.trebObjom = appVariables.heatSystemRows[i].querySelector("#comp_12537");
					appVariables.recomend.sistemaOtoplenia.vsaSistema.vypolnenGod = appVariables.heatSystemRows[i].querySelector("#comp_12538");
					appVariables.recomend.sistemaOtoplenia.vsaSistema.factObjom = appVariables.heatSystemRows[i].querySelector("#comp_12539");
					break;
			}
		}

		// ГВС
		appVariables.recomend.gvs = new Object();
		for (let i = 1; i < appVariables.gvsRows.length; i++) {
			switch (appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.recomend.gvs.tehPodpolie = new Object();
					appVariables.recomend.gvs.tehPodpolie.name = appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent;
					appVariables.recomend.gvs.tehPodpolie.recomend = appVariables.gvsRows[i].querySelector("#comp_12541");
					appVariables.recomend.gvs.tehPodpolie.trebObjom = appVariables.gvsRows[i].querySelector("#comp_12542");
					appVariables.recomend.gvs.tehPodpolie.vypolnenGod = appVariables.gvsRows[i].querySelector("#comp_12543");
					appVariables.recomend.gvs.tehPodpolie.factObjom = appVariables.gvsRows[i].querySelector("#comp_12544");
					break;
				case "Транзит питающий":
					appVariables.recomend.gvs.tranzitPitaush = new Object();
					appVariables.recomend.gvs.tranzitPitaush.name = appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent;
					appVariables.recomend.gvs.tranzitPitaush.recomend = appVariables.gvsRows[i].querySelector("#comp_12541");
					appVariables.recomend.gvs.tranzitPitaush.trebObjom = appVariables.gvsRows[i].querySelector("#comp_12542");
					appVariables.recomend.gvs.tranzitPitaush.vypolnenGod = appVariables.gvsRows[i].querySelector("#comp_12543");
					appVariables.recomend.gvs.tranzitPitaush.factObjom = appVariables.gvsRows[i].querySelector("#comp_12544");
					break;
				case "Чердак":
					appVariables.recomend.gvs.cherdak = new Object();
					appVariables.recomend.gvs.cherdak.name = appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent;
					appVariables.recomend.gvs.cherdak.recomend = appVariables.gvsRows[i].querySelector("#comp_12541");
					appVariables.recomend.gvs.cherdak.trebObjom = appVariables.gvsRows[i].querySelector("#comp_12542");
					appVariables.recomend.gvs.cherdak.vypolnenGod = appVariables.gvsRows[i].querySelector("#comp_12543");
					appVariables.recomend.gvs.cherdak.factObjom = appVariables.gvsRows[i].querySelector("#comp_12544");
					break;
				case "Этажи":
					appVariables.recomend.gvs.etaji = new Object();
					appVariables.recomend.gvs.etaji.name = appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent;
					appVariables.recomend.gvs.etaji.recomend = appVariables.gvsRows[i].querySelector("#comp_12541");
					appVariables.recomend.gvs.etaji.trebObjom = appVariables.gvsRows[i].querySelector("#comp_12542");
					appVariables.recomend.gvs.etaji.vypolnenGod = appVariables.gvsRows[i].querySelector("#comp_12543");
					appVariables.recomend.gvs.etaji.factObjom = appVariables.gvsRows[i].querySelector("#comp_12544");
					break;
				case "Вся система":
					appVariables.recomend.gvs.vsaSistema = new Object();
					appVariables.recomend.gvs.vsaSistema.name = appVariables.gvsRows[i].querySelector("#lookupTextcomp_12540").textContent;
					appVariables.recomend.gvs.vsaSistema.recomend = appVariables.gvsRows[i].querySelector("#comp_12541");
					appVariables.recomend.gvs.vsaSistema.trebObjom = appVariables.gvsRows[i].querySelector("#comp_12542");
					appVariables.recomend.gvs.vsaSistema.vypolnenGod = appVariables.gvsRows[i].querySelector("#comp_12543");
					appVariables.recomend.gvs.vsaSistema.factObjom = appVariables.gvsRows[i].querySelector("#comp_12544");
					break;
			}
		}

		// ХВС
		appVariables.recomend.hvs = new Object();
		for (let i = 1; i < appVariables.hvsRows.length; i++) {
			switch (appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.recomend.hvs.tehPodpolie = new Object();
					appVariables.recomend.hvs.tehPodpolie.name = appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent;
					appVariables.recomend.hvs.tehPodpolie.recomend = appVariables.hvsRows[i].querySelector("#comp_12546");
					appVariables.recomend.hvs.tehPodpolie.trebObjom = appVariables.hvsRows[i].querySelector("#comp_12547");
					appVariables.recomend.hvs.tehPodpolie.vypolnenGod = appVariables.hvsRows[i].querySelector("#comp_12548");
					appVariables.recomend.hvs.tehPodpolie.factObjom = appVariables.hvsRows[i].querySelector("#comp_12549");
					break;
				case "Транзит питающий":
					appVariables.recomend.hvs.tranzitPitaush = new Object();
					appVariables.recomend.hvs.tranzitPitaush.name = appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent;
					appVariables.recomend.hvs.tranzitPitaush.recomend = appVariables.hvsRows[i].querySelector("#comp_12546");
					appVariables.recomend.hvs.tranzitPitaush.trebObjom = appVariables.hvsRows[i].querySelector("#comp_12547");
					appVariables.recomend.hvs.tranzitPitaush.vypolnenGod = appVariables.hvsRows[i].querySelector("#comp_12548");
					appVariables.recomend.hvs.tranzitPitaush.factObjom = appVariables.hvsRows[i].querySelector("#comp_12549");
					break;
				case "Этажи":
					appVariables.recomend.hvs.etaji = new Object();
					appVariables.recomend.hvs.etaji.name = appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent;
					appVariables.recomend.hvs.etaji.recomend = appVariables.hvsRows[i].querySelector("#comp_12546");
					appVariables.recomend.hvs.etaji.trebObjom = appVariables.hvsRows[i].querySelector("#comp_12547");
					appVariables.recomend.hvs.etaji.vypolnenGod = appVariables.hvsRows[i].querySelector("#comp_12548");
					appVariables.recomend.hvs.etaji.factObjom = appVariables.hvsRows[i].querySelector("#comp_12549");
					break;
				case "Внутренний пожарный водопровод":
					appVariables.recomend.hvs.vnPojarTrubopr = new Object();
					appVariables.recomend.hvs.vnPojarTrubopr.name = appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent;
					appVariables.recomend.hvs.vnPojarTrubopr.recomend = appVariables.hvsRows[i].querySelector("#comp_12546");
					appVariables.recomend.hvs.vnPojarTrubopr.trebObjom = appVariables.hvsRows[i].querySelector("#comp_12547");
					appVariables.recomend.hvs.vnPojarTrubopr.vypolnenGod = appVariables.hvsRows[i].querySelector("#comp_12548");
					appVariables.recomend.hvs.vnPojarTrubopr.factObjom = appVariables.hvsRows[i].querySelector("#comp_12549");
					break;
				case "Вся система":
					appVariables.recomend.hvs.vsaSistema = new Object();
					appVariables.recomend.hvs.vsaSistema.name = appVariables.hvsRows[i].querySelector("#lookupTextcomp_12545").textContent;
					appVariables.recomend.hvs.vsaSistema.recomend = appVariables.hvsRows[i].querySelector("#comp_12546");
					appVariables.recomend.hvs.vsaSistema.trebObjom = appVariables.hvsRows[i].querySelector("#comp_12547");
					appVariables.recomend.hvs.vsaSistema.vypolnenGod = appVariables.hvsRows[i].querySelector("#comp_12548");
					appVariables.recomend.hvs.vsaSistema.factObjom = appVariables.hvsRows[i].querySelector("#comp_12549");
					break;
			}
		}

		// Канализация
		appVariables.recomend.kanalizacia = new Object();
		for (let i = 1; i < appVariables.sewerRows.length; i++) {
			switch (appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12550").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.recomend.kanalizacia.tehPodpolie = new Object();
					appVariables.recomend.kanalizacia.tehPodpolie.name = appVariables.sewerRows[i].querySelector("#lookupTextcomp_12550").textContent;
					appVariables.recomend.kanalizacia.tehPodpolie.recomend = appVariables.sewerRows[i].querySelector("#comp_12551");
					appVariables.recomend.kanalizacia.tehPodpolie.trebObjom = appVariables.sewerRows[i].querySelector("#comp_12552");
					appVariables.recomend.kanalizacia.tehPodpolie.vypolnenGod = appVariables.sewerRows[i].querySelector("#comp_12553");
					appVariables.recomend.kanalizacia.tehPodpolie.factObjom = appVariables.sewerRows[i].querySelector("#comp_12554");
					break;
				case "Этажи":
					appVariables.recomend.kanalizacia.etaji = new Object();
					appVariables.recomend.kanalizacia.etaji.name = appVariables.sewerRows[i].querySelector("#lookupTextcomp_12550").textContent;
					appVariables.recomend.kanalizacia.etaji.recomend = appVariables.sewerRows[i].querySelector("#comp_12551");
					appVariables.recomend.kanalizacia.etaji.trebObjom = appVariables.sewerRows[i].querySelector("#comp_12552");
					appVariables.recomend.kanalizacia.etaji.vypolnenGod = appVariables.sewerRows[i].querySelector("#comp_12553");
					appVariables.recomend.kanalizacia.etaji.factObjom = appVariables.sewerRows[i].querySelector("#comp_12554");
					break;
				case "Вся система":
					appVariables.recomend.kanalizacia.vsaSistema = new Object();
					appVariables.recomend.kanalizacia.vsaSistema.name = appVariables.sewerRows[i].querySelector("#lookupTextcomp_12550").textContent;
					appVariables.recomend.kanalizacia.vsaSistema.recomend = appVariables.sewerRows[i].querySelector("#comp_12551");
					appVariables.recomend.kanalizacia.vsaSistema.trebObjom = appVariables.sewerRows[i].querySelector("#comp_12552");
					appVariables.recomend.kanalizacia.vsaSistema.vypolnenGod = appVariables.sewerRows[i].querySelector("#comp_12553");
					appVariables.recomend.kanalizacia.vsaSistema.factObjom = appVariables.sewerRows[i].querySelector("#comp_12554");
					break;
			}
		}

		// Мусоропроводы
		appVariables.recomend.musoroprovody = new Object();
		appVariables.recomend.musoroprovody.recomend = appVariables.recomendationsDone.querySelector("#comp_12556");
		appVariables.recomend.musoroprovody.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12557");
		appVariables.recomend.musoroprovody.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12558");
		appVariables.recomend.musoroprovody.factObjom = appVariables.recomendationsDone.querySelector("#comp_12559");

		// Система промывки и прочистки стволов мусоропроводов
		appVariables.recomend.musoroChistSistema = new Object();
		appVariables.recomend.musoroChistSistema.recomend = appVariables.recomendationsDone.querySelector("#comp_12561");
		appVariables.recomend.musoroChistSistema.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12562");
		appVariables.recomend.musoroChistSistema.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12563");
		appVariables.recomend.musoroChistSistema.factObjom = appVariables.recomendationsDone.querySelector("#comp_12564");

		// Вентиляц.
		appVariables.recomend.ventilacia = new Object();
		appVariables.recomend.ventilacia.recomend = appVariables.recomendationsDone.querySelector("#comp_12566");
		appVariables.recomend.ventilacia.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12567");
		appVariables.recomend.ventilacia.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12568");
		appVariables.recomend.ventilacia.factObjom = appVariables.recomendationsDone.querySelector("#comp_12569");

		// Газоходы
		appVariables.recomend.gazohody = new Object();
		appVariables.recomend.gazohody.recomend = appVariables.recomendationsDone.querySelector("#comp_12576");
		appVariables.recomend.gazohody.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12577");
		appVariables.recomend.gazohody.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12578");
		appVariables.recomend.gazohody.factObjom = appVariables.recomendationsDone.querySelector("#comp_12579");

		// Лифты
		appVariables.recomend.lifty = new Object();
		appVariables.recomend.lifty.recomend = appVariables.recomendationsDone.querySelector("#comp_12581");
		appVariables.recomend.lifty.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12582");
		appVariables.recomend.lifty.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12583");
		appVariables.recomend.lifty.factObjom = appVariables.recomendationsDone.querySelector("#comp_12584");

		// Подъёмное устройство для маломобильной группы населения
		appVariables.recomend.podyomnik = new Object();
		appVariables.recomend.podyomnik.recomend = appVariables.recomendationsDone.querySelector("#comp_12586");
		appVariables.recomend.podyomnik.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12587");
		appVariables.recomend.podyomnik.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12588");
		appVariables.recomend.podyomnik.factObjom = appVariables.recomendationsDone.querySelector("#comp_12589");

		// Устройство для автоматического опускания лифта
		appVariables.recomend.autoSpuskLift = new Object();
		appVariables.recomend.autoSpuskLift.recomend = appVariables.recomendationsDone.querySelector("#comp_12591");
		appVariables.recomend.autoSpuskLift.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12592");
		appVariables.recomend.autoSpuskLift.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12593");
		appVariables.recomend.autoSpuskLift.factObjom = appVariables.recomendationsDone.querySelector("#comp_12594");

		// Система ЭС (ВРУ)
		appVariables.recomend.systemEs = new Object();
		appVariables.recomend.systemEs.recomend = appVariables.recomendationsDone.querySelector("#comp_12596");
		appVariables.recomend.systemEs.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12597");
		appVariables.recomend.systemEs.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12598");
		appVariables.recomend.systemEs.factObjom = appVariables.recomendationsDone.querySelector("#comp_12599");

		// ВКВ (второй кабельный ввод)
		appVariables.recomend.vkv = new Object();
		appVariables.recomend.vkv.recomend = appVariables.recomendationsDone.querySelector("#comp_12436");
		appVariables.recomend.vkv.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12437");
		appVariables.recomend.vkv.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12438");
		appVariables.recomend.vkv.factObjom = appVariables.recomendationsDone.querySelector("#comp_12439");

		// АВР (автоматическое включение резервного питания)
		appVariables.recomend.avr = new Object();
		appVariables.recomend.avr.recomend = appVariables.recomendationsDone.querySelector("#comp_12441");
		appVariables.recomend.avr.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12442");
		appVariables.recomend.avr.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12443");
		appVariables.recomend.avr.factObjom = appVariables.recomendationsDone.querySelector("#comp_12404");

		// ППАиДУ
		appVariables.recomend.ppaidu = new Object();
		appVariables.recomend.ppaidu.recomend = appVariables.recomendationsDone.querySelector("#comp_12406");
		appVariables.recomend.ppaidu.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12407");
		appVariables.recomend.ppaidu.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12408");
		appVariables.recomend.ppaidu.factObjom = appVariables.recomendationsDone.querySelector("#comp_12409");

		// Система оповещения о пожаре
		appVariables.recomend.pozharOpoveshen = new Object();
		appVariables.recomend.pozharOpoveshen.recomend = appVariables.recomendationsDone.querySelector("#comp_12411");
		appVariables.recomend.pozharOpoveshen.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12412");
		appVariables.recomend.pozharOpoveshen.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12413");
		appVariables.recomend.pozharOpoveshen.factObjom = appVariables.recomendationsDone.querySelector("#comp_12414");

		// ГС
		appVariables.recomend.gs = new Object();
		appVariables.recomend.gs.recomend = appVariables.recomendationsDone.querySelector("#comp_12416");
		appVariables.recomend.gs.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12417");
		appVariables.recomend.gs.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12418");
		appVariables.recomend.gs.factObjom = appVariables.recomendationsDone.querySelector("#comp_12419");

		// Связь с ОДС
		appVariables.recomend.ods = new Object();
		appVariables.recomend.ods.recomend = appVariables.recomendationsDone.querySelector("#comp_12421");
		appVariables.recomend.ods.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12422");
		appVariables.recomend.ods.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12423");
		appVariables.recomend.ods.factObjom = appVariables.recomendationsDone.querySelector("#comp_12424");

		// Система видеонаблюдения
		appVariables.recomend.videonab = new Object();
		appVariables.recomend.videonab.recomend = appVariables.recomendationsDone.querySelector("#comp_12426");
		appVariables.recomend.videonab.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12427");
		appVariables.recomend.videonab.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12428");
		appVariables.recomend.videonab.factObjom = appVariables.recomendationsDone.querySelector("#comp_12429");

		// ОЗДС(охранно-защитная дератизационная система)
		appVariables.recomend.ozds = new Object();
		appVariables.recomend.ozds.recomend = appVariables.recomendationsDone.querySelector("#comp_12431");
		appVariables.recomend.ozds.trebObjom = appVariables.recomendationsDone.querySelector("#comp_12432");
		appVariables.recomend.ozds.vypolnenGod = appVariables.recomendationsDone.querySelector("#comp_12423");
		appVariables.recomend.ozds.factObjom = appVariables.recomendationsDone.querySelector("#comp_12424");

		// Общий вывод: Рекомендации по выполнению объемов капитального ремонта
		appVariables.recomend.obshiyVivod = appVariables.recomendationsDone.querySelector("#lookupTextcomp_12435");

		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		for (let i = 1; i < appVariables.resultsRoofRows.length; i++) {
			if (!appVariables.resultsRoofRows[i].querySelector("#comp_12642")) {
				continue;
			}

			switch (appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent) {
				case "Кровля":
					appVariables.krovlyaName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.krovlyaDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.krovlyaPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.krovlyaProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.krovlyaOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
				case "Свесы":
					appVariables.svesyName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.svesyDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.svesyPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.svesyProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.svesyOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
				case "Стропильная система":
					appVariables.stropilnayaSistemaName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.stropilnayaSistemaDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.stropilnayaSistemaPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.stropilnayaSistemaProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.stropilnayaSistemaOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
				case "Чердак":
					appVariables.cherdakName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.cherdakDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.cherdakPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.cherdakProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.cherdakOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
				case "Покрытие ж/б":
					appVariables.pokritieJBName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.pokritieJBDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.pokritieJBPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.pokritieJBProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.pokritieJBOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
				case "Все элементы":
					appVariables.vsyaKrishaName = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent;
					appVariables.vsyaKrishaDefecty = appVariables.resultsRoofRows[i].querySelector("#comp_12642");
					appVariables.vsyaKrishaPercent = appVariables.resultsRoofRows[i].querySelector("#comp_12644");
					appVariables.vsyaKrishaProshlOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12643");
					appVariables.vsyaKrishaOcenka = appVariables.resultsRoofRows[i].querySelector("#lookupTextcomp_12645");

					break;
			}
		}
		appVariables.roofConstruction = appVariables.results.querySelector("#lookupTextcomp_12453");
		appVariables.roofMaterial = appVariables.results.querySelector("#lookupTextcomp_12454");
		appVariables.roofSquare = appVariables.results.querySelector("#comp_12455");

		// Водоотвод
		appVariables.vodootvodDefecty = appVariables.results.querySelector("#comp_12647");
		appVariables.vodootvodPercent = appVariables.results.querySelector("#comp_12649");
		appVariables.vodootvodProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12648");
		appVariables.vodootvodOcenka = appVariables.results.querySelector("#lookupTextcomp_12650");
		appVariables.vodootvodType = appVariables.results.querySelector("#lookupTextcomp_12456");
		appVariables.vodootvodMaterial = appVariables.results.querySelector("#lookupTextcomp_12457");

		// Межпанельные стыки
		appVariables.majpanelnyeStykiDefecty = appVariables.results.querySelector("#comp_12652");
		appVariables.majpanelnyeStykiPercent = appVariables.results.querySelector("#comp_12654");
		appVariables.majpanelnyeStykiProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12653");
		appVariables.majpanelnyeStykiOcenka = appVariables.results.querySelector("#lookupTextcomp_12655");
		appVariables.majpanelnyeStykiType = appVariables.results.querySelector("#lookupTextcomp_12458");

		// Фасад
		appVariables.fasadDefecty = appVariables.results.querySelector("#comp_12657");
		appVariables.fasadPercent = appVariables.results.querySelector("#comp_12659");
		appVariables.fasadProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12658");
		appVariables.fasadOcenka = appVariables.results.querySelector("#lookupTextcomp_12660");
		appVariables.fasadSquare = appVariables.results.querySelector("#comp_12459");
		appVariables.fasadOtdelkaSten = appVariables.results.querySelector("#lookupTextcomp_12460");
		appVariables.fasadOblicovkaTsokolya = appVariables.results.querySelector("#lookupTextcomp_12461");
		appVariables.fasadOkonnyeZapolneniya = appVariables.results.querySelector("#lookupTextcomp_12462");

		// Балконы
		for (let i = 1; i < appVariables.resultsBalconyRows.length; i++) {
			if (!appVariables.resultsBalconyRows[i].querySelector("#comp_12736")) {
				continue;
			}

			switch (appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent) {
				case "Балконы":
					appVariables.balkonyName = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent;
					appVariables.balkonyDefecty = appVariables.resultsBalconyRows[i].querySelector("#comp_12736");
					appVariables.balkonyPercent = appVariables.resultsBalconyRows[i].querySelector("#comp_12738");
					appVariables.balkonyProshlOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12737");
					appVariables.balkonyOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12739");

					break;
				case "Лоджии":
					appVariables.lodjiiName = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent;
					appVariables.lodjiiDefecty = appVariables.resultsBalconyRows[i].querySelector("#comp_12736");
					appVariables.lodjiiPercent = appVariables.resultsBalconyRows[i].querySelector("#comp_12738");
					appVariables.lodjiiProshlOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12737");
					appVariables.lodjiiOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12739");

					break;
				case "Козырьки":
					appVariables.kozirkiName = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent;
					appVariables.kozirkiDefecty = appVariables.resultsBalconyRows[i].querySelector("#comp_12736");
					appVariables.kozirkiPercent = appVariables.resultsBalconyRows[i].querySelector("#comp_12738");
					appVariables.kozirkiProshlOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12737");
					appVariables.kozirkiOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12739");

					break;
				case "Эркеры":
					appVariables.erkeryName = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent;
					appVariables.erkeryDefecty = appVariables.resultsBalconyRows[i].querySelector("#comp_12736");
					appVariables.erkeryPercent = appVariables.resultsBalconyRows[i].querySelector("#comp_12738");
					appVariables.erkeryProshlOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12737");
					appVariables.erkeryOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12739");

					break;
				case "Все элементы":
					appVariables.vseBalkonyName = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent;
					appVariables.vseBalkonyDefecty = appVariables.resultsBalconyRows[i].querySelector("#comp_12736");
					appVariables.vseBalkonyPercent = appVariables.resultsBalconyRows[i].querySelector("#comp_12738");
					appVariables.vseBalkonyProshlOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12737");
					appVariables.vseBalkonyOcenka = appVariables.resultsBalconyRows[i].querySelector("#lookupTextcomp_12739");

					break;
			}
		}
		appVariables.balkonyKolich = appVariables.results.querySelector("#comp_12463");
		appVariables.balkonyLojii = appVariables.results.querySelector("#comp_12464");
		appVariables.balkonyKozirkovVhody = appVariables.results.querySelector("#comp_12465");
		appVariables.balkonyKozirkovVerh = appVariables.results.querySelector("#comp_12466");
		appVariables.balkonyKozirkovNeproekt = appVariables.results.querySelector("#comp_12467");
		appVariables.balkonyErkerovKolich = appVariables.results.querySelector("#comp_12468");

		// Стены
		appVariables.stenyDefecty = appVariables.results.querySelector("#comp_12624");
		appVariables.stenyPercent = appVariables.results.querySelector("#comp_12626");
		appVariables.stenyProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12625");
		appVariables.stenyOcenka = appVariables.results.querySelector("#lookupTextcomp_12672");
		appVariables.stenyMaterial = appVariables.results.querySelector("#lookupTextcomp_12444");
		appVariables.stenyTeploFizSvoistva = appVariables.results.querySelector("#lookupTextcomp_12445");

		// Подвал
		appVariables.podvalDefecty = appVariables.results.querySelector("#comp_12628");
		appVariables.podvalPercent = appVariables.results.querySelector("#comp_12630");
		appVariables.podvalProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12629");
		appVariables.podvalOcenka = appVariables.results.querySelector("#lookupTextcomp_12631");
		appVariables.podvalNalichie = appVariables.results.querySelector("#lookupTextcomp_12446");
		appVariables.podvalSquare = appVariables.results.querySelector("#comp_12447");

		// Тех.подполье
		appVariables.techPodpolieDefecty = appVariables.results.querySelector("#comp_12633");
		appVariables.techPodpoliePercent = appVariables.results.querySelector("#comp_12635");
		appVariables.techPodpolieProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12634");
		appVariables.techPodpolieOcenka = appVariables.results.querySelector("#lookupTextcomp_12636");
		appVariables.techPodpolieNalichie = appVariables.results.querySelector("#lookupTextcomp_12448");

		// Тех.этаж
		appVariables.techEtajDefecty = appVariables.results.querySelector("#comp_12638");
		appVariables.techEtajPercent = appVariables.results.querySelector("#comp_12640");
		appVariables.techEtajProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12639");
		appVariables.techEtajOcenka = appVariables.results.querySelector("#lookupTextcomp_12673");
		appVariables.techEtajNalichie = appVariables.results.querySelector("#lookupTextcomp_12449");
		appVariables.techEtajMesto = appVariables.results.querySelector("#comp_12367");

		// Гараж стоянка (подземный)
		appVariables.garageDefecty = appVariables.results.querySelector("#comp_12747");
		appVariables.garagePercent = appVariables.results.querySelector("#comp_12749");
		appVariables.garageProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12748");
		appVariables.garageOcenka = appVariables.results.querySelector("#lookupTextcomp_12750");
		appVariables.garageType = appVariables.results.querySelector("#lookupTextcomp_12450");
		appVariables.garageSquare = appVariables.results.querySelector("#comp_12451");
		appVariables.garageEtagnost = appVariables.results.querySelector("#comp_12452");
		appVariables.garageKolichestvoMashin = appVariables.results.querySelector("#comp_12369");

		// Места общего пользования
		for (let i = 1; i < appVariables.resultsMopRows.length; i++) {
			if (!appVariables.resultsMopRows[i].querySelector("#comp_12752")) {
				continue;
			}

			switch (appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent) {
				case "Вестибюли":
					appVariables.mopVestibuliName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopVestibuliDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopVestibuliPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopVestibuliProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopVestibuliOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Крыльца":
					appVariables.mopKrilcaName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopKrilcaDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopKrilcaPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopKrilcaProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopKrilcaOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Пандусы наружные":
					appVariables.mopPandusyNaruzhnieName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopPandusyNaruzhnieDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopPandusyNaruzhniePercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopPandusyNaruzhnieProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopPandusyNaruzhnieOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Пандусы внутри-подъездные":
					appVariables.mopPandusyVnutrennieName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopPandusyVnutrennieDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopPandusyVnutrenniePercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopPandusyVnutrennieProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopPandusyVnutrennieOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Сходы/съезды":
					appVariables.mopShodySiezdyName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopShodySiezdyDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopShodySiezdyPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopShodySiezdyProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopShodySiezdyOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Окна, двери":
					appVariables.mopOknaDveriName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopOknaDveriDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopOknaDveriPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopOknaDveriProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopOknaDveriOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Внутренняя отделка помещений":
					appVariables.mopVnOtdelkaPomeshName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopVnOtdelkaPomeshDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopVnOtdelkaPomeshPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopVnOtdelkaPomeshProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopVnOtdelkaPomeshOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
				case "Все элементы":
					appVariables.mopVseElementyName = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent;
					appVariables.mopVseElementyDefecty = appVariables.resultsMopRows[i].querySelector("#comp_12752");
					appVariables.mopVseElementyPercent = appVariables.resultsMopRows[i].querySelector("#comp_12754");
					appVariables.mopVseElementyProshlOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12753");
					appVariables.mopVseElementyOcenka = appVariables.resultsMopRows[i].querySelector("#lookupTextcomp_12755");

					break;
			}
		}
		appVariables.mopPandusyNaruzhKolich = appVariables.results.querySelector("#comp_12354");
		appVariables.mopPandusyVnutrKolich = appVariables.results.querySelector("#comp_12355");
		appVariables.mopShodySiezdyKolich = appVariables.results.querySelector("#comp_12356");

		// Лестницы
		appVariables.lestnicyDefecty = appVariables.results.querySelector("#comp_12757");
		appVariables.lestnicyPercent = appVariables.results.querySelector("#comp_12759");
		appVariables.lestnicyProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12758");
		appVariables.lestnicyOcenka = appVariables.results.querySelector("#lookupTextcomp_12674");
		appVariables.lestnicyConstruction = appVariables.results.querySelector("#lookupTextcomp_12370");

		// Перекрытия
		appVariables.perekrityaDefecty = appVariables.results.querySelector("#comp_12761");
		appVariables.perekrityaPercent = appVariables.results.querySelector("#comp_12763");
		appVariables.perekrityaProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12764");
		appVariables.perekrityaOcenka = appVariables.results.querySelector("#lookupTextcomp_12764");
		appVariables.perekrityaMaterial = appVariables.results.querySelector("#lookupTextcomp_12371");

		// Система отопления
		for (let i = 1; i < appVariables.resultsHeatSystemRows.length; i++) {
			if (!appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766")) {
				continue;
			}

			switch (appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.otopleniyeTehPodpolieName = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent;
					appVariables.otopleniyeTehPodpolieDefecty = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766");
					appVariables.otopleniyeTehPodpoliePercent = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12768");
					appVariables.otopleniyeTehPodpolieProshlOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12767");
					appVariables.otopleniyeTehPodpolieOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769");

					break;
				case "Транзит питающий":
					appVariables.otopleniyeTranzitPitaushName = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent;
					appVariables.otopleniyeTranzitPitaushDefecty = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766");
					appVariables.otopleniyeTranzitPitaushPercent = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12768");
					appVariables.otopleniyeTranzitPitaushProshlOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12767");
					appVariables.otopleniyeTranzitPitaushOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769");

					break;
				case "Чердак":
					appVariables.otopleniyeCherdakName = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent;
					appVariables.otopleniyeCherdakDefecty = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766");
					appVariables.otopleniyeCherdakPercent = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12768");
					appVariables.otopleniyeCherdakProshlOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12767");
					appVariables.otopleniyeCherdakOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769");

					break;
				case "Этажи":
					appVariables.otopleniyeEtajiName = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent;
					appVariables.otopleniyeEtajiDefecty = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766");
					appVariables.otopleniyeEtajiPercent = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12768");
					appVariables.otopleniyeEtajiProshlOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12767");
					appVariables.otopleniyeEtajiOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769");

					break;
				case "Вся система":
					appVariables.vseOtopleniyeName = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent;
					appVariables.vseOtopleniyeDefecty = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12766");
					appVariables.vseOtopleniyePercent = appVariables.resultsHeatSystemRows[i].querySelector("#comp_12768");
					appVariables.vseOtopleniyeProshlOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12767");
					appVariables.vseOtopleniyeOcenka = appVariables.resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769");

					break;
			}
		}
		appVariables.otopleniyeVid = appVariables.results.querySelector("#lookupTextcomp_12605");
		appVariables.otopleniyeMaterial = appVariables.results.querySelector("#lookupTextcomp_13393");
		appVariables.otopleniyeTypePribor = appVariables.results.querySelector("#lookupTextcomp_12372");
		appVariables.otopleniyeTermoRegulKvartir = appVariables.results.querySelector("#lookupTextcomp_12373");
		appVariables.otopleniyeAuu = appVariables.results.querySelector("#comp_12374");
		appVariables.otopleniyeOduu = appVariables.results.querySelector("#lookupTextcomp_12375");
		appVariables.otopleniyeElevUzel = appVariables.results.querySelector("#comp_12376");
		appVariables.otopleniyeTeplovoyUzel = appVariables.results.querySelector("#comp_12377");
		appVariables.otopleniyeTypeStoyakov = appVariables.results.querySelector("#lookupTextcomp_12299");

		// ГВС
		for (let i = 1; i < appVariables.resultsGvsRows.length; i++) {
			if (!appVariables.resultsGvsRows[i].querySelector("#comp_12771")) {
				continue;
			}

			switch (appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.gvsTehPodpolieName = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent;
					appVariables.gvsTehPodpolieDefecty = appVariables.resultsGvsRows[i].querySelector("#comp_12771");
					appVariables.gvsTehPodpoliePercent = appVariables.resultsGvsRows[i].querySelector("#comp_12773");
					appVariables.gvsTehPodpolieProshlOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12772");
					appVariables.gvsTehPodpolieOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12675");

					break;
				case "Транзит питающий":
					appVariables.gvsTranzitPitaushName = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent;
					appVariables.gvsTranzitPitaushDefecty = appVariables.resultsGvsRows[i].querySelector("#comp_12771");
					appVariables.gvsTranzitPitaushPercent = appVariables.resultsGvsRows[i].querySelector("#comp_12773");
					appVariables.gvsTranzitPitaushProshlOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12772");
					appVariables.gvsTranzitPitaushOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12675");

					break;
				case "Чердак":
					appVariables.gvsCherdakName = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent;
					appVariables.gvsCherdakDefecty = appVariables.resultsGvsRows[i].querySelector("#comp_12771");
					appVariables.gvsCherdakPercent = appVariables.resultsGvsRows[i].querySelector("#comp_12773");
					appVariables.gvsCherdakProshlOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12772");
					appVariables.gvsCherdakOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12675");

					break;
				case "Этажи":
					appVariables.gvsEtajiName = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent;
					appVariables.gvsEtajiDefecty = appVariables.resultsGvsRows[i].querySelector("#comp_12771");
					appVariables.gvsEtajiPercent = appVariables.resultsGvsRows[i].querySelector("#comp_12773");
					appVariables.gvsEtajiProshlOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12772");
					appVariables.gvsEtajiOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12675");

					break;
				case "Вся система":
					appVariables.vseGvsName = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent;
					appVariables.vseGvsDefecty = appVariables.resultsGvsRows[i].querySelector("#comp_12771");
					appVariables.vseGvsPercent = appVariables.resultsGvsRows[i].querySelector("#comp_12773");
					appVariables.vseGvsProshlOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12772");
					appVariables.vseGvsOcenka = appVariables.resultsGvsRows[i].querySelector("#lookupTextcomp_12675");

					break;
			}
		}
		appVariables.gvsType = appVariables.results.querySelector("#lookupTextcomp_12378");
		appVariables.gvsMaterial = appVariables.results.querySelector("#lookupTextcomp_12379");
		appVariables.gvsOduu = appVariables.results.querySelector("#lookupTextcomp_12380");
		appVariables.gvsTypeStoyakov = appVariables.results.querySelector("#lookupTextcomp_13394");

		// ХВС
		for (let i = 1; i < appVariables.resultsHvsRows.length; i++) {
			if (!appVariables.resultsHvsRows[i].querySelector("#comp_12775")) {
				continue;
			}

			switch (appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.hvsTehPodpolieName = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent;
					appVariables.hvsTehPodpolieDefecty = appVariables.resultsHvsRows[i].querySelector("#comp_12775");
					appVariables.hvsTehPodpoliePercent = appVariables.resultsHvsRows[i].querySelector("#comp_12777");
					appVariables.hvsTehPodpolieProshlOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12776");
					appVariables.hvsTehPodpolieOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12778");

					break;
				case "Транзит питающий":
					appVariables.hvsTranzitPitaushName = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent;
					appVariables.hvsTranzitPitaushDefecty = appVariables.resultsHvsRows[i].querySelector("#comp_12775");
					appVariables.hvsTranzitPitaushPercent = appVariables.resultsHvsRows[i].querySelector("#comp_12777");
					appVariables.hvsTranzitPitaushProshlOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12776");
					appVariables.hvsTranzitPitaushOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12778");

					break;
				case "Этажи":
					appVariables.hvsEtajiName = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent;
					appVariables.hvsEtajiDefecty = appVariables.resultsHvsRows[i].querySelector("#comp_12775");
					appVariables.hvsEtajiPercent = appVariables.resultsHvsRows[i].querySelector("#comp_12777");
					appVariables.hvsEtajiProshlOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12776");
					appVariables.hvsEtajiOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12778");

					break;
				case "Внутренний пожарный водопровод":
					appVariables.hvsVnPozharProvodName = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent;
					appVariables.hvsVnPozharProvodDefecty = appVariables.resultsHvsRows[i].querySelector("#comp_12775");
					appVariables.hvsVnPozharProvodPercent = appVariables.resultsHvsRows[i].querySelector("#comp_12777");
					appVariables.hvsVnPozharProvodProshlOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12776");
					appVariables.hvsVnPozharProvodOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12778");

					break;
				case "Вся система":
					appVariables.vseHvsName = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent;
					appVariables.vseHvsDefecty = appVariables.resultsHvsRows[i].querySelector("#comp_12775");
					appVariables.vseHvsPercent = appVariables.resultsHvsRows[i].querySelector("#comp_12777");
					appVariables.vseHvsProshlOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12776");
					appVariables.vseHvsOcenka = appVariables.resultsHvsRows[i].querySelector("#lookupTextcomp_12778");

					break;
			}
		}
		appVariables.hvsMaterial = appVariables.results.querySelector("#lookupTextcomp_12382");
		appVariables.hvsOduu = appVariables.results.querySelector("#lookupTextcomp_12381");
		appVariables.hvsTypeStoyakov = appVariables.results.querySelector("#lookupTextcomp_13395");

		// Канализация
		for (let i = 1; i < appVariables.resultsSewerRows.length; i++) {
			if (!appVariables.resultsSewerRows[i].querySelector("#comp_12780")) {
				continue;
			}

			switch (appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent) {
				case "Тех.подполье/тех.этаж":
					appVariables.kanalizaciaTehPodpolieName = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent;
					appVariables.kanalizaciaTehPodpolieDefecty = appVariables.resultsSewerRows[i].querySelector("#comp_12780");
					appVariables.kanalizaciaTehPodpoliePercent = appVariables.resultsSewerRows[i].querySelector("#comp_12782");
					appVariables.kanalizaciaTehPodpolieProshlOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12781");
					appVariables.kanalizaciaTehPodpolieOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12783");

					break;
				case "Этажи":
					appVariables.kanalizaciaEtajiName = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent;
					appVariables.kanalizaciaEtajiDefecty = appVariables.resultsSewerRows[i].querySelector("#comp_12780");
					appVariables.kanalizaciaEtajiPercent = appVariables.resultsSewerRows[i].querySelector("#comp_12782");
					appVariables.kanalizaciaEtajiProshlOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12781");
					appVariables.kanalizaciaEtajiOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12783");

					break;
				case "Вся система":
					appVariables.vseKanalizaciaName = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent;
					appVariables.vseKanalizaciaDefecty = appVariables.resultsSewerRows[i].querySelector("#comp_12780");
					appVariables.vseKanalizaciaPercent = appVariables.resultsSewerRows[i].querySelector("#comp_12782");
					appVariables.vseKanalizaciaProshlOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12781");
					appVariables.vseKanalizaciaOcenka = appVariables.resultsSewerRows[i].querySelector("#lookupTextcomp_12783");

					break;
			}
		}
		appVariables.kanalizaciaMaterial = appVariables.results.querySelector("#lookupTextcomp_12383");
		appVariables.kanalizaciaTypeStoyakov = appVariables.results.querySelector("#lookupTextcomp_13396");

		// Мусоропроводы
		appVariables.musoroprovodyDefecty = appVariables.results.querySelector("#comp_12785");
		appVariables.musoroprovodyPercent = appVariables.results.querySelector("#comp_12787");
		appVariables.musoroprovodyProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_12786");
		appVariables.musoroprovodyOcenka = appVariables.results.querySelector("#lookupTextcomp_12788");
		appVariables.musoroprovodyMesto = appVariables.results.querySelector("#lookupTextcomp_12384");
		appVariables.musoroprovodyKamery = appVariables.results.querySelector("#lookupTextcomp_12385");

		// Связь с ОДС
		appVariables.odsDefecty = appVariables.results.querySelector("#comp_12790");
		appVariables.odsPosledneeObsled = appVariables.results.querySelector("#comp_12791");
		appVariables.odsOrganizacia = appVariables.results.querySelector("#comp_12792");
		appVariables.odsProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13401");
		appVariables.odsOcenka = appVariables.results.querySelector("#lookupTextcomp_12793");
		appVariables.odsType = appVariables.results.querySelector("#lookupTextcomp_12386");
		appVariables.odsSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12607");

		// Вентиляция
		appVariables.ventilaciaDefecty = appVariables.results.querySelector("#comp_12795");
		appVariables.ventilaciaPosledneeObsled = appVariables.results.querySelector("#comp_12796");
		appVariables.ventilaciaOrganizacia = appVariables.results.querySelector("#comp_12797");
		appVariables.ventilaciaProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13402");
		appVariables.ventilaciaOcenka = appVariables.results.querySelector("#lookupTextcomp_12798");
		appVariables.ventilaciaSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12608");

		// Система промывки и прочистки стволов мусоропроводов
		appVariables.musoroChistSistemaDefecty = appVariables.results.querySelector("#comp_12800");
		appVariables.musoroChistSistemaPosledObsled = appVariables.results.querySelector("#comp_12801");
		appVariables.musoroChistSistemaOrganizacia = appVariables.results.querySelector("#comp_12802");
		appVariables.musoroChistSistemaProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13403");
		appVariables.musoroChistSistemaOcenka = appVariables.results.querySelector("#lookupTextcomp_12803");
		appVariables.musoroChistSistemaNalichie = appVariables.results.querySelector("#lookupTextcomp_12387");
		appVariables.musoroChistSistemaSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12609");

		// ОЗДС (охранно-защитная дератизационная система)
		appVariables.ozdsDefecty = appVariables.results.querySelector("#comp_12677");
		appVariables.ozdsPosledObsled = appVariables.results.querySelector("#comp_12678");
		appVariables.ozdsOrganizacia = appVariables.results.querySelector("#comp_12679");
		appVariables.ozdsProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13404");
		appVariables.ozdsOcenka = appVariables.results.querySelector("#lookupTextcomp_12680");
		appVariables.ozdsNalichie = appVariables.results.querySelector("#lookupTextcomp_12388");
		appVariables.ozdsSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12610");

		// Газоходы
		appVariables.gazohodyDefecty = appVariables.results.querySelector("#comp_12687");
		appVariables.gazohodyPosledObsled = appVariables.results.querySelector("#comp_12688");
		appVariables.gazohodyOrganizacia = appVariables.results.querySelector("#comp_12689");
		appVariables.gazohodyProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13405");
		appVariables.gazohodyOcenka = appVariables.results.querySelector("#lookupTextcomp_12690");
		appVariables.gazohodyNalichie = appVariables.results.querySelector("#lookupTextcomp_12390");
		appVariables.gazohodySostoyanie = appVariables.results.querySelector("#lookupTextcomp_12612");

		// Лифты
		appVariables.liftyDefecty = appVariables.results.querySelector("#comp_12692");
		appVariables.liftyPosledObsled = appVariables.results.querySelector("#comp_12693");
		appVariables.liftyOrganizacia = appVariables.results.querySelector("#comp_12694");
		appVariables.liftyProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13406");
		appVariables.liftyOcenka = appVariables.results.querySelector("#lookupTextcomp_12695");
		appVariables.liftyPass = appVariables.results.querySelector("#comp_12391");
		appVariables.liftyGruzPass = appVariables.results.querySelector("#comp_12392");
		appVariables.liftyNavesnye = appVariables.results.querySelector("#comp_12393");
		appVariables.liftySostoyanie = appVariables.results.querySelector("#lookupTextcomp_12613");

		// Подъёмное устройство для маломобильной группы населения
		appVariables.podyomnikDefecty = appVariables.results.querySelector("#comp_12697");
		appVariables.podyomnikPosledObsled = appVariables.results.querySelector("#comp_12698");
		appVariables.podyomnikOrganizacia = appVariables.results.querySelector("#comp_12699");
		appVariables.podyomnikProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13407");
		appVariables.podyomnikOcenka = appVariables.results.querySelector("#lookupTextcomp_12700");
		appVariables.podyomnikKolich = appVariables.results.querySelector("#comp_12394");
		appVariables.podyomnikSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12614");

		// Устройство для автоматического опускания лифта
		appVariables.autoSpuskLiftDefecty = appVariables.results.querySelector("#comp_12702");
		appVariables.autoSpuskLiftPosledObsled = appVariables.results.querySelector("#comp_12703");
		appVariables.autoSpuskLiftOrganizacia = appVariables.results.querySelector("#comp_12704");
		appVariables.autoSpuskLiftProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13408");
		appVariables.autoSpuskLiftOcenka = appVariables.results.querySelector("#lookupTextcomp_12705");
		appVariables.autoSpuskLiftNalichie = appVariables.results.querySelector("#lookupTextcomp_12395");
		appVariables.autoSpuskLiftSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12615");

		// Система ЭС
		appVariables.systemEsDefecty = appVariables.results.querySelector("#comp_12707");
		appVariables.systemEsPosledObsled = appVariables.results.querySelector("#comp_12708");
		appVariables.systemEsOrganizacia = appVariables.results.querySelector("#comp_12709");
		appVariables.systemEsProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13409");
		appVariables.systemEsOcenka = appVariables.results.querySelector("#lookupTextcomp_12710");
		appVariables.systemEsKolich = appVariables.results.querySelector("#comp_12397");
		appVariables.systemEsRazmeshenie = appVariables.results.querySelector("#lookupTextcomp_12396");
		appVariables.systemEsSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12616");

		// ВКВ (второй кабельный ввод)
		appVariables.vkvDefecty = appVariables.results.querySelector("#comp_12712");
		appVariables.vkvPosledObsled = appVariables.results.querySelector("#comp_12713");
		appVariables.vkvOrganizacia = appVariables.results.querySelector("#comp_12714");
		appVariables.vkvProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13410");
		appVariables.vkvOcenka = appVariables.results.querySelector("#lookupTextcomp_12715");
		appVariables.vkvNalichie = appVariables.results.querySelector("#lookupTextcomp_12398");
		appVariables.vkvSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12622");

		// АВР (автоматическое включение резервного питания)
		appVariables.avrDefecty = appVariables.results.querySelector("#comp_12717");
		appVariables.avrPosledObsled = appVariables.results.querySelector("#comp_12718");
		appVariables.avrOrganizacia = appVariables.results.querySelector("#comp_12724");
		appVariables.avrProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13411");
		appVariables.avrOcenka = appVariables.results.querySelector("#lookupTextcomp_12720");
		appVariables.avrNalichie = appVariables.results.querySelector("#lookupTextcomp_12399");
		appVariables.avrSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12617");

		// ППАиДУ
		appVariables.ppaiduDefecty = appVariables.results.querySelector("#comp_12722");
		appVariables.ppaiduPosledObsled = appVariables.results.querySelector("#comp_12723");
		appVariables.ppaiduOrganizacia = appVariables.results.querySelector("#comp_12724");
		appVariables.ppaiduProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13412");
		appVariables.ppaiduOcenka = appVariables.results.querySelector("#lookupTextcomp_12725");
		appVariables.ppaiduType = appVariables.results.querySelector("#lookupTextcomp_12400");
		appVariables.ppaiduSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12618");

		// Система оповещения о пожаре
		appVariables.pozharOpoveshenDefecty = appVariables.results.querySelector("#comp_12727");
		appVariables.pozharOpoveshenPosledObsled = appVariables.results.querySelector("#comp_12728");
		appVariables.pozharOpoveshenOrganizacia = appVariables.results.querySelector("#comp_12729");
		appVariables.pozharOpoveshenProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13413");
		appVariables.pozharOpoveshenOcenka = appVariables.results.querySelector("#lookupTextcomp_12730");
		appVariables.pozharOpoveshenNalichie = appVariables.results.querySelector("#lookupTextcomp_12401");
		appVariables.pozharOpoveshenSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12619");

		// Система ГС
		appVariables.sistemaGsDefecty = appVariables.results.querySelector("#comp_12732");
		appVariables.sistemaGsPosledObsled = appVariables.results.querySelector("#comp_12733");
		appVariables.sistemaGsOrganizacia = appVariables.results.querySelector("#comp_12733");
		appVariables.sistemaGsProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13414");
		appVariables.sistemaGsOcenka = appVariables.results.querySelector("#lookupTextcomp_12740");
		appVariables.sistemaGsVvody = appVariables.results.querySelector("#lookupTextcomp_12402");
		appVariables.sistemaGsRazvodka = appVariables.results.querySelector("#lookupTextcomp_12403");
		appVariables.sistemaGsSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12620");

		// Система видеонаблюдения
		appVariables.sistemaVideonabDefecty = appVariables.results.querySelector("#comp_12742");
		appVariables.sistemaVideonabPosledObsled = appVariables.results.querySelector("#comp_12743");
		appVariables.sistemaVideonabOrganizacia = appVariables.results.querySelector("#comp_12744");
		appVariables.sistemaVideonabProshlOcenka = appVariables.results.querySelector("#lookupTextcomp_13415");
		appVariables.sistemaVideonabOcenka = appVariables.results.querySelector("#lookupTextcomp_12745");
		appVariables.sistemaVideonabMesto = appVariables.results.querySelector("#lookupTextcomp_12349");
		appVariables.sistemaVideonabSostoyanie = appVariables.results.querySelector("#lookupTextcomp_12621");

		// Нижняя часть отчета
		appVariables.dopolnitDannye = appVariables.form.querySelector("#comp_12324");
		appVariables.obsledVypolneno = appVariables.form.querySelector("#lookupTextcomp_12347");
		appVariables.recomendatciiPoUtepleniuSten = appVariables.form.querySelector("#lookupTextcomp_12350");
		appVariables.tehSostoyanieZdania = appVariables.form.querySelector("#lookupTextcomp_12325");
		appVariables.recomendatciiPoDopRabotam = appVariables.form.querySelector("#comp_12606");

		// Подписывающие лица
		for (let i = 0; i < appVariables.signatoriesRows.length; i++) {
			if (!appVariables.signatoriesRows[i].querySelector("#comp_12340")) {
				continue;
			}

			appVariables[i] = new Object();

			appVariables[i]["licaOt"] = appVariables.signatoriesRows[i].querySelector("#comp_12340");
			appVariables[i]["LicaDoljnost"] = appVariables.signatoriesRows[i].querySelector("#comp_12341");
			appVariables[i]["licaFio"] = appVariables.signatoriesRows[i].querySelector("#comp_12342");

			if (representativesInputs.empty) {
				representativesInputs[i] = new Object();
				representativesInputs[i]["LicaDoljnost"] = new Array();
				representativesInputs[i]["licaOt"] = new Array();
				representativesInputs[i]["licaFio"] = new Array();

				representativesInputs[i]["LicaDoljnost"].push(appVariables[i]["LicaDoljnost"]);
				representativesInputs[i]["licaOt"].push(appVariables[i]["licaOt"]);
				representativesInputs[i]["licaFio"].push(appVariables[i]["licaFio"]);
			}
		}

		representativesInputs.empty = false;

		if (resultsDefectsInputs.empty) {
			resultsDefectsInputs.inputs.push(appVariables.krovlyaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.svesyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.stropilnayaSistemaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.cherdakDefecty);
			resultsDefectsInputs.inputs.push(appVariables.pokritieJBDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vsyaKrishaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vodootvodDefecty);
			resultsDefectsInputs.inputs.push(appVariables.majpanelnyeStykiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.fasadDefecty);
			resultsDefectsInputs.inputs.push(appVariables.balkonyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.lodjiiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.kozirkiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.erkeryDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vseBalkonyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.stenyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.podvalDefecty);
			resultsDefectsInputs.inputs.push(appVariables.techPodpolieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.techEtajDefecty);
			resultsDefectsInputs.inputs.push(appVariables.garageDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopVestibuliDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopKrilcaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopPandusyNaruzhnieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopPandusyVnutrennieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopShodySiezdyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopOknaDveriDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopVnOtdelkaPomeshDefecty);
			resultsDefectsInputs.inputs.push(appVariables.mopVseElementyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.lestnicyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.perekrityaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.otopleniyeTehPodpolieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.otopleniyeTranzitPitaushDefecty);
			resultsDefectsInputs.inputs.push(appVariables.otopleniyeCherdakDefecty);
			resultsDefectsInputs.inputs.push(appVariables.otopleniyeEtajiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vseOtopleniyeDefecty);
			resultsDefectsInputs.inputs.push(appVariables.gvsTehPodpolieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.gvsTranzitPitaushDefecty);
			resultsDefectsInputs.inputs.push(appVariables.gvsCherdakDefecty);
			resultsDefectsInputs.inputs.push(appVariables.gvsEtajiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vseGvsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.hvsTehPodpolieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.hvsTranzitPitaushDefecty);
			resultsDefectsInputs.inputs.push(appVariables.hvsEtajiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.hvsVnPozharProvodDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vseHvsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.kanalizaciaTehPodpolieDefecty);
			resultsDefectsInputs.inputs.push(appVariables.kanalizaciaEtajiDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vseKanalizaciaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.musoroprovodyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.odsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.ventilaciaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.musoroChistSistemaDefecty);
			resultsDefectsInputs.inputs.push(appVariables.ozdsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.gazohodyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.liftyDefecty);
			resultsDefectsInputs.inputs.push(appVariables.podyomnikDefecty);
			resultsDefectsInputs.inputs.push(appVariables.autoSpuskLiftDefecty);
			resultsDefectsInputs.inputs.push(appVariables.systemEsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.vkvDefecty);
			resultsDefectsInputs.inputs.push(appVariables.avrDefecty);
			resultsDefectsInputs.inputs.push(appVariables.ppaiduDefecty);
			resultsDefectsInputs.inputs.push(appVariables.pozharOpoveshenDefecty);
			resultsDefectsInputs.inputs.push(appVariables.sistemaGsDefecty);
			resultsDefectsInputs.inputs.push(appVariables.sistemaVideonabDefecty);

			resultsDefectsInputs.empty = false;
		}
	}

	// Сохранение копии отчета в LocalStorage
	function saveData() {
		// обновляем все значения объекта переменных
		searchAllInputs();
		// Если страница не подходит для сохранения - выдаем ошибку и выходим из функции
		if (!buttonError(appVariables.copyButton, appVariables.currentPage, "main", "Копирование отчета")) {
			return;
		}

		const data = {
			address: {
				area: appVariables.area,
				district: appVariables.district,
				address: appVariables.address,
			},
			"Паспортные данные": {
				"Количество этажей": appVariables.passportDannye.etajei.value,
				"Количество подъездов": appVariables.passportDannye.podjezdov.value,
				"Строительный объем здания": appVariables.passportDannye.stroyObjem.value,
				"Кол-во квартир": appVariables.passportDannye.kvartir.value,
				"Площадь полезная": appVariables.passportDannye.poleznayaPloschad.value,
				"Площадь в жилых помещениях": appVariables.passportDannye.jilayaPloschad.value,
				"Площадь в нежилых помещениях": appVariables.passportDannye.neJilayaPloschad.value,
				"Серия проекта": appVariables.passportDannye.seriyaProekta.value,
				"Год постройки": appVariables.passportDannye.godPostrioki.value,
				"Год реконструкции": appVariables.passportDannye.godRekonstrukcii.value,
				"Класс энергетической эффективности здания": appVariables.passportDannye.klassEnergoeffectivnosti.value,
				"Физический износ (%) по данным БТИ": appVariables.passportDannye.fizIznos.value,
				"по данным БТИ на дату": appVariables.passportDannye.dannyeBtiData.value,
				"Наличие встроенных инженерных сооружений": appVariables.passportDannye.nalichVstroenSooruj.value,
				"Кол-во встроенных инженерных сооружений": appVariables.passportDannye.kolichVstroenSooruj.value,
				"Кол-во надстроенных инженерных сооружений": appVariables.passportDannye.kolichNadstroenSooruj.value,
				ТП: appVariables.passportDannye.tp.value,
				"в т.ч. масляные ТП": appVariables.passportDannye.maslyanieTp.value,
				"Магистрали транзитные": appVariables.passportDannye.magistraliTranzit.value,
				"Факт. уд. потребление тепловой эн., Гкал/м²": appVariables.passportDannye.potreblenieTeplaFact.value,
				"Проект. уд. потребление тепловой эн., кДж/(м²×град.×сут.)": appVariables.passportDannye.potreblenieTeplaProekt.value,
				"Величина отклонения (%)": appVariables.passportDannye.potreblenieTeplaOtklonenie.value,
			},
			"Технические заключения и проекты ремонтов": {
				1: {
					Организация: "",
					"Дата, №": "",
					"Наименование, содержание": "",
				},
				2: {
					Организация: "",
					"Дата, №": "",
					"Наименование, содержание": "",
				},
				3: {
					Организация: "",
					"Дата, №": "",
					"Наименование, содержание": "",
				},
				4: {
					Организация: "",
					"Дата, №": "",
					"Наименование, содержание": "",
				},
			},
			"Выводы по результатам предыдущего обследования": {},
			"Выполнение рекомендаций по кап. ремонту": {
				Крыша: {
					Кровля: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Свесы: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Стропильная система": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Чердак: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Покрытие ж/б": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Все элементы": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				Водоотвод: {
					Рекомендации: appVariables.recomend.vodootvod.recomend.value,
					"Треб. объем, %": appVariables.recomend.vodootvod.trebObjom.value,
					"Выполнен, год": appVariables.recomend.vodootvod.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.vodootvod.factObjom.value,
				},
				Герметизация: {
					Рекомендации: appVariables.recomend.germetizacia.recomend.value,
					"Треб. объем, %": appVariables.recomend.germetizacia.trebObjom.value,
					"Выполнен, год": appVariables.recomend.germetizacia.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.germetizacia.factObjom.value,
				},
				Фасад: {
					Рекомендации: appVariables.recomend.fasad.recomend.value,
					"Треб. объем, %": appVariables.recomend.fasad.trebObjom.value,
					"Выполнен, год": appVariables.recomend.fasad.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.fasad.factObjom.value,
					"Остекление оконных заполнений фасада": appVariables.recomendationsDone.querySelector("#lookupTextcomp_12601").value,
				},
				Балконы: {
					Балконы: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Лоджии: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Козырьки: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Эркеры: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Все элементы": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Остекление балконов": appVariables.recomend.balkony.balkony.osteklenie.value,
					"Остекление лоджий": appVariables.recomend.balkony.lodjii.osteklenie.value,
				},
				Стены: {
					Рекомендации: appVariables.recomend.steny.recomend.value,
					"Треб. объем, %": appVariables.recomend.steny.trebObjom.value,
					"Выполнен, год": appVariables.recomend.steny.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.steny.factObjom.value,
					"Утепление стен": appVariables.recomend.steny.uteplenie.value,
				},
				Подвал: {
					Рекомендации: appVariables.recomend.podval.recomend.value,
					"Треб. объем, %": appVariables.recomend.podval.trebObjom.value,
					"Выполнен, год": appVariables.recomend.podval.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.podval.factObjom.value,
				},
				"Тех.подполье": {
					Рекомендации: appVariables.recomend.tehPodpolie.recomend.value,
					"Треб. объем, %": appVariables.recomend.tehPodpolie.trebObjom.value,
					"Выполнен, год": appVariables.recomend.tehPodpolie.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.tehPodpolie.factObjom.value,
				},
				"Тех.этаж": {
					Рекомендации: appVariables.recomend.tehEtaj.recomend.value,
					"Треб. объем, %": appVariables.recomend.tehEtaj.trebObjom.value,
					"Выполнен, год": appVariables.recomend.tehEtaj.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.tehEtaj.factObjom.value,
				},
				"Гараж стоянка (подземный)": {
					Рекомендации: appVariables.recomend.garage.recomend.value,
					"Треб. объем, %": appVariables.recomend.garage.trebObjom.value,
					"Выполнен, год": appVariables.recomend.garage.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.garage.factObjom.value,
				},
				"Места общего пользования": {
					Вестибюли: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Крыльца: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Пандусы наружные": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Пандусы внутриподъездные": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Сходы/съезды": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Окна, двери": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Внутренняя отделка помещений": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Все элементы": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				Лестницы: {
					Рекомендации: appVariables.recomend.lestnicy.recomend.value,
					"Треб. объем, %": appVariables.recomend.lestnicy.trebObjom.value,
					"Выполнен, год": appVariables.recomend.lestnicy.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.lestnicy.factObjom.value,
				},
				Перекрытия: {
					Рекомендации: appVariables.recomend.perekritya.recomend.value,
					"Треб. объем, %": appVariables.recomend.perekritya.trebObjom.value,
					"Выполнен, год": appVariables.recomend.perekritya.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.perekritya.factObjom.value,
				},
				"Система отопления": {
					"Тех.подполье/тех.этаж": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Транзит питающий": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Чердак: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Этажи: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Вся система": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				ГВС: {
					"Тех.подполье/тех.этаж": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Транзит питающий": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Чердак: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Этажи: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Вся система": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				ХВС: {
					"Тех.подполье/тех.этаж": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Транзит питающий": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Внутренний пожарный водопровод": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Этажи: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Вся система": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				Канализация: {
					"Тех.подполье/тех.этаж": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					Этажи: {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
					"Вся система": {
						Рекомендации: "",
						"Треб. объем, %": "",
						"Выполнен, год": "",
						"Факт. объем, %": "",
					},
				},
				Мусоропроводы: {
					Рекомендации: appVariables.recomend.musoroprovody.recomend.value,
					"Треб. объем, %": appVariables.recomend.musoroprovody.trebObjom.value,
					"Выполнен, год": appVariables.recomend.musoroprovody.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.musoroprovody.factObjom.value,
				},
				"Система промывки и прочистки стволов мусоропроводов": {
					Рекомендации: appVariables.recomend.musoroChistSistema.recomend.value,
					"Треб. объем, %": appVariables.recomend.musoroChistSistema.trebObjom.value,
					"Выполнен, год": appVariables.recomend.musoroChistSistema.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.musoroChistSistema.factObjom.value,
				},
				"Вентиляц.": {
					Рекомендации: appVariables.recomend.ventilacia.recomend.value,
					"Треб. объем, %": appVariables.recomend.ventilacia.trebObjom.value,
					"Выполнен, год": appVariables.recomend.ventilacia.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.ventilacia.factObjom.value,
				},
				Газоходы: {
					Рекомендации: appVariables.recomend.gazohody.recomend.value,
					"Треб. объем, %": appVariables.recomend.gazohody.trebObjom.value,
					"Выполнен, год": appVariables.recomend.gazohody.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.gazohody.factObjom.value,
				},
				Лифты: {
					Рекомендации: appVariables.recomend.lifty.recomend.value,
					"Треб. объем, %": appVariables.recomend.lifty.trebObjom.value,
					"Выполнен, год": appVariables.recomend.lifty.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.lifty.factObjom.value,
				},
				"Подъёмное устройство для маломобильной группы населения": {
					Рекомендации: appVariables.recomend.podyomnik.recomend.value,
					"Треб. объем, %": appVariables.recomend.podyomnik.trebObjom.value,
					"Выполнен, год": appVariables.recomend.podyomnik.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.podyomnik.factObjom.value,
				},
				"Устройство для автоматического опускания лифта": {
					Рекомендации: appVariables.recomend.autoSpuskLift.recomend.value,
					"Треб. объем, %": appVariables.recomend.autoSpuskLift.trebObjom.value,
					"Выполнен, год": appVariables.recomend.autoSpuskLift.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.autoSpuskLift.factObjom.value,
				},
				"Система ЭС (ВРУ)": {
					Рекомендации: appVariables.recomend.systemEs.recomend.value,
					"Треб. объем, %": appVariables.recomend.systemEs.trebObjom.value,
					"Выполнен, год": appVariables.recomend.systemEs.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.systemEs.factObjom.value,
				},
				"ВКВ (второй кабельный ввод)": {
					Рекомендации: appVariables.recomend.vkv.recomend.value,
					"Треб. объем, %": appVariables.recomend.vkv.trebObjom.value,
					"Выполнен, год": appVariables.recomend.vkv.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.vkv.factObjom.value,
				},
				"АВР (автоматическое включение резервного питания)": {
					Рекомендации: appVariables.recomend.avr.recomend.value,
					"Треб. объем, %": appVariables.recomend.avr.trebObjom.value,
					"Выполнен, год": appVariables.recomend.avr.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.avr.factObjom.value,
				},
				ППАиДУ: {
					Рекомендации: appVariables.recomend.ppaidu.recomend.value,
					"Треб. объем, %": appVariables.recomend.ppaidu.trebObjom.value,
					"Выполнен, год": appVariables.recomend.ppaidu.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.ppaidu.factObjom.value,
				},
				"Система оповещения о пожаре": {
					Рекомендации: appVariables.recomend.pozharOpoveshen.recomend.value,
					"Треб. объем, %": appVariables.recomend.pozharOpoveshen.trebObjom.value,
					"Выполнен, год": appVariables.recomend.pozharOpoveshen.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.pozharOpoveshen.factObjom.value,
				},
				ГС: {
					Рекомендации: appVariables.recomend.gs.recomend.value,
					"Треб. объем, %": appVariables.recomend.gs.trebObjom.value,
					"Выполнен, год": appVariables.recomend.gs.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.gs.factObjom.value,
				},
				"Связь с ОДС": {
					Рекомендации: appVariables.recomend.ods.recomend.value,
					"Треб. объем, %": appVariables.recomend.ods.trebObjom.value,
					"Выполнен, год": appVariables.recomend.ods.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.ods.factObjom.value,
				},
				"Система видеонаблюдения": {
					Рекомендации: appVariables.recomend.videonab.recomend.value,
					"Треб. объем, %": appVariables.recomend.videonab.trebObjom.value,
					"Выполнен, год": appVariables.recomend.videonab.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.videonab.factObjom.value,
				},
				"ОЗДС(охранно-защитная дератизационная система)": {
					Рекомендации: appVariables.recomend.ozds.recomend.value,
					"Треб. объем, %": appVariables.recomend.ozds.trebObjom.value,
					"Выполнен, год": appVariables.recomend.ozds.vypolnenGod.value,
					"Факт. объем, %": appVariables.recomend.ozds.factObjom.value,
				},
				"Общий вывод: Рекомендации по выполнению объемов капитального ремонта": appVariables.recomend.obshiyVivod.value,
			},
			"Результаты выборочного обследования": {
				Крыша: {
					"Конструкция крыши": appVariables.roofConstruction.value,
					"Материал кровли": appVariables.roofMaterial.value,
					"Площадь кровли, м²": appVariables.roofSquare.value,
					Кровля: {
						"Выявленные дефекты": appVariables.krovlyaDefecty.value,
						"Оценка пред.": appVariables.krovlyaProshlOcenka.textContent,
						"% деф. части": appVariables.krovlyaPercent.value,
						Оценка: appVariables.krovlyaOcenka.value,
					},
					Свесы: {
						"Выявленные дефекты": appVariables.svesyDefecty.value,
						"Оценка пред.": appVariables.svesyProshlOcenka.textContent,
						"% деф. части": appVariables.svesyPercent.value,
						Оценка: appVariables.svesyOcenka.value,
					},
					"Стропильная система": {
						"Выявленные дефекты": appVariables.stropilnayaSistemaDefecty.value,
						"Оценка пред.": appVariables.stropilnayaSistemaProshlOcenka.textContent,
						"% деф. части": appVariables.stropilnayaSistemaPercent.value,
						Оценка: appVariables.stropilnayaSistemaOcenka.value,
					},
					Чердак: {
						"Выявленные дефекты": appVariables.cherdakDefecty.value,
						"Оценка пред.": appVariables.cherdakProshlOcenka.textContent,
						"% деф. части": appVariables.cherdakPercent.value,
						Оценка: appVariables.cherdakOcenka.value,
					},
					"Покрытие ж/б": {
						"Выявленные дефекты": appVariables.pokritieJBDefecty.value,
						"Оценка пред.": appVariables.pokritieJBProshlOcenka.textContent,
						"% деф. части": appVariables.pokritieJBPercent.value,
						Оценка: appVariables.pokritieJBOcenka.value,
					},
					"Все элементы": {
						"Выявленные дефекты": appVariables.vsyaKrishaDefecty.value,
						"Оценка пред.": appVariables.vsyaKrishaProshlOcenka.textContent,
						"% деф. части": appVariables.vsyaKrishaPercent.value,
						Оценка: appVariables.vsyaKrishaOcenka.value,
					},
				},
				Водоотвод: {
					"Тип водоотвода": appVariables.vodootvodType.value,
					"Материал водоотвода": appVariables.vodootvodMaterial.value,
					"Выявленные дефекты": appVariables.vodootvodDefecty.value,
					"Оценка пред.": appVariables.vodootvodProshlOcenka.textContent,
					"% деф. части": appVariables.vodootvodPercent.value,
					Оценка: appVariables.vodootvodOcenka.value,
				},
				"Межпанельные стыки": {
					"Тип стыков": appVariables.majpanelnyeStykiType.value,
					"Выявленные дефекты": appVariables.majpanelnyeStykiDefecty.value,
					"Оценка пред.": appVariables.majpanelnyeStykiProshlOcenka.textContent,
					"% деф. части": appVariables.majpanelnyeStykiPercent.value,
					Оценка: appVariables.majpanelnyeStykiOcenka.value,
				},
				Фасад: {
					"Площадь фасада, м²": appVariables.fasadSquare.value,
					"Отделка стен": appVariables.fasadOtdelkaSten.value,
					"Отделка цоколя": appVariables.fasadOblicovkaTsokolya.value,
					"Оконные заполнения": appVariables.fasadOkonnyeZapolneniya.value,
					"Выявленные дефекты": appVariables.fasadDefecty.value,
					"Оценка пред.": appVariables.fasadProshlOcenka.textContent,
					"% деф. части": appVariables.fasadPercent.value,
					Оценка: appVariables.fasadOcenka.value,
				},
				Балконы: {
					"Количество балконов": appVariables.balkonyKolich.value,
					"Количество лоджий": appVariables.balkonyLojii.value,
					"Козырьков над входами": appVariables.balkonyKozirkovVhody.value,
					"Козырьков на верхних этажах": appVariables.balkonyKozirkovVerh.value,
					"Козырьков непроектных": appVariables.balkonyKozirkovNeproekt.value,
					"Количество эркеров": appVariables.balkonyErkerovKolich.value,

					Балконы: {
						"Выявленные дефекты": appVariables.balkonyDefecty.value,
						"Оценка пред.": appVariables.balkonyProshlOcenka.textContent,
						"% деф. части": appVariables.balkonyPercent.value,
						Оценка: appVariables.balkonyOcenka.value,
					},
					Лоджии: {
						"Выявленные дефекты": appVariables.lodjiiDefecty.value,
						"Оценка пред.": appVariables.lodjiiProshlOcenka.textContent,
						"% деф. части": appVariables.lodjiiPercent.value,
						Оценка: appVariables.lodjiiOcenka.value,
					},
					Козырьки: {
						"Выявленные дефекты": appVariables.kozirkiDefecty.value,
						"Оценка пред.": appVariables.kozirkiProshlOcenka.textContent,
						"% деф. части": appVariables.kozirkiPercent.value,
						Оценка: appVariables.kozirkiOcenka.value,
					},
					Эркеры: {
						"Выявленные дефекты": appVariables.erkeryDefecty.value,
						"Оценка пред.": appVariables.erkeryProshlOcenka.textContent,
						"% деф. части": appVariables.erkeryPercent.value,
						Оценка: appVariables.erkeryOcenka.value,
					},
					"Все элементы": {
						"Выявленные дефекты": appVariables.vseBalkonyDefecty.value,
						"Оценка пред.": appVariables.vseBalkonyProshlOcenka.textContent,
						"% деф. части": appVariables.vseBalkonyPercent.value,
						Оценка: appVariables.vseBalkonyOcenka.value,
					},
				},
				Стены: {
					"Материал стен": appVariables.stenyMaterial.value,
					"Теплофизические свойства": appVariables.stenyTeploFizSvoistva.value,

					"Выявленные дефекты": appVariables.stenyDefecty.value,
					"Оценка пред.": appVariables.stenyProshlOcenka.textContent,
					"% деф. части": appVariables.stenyPercent.value,
					Оценка: appVariables.stenyOcenka.value,
				},
				Подвал: {
					"Наличие подвала": appVariables.podvalNalichie.value,
					"Площадь, м²": appVariables.podvalSquare.value,

					"Выявленные дефекты": appVariables.podvalDefecty.value,
					"Оценка пред.": appVariables.podvalProshlOcenka.textContent,
					"% деф. части": appVariables.podvalPercent.value,
					Оценка: appVariables.podvalOcenka.value,
				},
				"Тех.подполье": {
					"Наличие тех.подполья": appVariables.techPodpolieNalichie.value,

					"Выявленные дефекты": appVariables.techPodpolieDefecty.value,
					"Оценка пред.": appVariables.techPodpolieProshlOcenka.textContent,
					"% деф. части": appVariables.techPodpoliePercent.value,
					Оценка: appVariables.techPodpolieOcenka.value,
				},
				"Тех.этаж": {
					"Наличие тех.этажа": appVariables.techEtajNalichie.value,
					"Местонахождение, этаж": appVariables.techEtajMesto.value,

					"Выявленные дефекты": appVariables.techEtajDefecty.value,
					"Оценка пред.": appVariables.techEtajProshlOcenka.textContent,
					"% деф. части": appVariables.techEtajPercent.value,
					Оценка: appVariables.techEtajOcenka.value,
				},
				"Гараж стоянка (подземный)": {
					Тип: appVariables.garageType.value,
					"Площадь,м²": appVariables.garageSquare.value,
					"Этажность, эт": appVariables.garageEtagnost.value,
					"Количество маш.мест, шт": appVariables.garageKolichestvoMashin.value,

					"Выявленные дефекты": appVariables.garageDefecty.value,
					"Оценка пред.": appVariables.garageProshlOcenka.textContent,
					"% деф. части": appVariables.garagePercent.value,
					Оценка: appVariables.garageOcenka.value,
				},
				"Места общего пользования": {
					"Пандусы наружные, шт": appVariables.mopPandusyNaruzhKolich.value,
					"Пандусы внутренние, шт": appVariables.mopPandusyVnutrKolich.value,
					"Сходы-съезды, шт.": appVariables.mopShodySiezdyKolich.value,

					Вестибюли: {
						"Выявленные дефекты": appVariables.mopVestibuliDefecty.value,
						"Оценка пред.": appVariables.mopVestibuliProshlOcenka.textContent,
						"% деф. части": appVariables.mopVestibuliPercent.value,
						Оценка: appVariables.mopVestibuliOcenka.value,
					},
					Крыльца: {
						"Выявленные дефекты": appVariables.mopKrilcaDefecty.value,
						"Оценка пред.": appVariables.mopKrilcaProshlOcenka.textContent,
						"% деф. части": appVariables.mopKrilcaPercent.value,
						Оценка: appVariables.mopKrilcaOcenka.value,
					},
					"Пандусы наружные": {
						"Выявленные дефекты": appVariables.mopPandusyNaruzhnieDefecty.value,
						"Оценка пред.": appVariables.mopPandusyNaruzhnieProshlOcenka.textContent,
						"% деф. части": appVariables.mopPandusyNaruzhniePercent.value,
						Оценка: appVariables.mopPandusyNaruzhnieOcenka.value,
					},
					"Пандусы внутри-подъездные": {
						"Выявленные дефекты": appVariables.mopPandusyVnutrennieDefecty.value,
						"Оценка пред.": appVariables.mopPandusyVnutrennieProshlOcenka.textContent,
						"% деф. части": appVariables.mopPandusyVnutrenniePercent.value,
						Оценка: appVariables.mopPandusyVnutrennieOcenka.value,
					},
					"Сходы/съезды": {
						"Выявленные дефекты": appVariables.mopShodySiezdyDefecty.value,
						"Оценка пред.": appVariables.mopShodySiezdyProshlOcenka.textContent,
						"% деф. части": appVariables.mopShodySiezdyPercent.value,
						Оценка: appVariables.mopShodySiezdyOcenka.value,
					},
					"Окна, двери": {
						"Выявленные дефекты": appVariables.mopOknaDveriDefecty.value,
						"Оценка пред.": appVariables.mopOknaDveriProshlOcenka.textContent,
						"% деф. части": appVariables.mopOknaDveriPercent.value,
						Оценка: appVariables.mopOknaDveriOcenka.value,
					},
					"Внутренняя отделка помещений": {
						"Выявленные дефекты": appVariables.mopVnOtdelkaPomeshDefecty.value,
						"Оценка пред.": appVariables.mopVnOtdelkaPomeshProshlOcenka.textContent,
						"% деф. части": appVariables.mopVnOtdelkaPomeshPercent.value,
						Оценка: appVariables.mopVnOtdelkaPomeshOcenka.value,
					},
					"Все элементы": {
						"Выявленные дефекты": appVariables.mopVseElementyDefecty.value,
						"Оценка пред.": appVariables.mopVseElementyProshlOcenka.textContent,
						"% деф. части": appVariables.mopVseElementyPercent.value,
						Оценка: appVariables.mopVseElementyOcenka.value,
					},
				},
				Лестницы: {
					Конструкция: appVariables.lestnicyConstruction.value,

					"Выявленные дефекты": appVariables.lestnicyDefecty.value,
					"Оценка пред.": appVariables.lestnicyProshlOcenka.textContent,
					"% деф. части": appVariables.lestnicyPercent.value,
					Оценка: appVariables.lestnicyOcenka.value,
				},
				Перекрытия: {
					"Материал перекрытия": appVariables.perekrityaMaterial.value,

					"Выявленные дефекты": appVariables.perekrityaDefecty.value,
					"Оценка пред.": appVariables.perekrityaProshlOcenka.textContent,
					"% деф. части": appVariables.perekrityaPercent.value,
					Оценка: appVariables.perekrityaOcenka.value,
				},
				"Система отопления": {
					"Вид отопления": appVariables.otopleniyeVid.value,
					"Материал трубопроводов": appVariables.otopleniyeMaterial.value,
					"Тип приборов": appVariables.otopleniyeTypePribor.value,
					"Термо-регуляторы в квартирах": appVariables.otopleniyeTermoRegulKvartir.value,
					"Наличие АУУ, шт": appVariables.otopleniyeAuu.value,
					"Наличие ОДУУ": appVariables.otopleniyeOduu.value,
					"Элеваторный узел, шт": appVariables.otopleniyeElevUzel.value,
					"Тепловой узел, шт": appVariables.otopleniyeTeplovoyUzel.value,
					"Тип стояков": appVariables.otopleniyeTypeStoyakov.value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": appVariables.otopleniyeTehPodpolieDefecty.value,
						"Оценка пред.": appVariables.otopleniyeTehPodpolieProshlOcenka.textContent,
						"% деф. части": appVariables.otopleniyeTehPodpoliePercent.value,
						Оценка: appVariables.otopleniyeTehPodpolieOcenka.value,
					},
					"Транзит питающий": {
						"Выявленные дефекты": appVariables.otopleniyeTranzitPitaushDefecty.value,
						"Оценка пред.": appVariables.otopleniyeTranzitPitaushProshlOcenka.textContent,
						"% деф. части": appVariables.otopleniyeTranzitPitaushPercent.value,
						Оценка: appVariables.otopleniyeTranzitPitaushOcenka.value,
					},
					Чердак: {
						"Выявленные дефекты": appVariables.otopleniyeCherdakDefecty.value,
						"Оценка пред.": appVariables.otopleniyeCherdakProshlOcenka.textContent,
						"% деф. части": appVariables.otopleniyeCherdakPercent.value,
						Оценка: appVariables.otopleniyeCherdakOcenka.value,
					},
					Этажи: {
						"Выявленные дефекты": appVariables.otopleniyeEtajiDefecty.value,
						"Оценка пред.": appVariables.otopleniyeEtajiProshlOcenka.textContent,
						"% деф. части": appVariables.otopleniyeEtajiPercent.value,
						Оценка: appVariables.otopleniyeEtajiOcenka.value,
					},
					"Вся система": {
						"Выявленные дефекты": appVariables.vseOtopleniyeDefecty.value,
						"Оценка пред.": appVariables.vseOtopleniyeProshlOcenka.textContent,
						"% деф. части": appVariables.vseOtopleniyePercent.value,
						Оценка: appVariables.vseOtopleniyeOcenka.value,
					},
				},
				ГВС: {
					"Тип системы": appVariables.gvsType.value,
					"Материал трубопроводов": appVariables.gvsMaterial.value,
					"Наличие ОДУУ": appVariables.gvsOduu.value,
					"Тип стояков": appVariables.gvsTypeStoyakov.value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": appVariables.gvsTehPodpolieDefecty.value,
						"Оценка пред.": appVariables.gvsTehPodpolieProshlOcenka.textContent,
						"% деф. части": appVariables.gvsTehPodpoliePercent.value,
						Оценка: appVariables.gvsTehPodpolieOcenka.value,
					},
					"Транзит питающий": {
						"Выявленные дефекты": appVariables.gvsTranzitPitaushDefecty.value,
						"Оценка пред.": appVariables.gvsTranzitPitaushProshlOcenka.textContent,
						"% деф. части": appVariables.gvsTranzitPitaushPercent.value,
						Оценка: appVariables.gvsTranzitPitaushOcenka.value,
					},
					Чердак: {
						"Выявленные дефекты": appVariables.gvsCherdakDefecty.value,
						"Оценка пред.": appVariables.gvsCherdakProshlOcenka.textContent,
						"% деф. части": appVariables.gvsCherdakPercent.value,
						Оценка: appVariables.gvsCherdakOcenka.value,
					},
					Этажи: {
						"Выявленные дефекты": appVariables.gvsEtajiDefecty.value,
						"Оценка пред.": appVariables.gvsEtajiProshlOcenka.textContent,
						"% деф. части": appVariables.gvsEtajiPercent.value,
						Оценка: appVariables.gvsEtajiOcenka.value,
					},
					"Вся система": {
						"Выявленные дефекты": appVariables.vseGvsDefecty.value,
						"Оценка пред.": appVariables.vseGvsProshlOcenka.textContent,
						"% деф. части": appVariables.vseGvsPercent.value,
						Оценка: appVariables.vseGvsOcenka.value,
					},
				},
				ХВС: {
					"Материал трубопроводов": appVariables.hvsMaterial.value,
					"Наличие ОДУУ": appVariables.hvsOduu.value,
					"Тип стояков": appVariables.hvsTypeStoyakov.value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": appVariables.hvsTehPodpolieDefecty.value,
						"Оценка пред.": appVariables.hvsTehPodpolieProshlOcenka.textContent,
						"% деф. части": appVariables.hvsTehPodpoliePercent.value,
						Оценка: appVariables.hvsTehPodpolieOcenka.value,
					},
					"Транзит питающий": {
						"Выявленные дефекты": appVariables.hvsTranzitPitaushDefecty.value,
						"Оценка пред.": appVariables.hvsTranzitPitaushProshlOcenka.textContent,
						"% деф. части": appVariables.hvsTranzitPitaushPercent.value,
						Оценка: appVariables.hvsTranzitPitaushOcenka.value,
					},
					"Внутренний пожарный водопровод": {
						"Выявленные дефекты": appVariables.hvsVnPozharProvodDefecty.value,
						"Оценка пред.": appVariables.hvsVnPozharProvodProshlOcenka.textContent,
						"% деф. части": appVariables.hvsVnPozharProvodPercent.value,
						Оценка: appVariables.hvsVnPozharProvodOcenka.value,
					},
					Этажи: {
						"Выявленные дефекты": appVariables.hvsEtajiDefecty.value,
						"Оценка пред.": appVariables.hvsEtajiProshlOcenka.textContent,
						"% деф. части": appVariables.hvsEtajiPercent.value,
						Оценка: appVariables.hvsEtajiOcenka.value,
					},
					"Вся система": {
						"Выявленные дефекты": appVariables.vseHvsDefecty.value,
						"Оценка пред.": appVariables.vseHvsProshlOcenka.textContent,
						"% деф. части": appVariables.vseHvsPercent.value,
						Оценка: appVariables.vseHvsOcenka.value,
					},
				},
				Канализация: {
					"Материал трубопроводов": appVariables.kanalizaciaMaterial.value,
					"Тип стояков": appVariables.kanalizaciaTypeStoyakov.value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": appVariables.kanalizaciaTehPodpolieDefecty.value,
						"Оценка пред.": appVariables.kanalizaciaTehPodpolieProshlOcenka.textContent,
						"% деф. части": appVariables.kanalizaciaTehPodpoliePercent.value,
						Оценка: appVariables.kanalizaciaTehPodpolieOcenka.value,
					},
					Этажи: {
						"Выявленные дефекты": appVariables.kanalizaciaEtajiDefecty.value,
						"Оценка пред.": appVariables.kanalizaciaEtajiProshlOcenka.textContent,
						"% деф. части": appVariables.kanalizaciaEtajiPercent.value,
						Оценка: appVariables.kanalizaciaEtajiOcenka.value,
					},
					"Вся система": {
						"Выявленные дефекты": appVariables.vseKanalizaciaDefecty.value,
						"Оценка пред.": appVariables.vseKanalizaciaProshlOcenka.textContent,
						"% деф. части": appVariables.vseKanalizaciaPercent.value,
						Оценка: appVariables.vseKanalizaciaOcenka.value,
					},
				},
				Мусоропроводы: {
					Мусоропроводы: appVariables.musoroprovodyMesto.value,
					Мусорокамеры: appVariables.musoroprovodyKamery.value,

					"Выявленные дефекты": appVariables.musoroprovodyDefecty.value,
					"Оценка пред.": appVariables.musoroprovodyProshlOcenka.textContent,
					"% деф. части": appVariables.musoroprovodyPercent.value,
					Оценка: appVariables.musoroprovodyOcenka.value,
				},
				"Связь с ОДС": {
					Тип: appVariables.odsType.value,
					Состояние: appVariables.odsSostoyanie.value,

					"Выявленные дефекты": appVariables.odsDefecty.value,
					"№ и дата последнего обслед.": appVariables.odsPosledneeObsled.value,
					"Специализированная организация": appVariables.odsOrganizacia.value,
					"Оценка пред.": appVariables.odsProshlOcenka.textContent,
					Оценка: appVariables.odsOcenka.value,
				},
				Вентиляция: {
					Состояние: appVariables.ventilaciaSostoyanie.value,

					"Выявленные дефекты": appVariables.ventilaciaDefecty.value,
					"№ и дата последнего обслед.": appVariables.ventilaciaPosledneeObsled.value,
					"Специализированная организация": appVariables.ventilaciaOrganizacia.value,
					"Оценка пред.": appVariables.ventilaciaProshlOcenka.textContent,
					Оценка: appVariables.ventilaciaOcenka.value,
				},
				"Система промывки и прочистки стволов мусоропроводов": {
					Наличие: appVariables.musoroChistSistemaNalichie.value,
					Состояние: appVariables.musoroChistSistemaSostoyanie.value,

					"Выявленные дефекты": appVariables.musoroChistSistemaDefecty.value,
					"№ и дата последнего обслед.": appVariables.musoroChistSistemaPosledObsled.value,
					"Специализированная организация": appVariables.musoroChistSistemaOrganizacia.value,
					"Оценка пред.": appVariables.musoroChistSistemaProshlOcenka.textContent,
					Оценка: appVariables.musoroChistSistemaOcenka.value,
				},
				"ОЗДС (охранно-защитная дератизационная система)": {
					Наличие: appVariables.ozdsNalichie.value,
					Состояние: appVariables.ozdsSostoyanie.value,

					"Выявленные дефекты": appVariables.ozdsDefecty.value,
					"№ и дата последнего обслед.": appVariables.ozdsPosledObsled.value,
					"Специализированная организация": appVariables.ozdsOrganizacia.value,
					"Оценка пред.": appVariables.ozdsProshlOcenka.textContent,
					Оценка: appVariables.ozdsOcenka.value,
				},
				Газоходы: {
					Наличие: appVariables.gazohodyNalichie.value,
					Состояние: appVariables.gazohodySostoyanie.value,

					"Выявленные дефекты": appVariables.gazohodyDefecty.value,
					"№ и дата последнего обслед.": appVariables.gazohodyPosledObsled.value,
					"Специализированная организация": appVariables.gazohodyOrganizacia.value,
					"Оценка пред.": appVariables.gazohodyProshlOcenka.textContent,
					Оценка: appVariables.gazohodyOcenka.value,
				},
				Лифты: {
					"Пассажирские, шт": appVariables.liftyPass.value,
					"Грузопассажирские, шт": appVariables.liftyGruzPass.value,
					"В т.ч. навесные, шт": appVariables.liftyNavesnye.value,
					Состояние: appVariables.liftySostoyanie.value,

					"Выявленные дефекты": appVariables.liftyDefecty.value,
					"№ и дата последнего обслед.": appVariables.liftyPosledObsled.value,
					"Специализированная организация": appVariables.liftyOrganizacia.value,
					"Оценка пред.": appVariables.liftyProshlOcenka.textContent,
					Оценка: appVariables.liftyOcenka.value,
				},
				"Подъёмное устройство для маломобильной группы населения": {
					"Кол-во, шт": appVariables.podyomnikKolich.value,
					Состояние: appVariables.podyomnikSostoyanie.value,

					"Выявленные дефекты": appVariables.podyomnikDefecty.value,
					"№ и дата последнего обслед.": appVariables.podyomnikPosledObsled.value,
					"Специализированная организация": appVariables.podyomnikOrganizacia.value,
					"Оценка пред.": appVariables.podyomnikProshlOcenka.textContent,
					Оценка: appVariables.podyomnikOcenka.value,
				},
				"Устройство для автоматического опускания лифта": {
					Наличие: appVariables.autoSpuskLiftNalichie.value,
					Состояние: appVariables.autoSpuskLiftSostoyanie.value,

					"Выявленные дефекты": appVariables.autoSpuskLiftDefecty.value,
					"№ и дата последнего обслед.": appVariables.autoSpuskLiftPosledObsled.value,
					"Специализированная организация": appVariables.autoSpuskLiftOrganizacia.value,
					"Оценка пред.": appVariables.autoSpuskLiftProshlOcenka.textContent,
					Оценка: appVariables.autoSpuskLiftOcenka.value,
				},
				"Система ЭС": {
					"Кол-во ВРУ, шт": appVariables.systemEsKolich.value,
					"Размещение ВРУ": appVariables.systemEsRazmeshenie.value,
					Состояние: appVariables.systemEsSostoyanie.value,

					"Выявленные дефекты": appVariables.systemEsDefecty.value,
					"№ и дата последнего обслед.": appVariables.systemEsPosledObsled.value,
					"Специализированная организация": appVariables.systemEsOrganizacia.value,
					"Оценка пред.": appVariables.systemEsProshlOcenka.textContent,
					Оценка: appVariables.systemEsOcenka.value,
				},
				"ВКВ (второй кабельный ввод)": {
					Наличие: appVariables.vkvNalichie.value,
					Состояние: appVariables.vkvSostoyanie.value,

					"Выявленные дефекты": appVariables.vkvDefecty.value,
					"№ и дата последнего обслед.": appVariables.vkvPosledObsled.value,
					"Специализированная организация": appVariables.vkvOrganizacia.value,
					"Оценка пред.": appVariables.vkvProshlOcenka.textContent,
					Оценка: appVariables.vkvOcenka.value,
				},
				"АВР (автоматическое включение резервного питания)": {
					Наличие: appVariables.avrNalichie.value,
					Состояние: appVariables.avrSostoyanie.value,

					"Выявленные дефекты": appVariables.avrDefecty.value,
					"№ и дата последнего обслед.": appVariables.avrPosledObsled.value,
					"Специализированная организация": appVariables.avrOrganizacia.value,
					"Оценка пред.": appVariables.avrProshlOcenka.textContent,
					Оценка: appVariables.avrOcenka.value,
				},
				ППАиДУ: {
					Тип: appVariables.ppaiduType.value,
					Состояние: appVariables.ppaiduSostoyanie.value,

					"Выявленные дефекты": appVariables.ppaiduDefecty.value,
					"№ и дата последнего обслед.": appVariables.ppaiduPosledObsled.value,
					"Специализированная организация": appVariables.ppaiduOrganizacia.value,
					"Оценка пред.": appVariables.ppaiduProshlOcenka.textContent,
					Оценка: appVariables.ppaiduOcenka.value,
				},
				"Система оповещения о пожаре": {
					Наличие: appVariables.pozharOpoveshenNalichie.value,
					Состояние: appVariables.pozharOpoveshenSostoyanie.value,

					"Выявленные дефекты": appVariables.pozharOpoveshenDefecty.value,
					"№ и дата последнего обслед.": appVariables.pozharOpoveshenPosledObsled.value,
					"Специализированная организация": appVariables.pozharOpoveshenOrganizacia.value,
					"Оценка пред.": appVariables.pozharOpoveshenProshlOcenka.textContent,
					Оценка: appVariables.pozharOpoveshenOcenka.value,
				},
				"Система ГС": {
					Вводы: appVariables.sistemaGsVvody.value,
					Разводка: appVariables.sistemaGsRazvodka.value,
					Состояние: appVariables.sistemaGsSostoyanie.value,

					"Выявленные дефекты": appVariables.sistemaGsDefecty.value,
					"№ и дата последнего обслед.": appVariables.sistemaGsPosledObsled.value,
					"Специализированная организация": appVariables.sistemaGsOrganizacia.value,
					"Оценка пред.": appVariables.sistemaGsProshlOcenka.textContent,
					Оценка: appVariables.sistemaGsOcenka.value,
				},
				"Система видеонаблюдения": {
					Место: appVariables.sistemaVideonabMesto.value,
					Состояние: appVariables.sistemaGsSostoyanie.value,

					"Выявленные дефекты": appVariables.sistemaVideonabDefecty.value,
					"№ и дата последнего обслед.": appVariables.sistemaVideonabPosledObsled.value,
					"Специализированная организация": appVariables.sistemaVideonabOrganizacia.value,
					"Оценка пред.": appVariables.sistemaVideonabProshlOcenka.textContent,
					Оценка: appVariables.sistemaVideonabOcenka.value,
				},
				"Дополнительные данные": appVariables.dopolnitDannye.value,
				"Выполнено обследование": appVariables.obsledVypolneno.value,
				"Рекомендации по утеплению стен": appVariables.recomendatciiPoUtepleniuSten.value,
			},
			"Выводы по результатам обследования": {
				"Техническое состояние (приведенная оценка) здания (в целом)": appVariables.tehSostoyanieZdania.value,
				"РЕКОМЕНДАЦИИ по ремонтно-восстановительным работам": appVariables.recomendatciiPoDopRabotam.value,
			},
			"Подписывающие лица": {
				"Представители от": {
					1: "",
					2: "",
					3: "",
					4: "",
				},
				"Должность и наименование организации": {
					1: "",
					2: "",
					3: "",
					4: "",
				},
				"ФИО должностного лица": {
					1: "",
					2: "",
					3: "",
					4: "",
				},
			},
		};

		// Для тех заключений и проектов
		for (let i = 0; i < appVariables.repairProjectsTableRows.length; i++) {
			if (i < 2 || appVariables.repairProjectsTableRows[i].classList.contains("gridBGTotal")) {
				continue;
			}
			if (i > 1) {
				data["Технические заключения и проекты ремонтов"][i]["Организация"] = appVariables["tehZakluchenia"][i]["organizacia"].value;
				data["Технические заключения и проекты ремонтов"][i]["Дата, №"] = appVariables["tehZakluchenia"][i]["dataNomer"].value;
				data["Технические заключения и проекты ремонтов"][i]["Наименование, содержание"] = appVariables["tehZakluchenia"][i]["naimenovanieSoderjanie"].value;
			}
		}

		// Для выводов по результатам пред. обследования
		for (let key in appVariables.vivodyPoRezultatam) {
			data["Выводы по результатам предыдущего обследования"][key] = new Object();

			data["Выводы по результатам предыдущего обследования"][key]["id"] = appVariables["vivodyPoRezultatam"][key]["id"].textContent;
			data["Выводы по результатам предыдущего обследования"][key]["Дата"] = appVariables["vivodyPoRezultatam"][key]["data"].textContent;
			data["Выводы по результатам предыдущего обследования"][key]["№"] = appVariables["vivodyPoRezultatam"][key]["number"].textContent;
			data["Выводы по результатам предыдущего обследования"][key]["Техническое состояние здания в целом"] = appVariables["vivodyPoRezultatam"][key]["tehSostoyanie"].textContent;
		}

		// РЕКОМЕНДАЦИИ ПО КАП РЕМОНТУ
		// Крыша
		for (let key in appVariables.recomend.krisha) {
			const neededObj = appVariables.recomend.krisha[key];
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// Балконы
		for (let key in appVariables.recomend.balkony) {
			const neededObj = appVariables.recomend.balkony[key];
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// Места общего пользования
		for (let key in appVariables.recomend.mop) {
			const neededObj = appVariables.recomend.mop[key];
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// Системы отопления
		for (let key in appVariables.recomend.sistemaOtoplenia) {
			const neededObj = appVariables.recomend.sistemaOtoplenia[key];
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// ГВС
		for (let key in appVariables.recomend.gvs) {
			const neededObj = appVariables.recomend.gvs[key];
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// ХВС
		for (let key in appVariables.recomend.hvs) {
			const neededObj = appVariables.recomend.hvs[key];
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}
		// Канализация
		for (let key in appVariables.recomend.kanalizacia) {
			const neededObj = appVariables.recomend.kanalizacia[key];
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][neededObj.name]["Рекомендации"] = neededObj.recomend.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][neededObj.name]["Треб. объем, %"] = neededObj.trebObjom.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][neededObj.name]["Выполнен, год"] = neededObj.vypolnenGod.value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][neededObj.name]["Факт. объем, %"] = neededObj.factObjom.value;
		}

		for (let counter = 1; counter <= 4; counter++) {
			const neededObj = appVariables[counter];
			data["Подписывающие лица"]["Представители от"][counter] = neededObj["licaOt"].value;
			data["Подписывающие лица"]["ФИО должностного лица"][counter] = neededObj["licaFio"].value;
			data["Подписывающие лица"]["Должность и наименование организации"][counter] = neededObj["LicaDoljnost"].value;
		}

		localStorage.setItem("MJIDATA", JSON.stringify(data));

		appVariables.copyButton.textContent = "Скопировано";
		appVariables.copyButton.classList.add("main__button_done");
		setTimeout(() => {
			appVariables.copyButton.textContent = "Копирование отчета";
			appVariables.copyButton.classList.remove("main__button_done");
		}, 1500);
	}

	// Подгрузка копии отчета из LocalStorage на страницу
	function loadData() {
		// Находим все поля в отчете
		searchAllInputs();
		setRepresentatives();
		
		// Если страница не подходит для вставки - выдаем ошибку и выходим из функции
		if (!buttonError(appVariables.pasteButton, appVariables.currentPage, "main", "Вставка отчета")) {
			return;
		}

		// Если никаких данных в localStorage нет - выходим из функции
		if (localStorage.getItem("MJIDATA") === null) {
			appVariables.pasteButton.classList.add("main__button_error");
			appVariables.pasteButton.textContent = "Ничего не скопировано";
			setTimeout(() => {
				appVariables.pasteButton.textContent = "Вставка отчета";
				appVariables.pasteButton.classList.remove("main__button_error");
			}, 1500);
			return;
		}
		const loadData = JSON.parse(localStorage.getItem("MJIDATA"));

		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		// Кровля
		appVariables.krovlyaDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.krovlyaName]["Выявленные дефекты"];
		appVariables.krovlyaPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.krovlyaName]["% деф. части"];
		clickGenerator(appVariables.krovlyaOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.krovlyaName]["Оценка"], true);

		// Свесы
		appVariables.svesyDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.svesyName]["Выявленные дефекты"];
		appVariables.svesyPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.svesyName]["% деф. части"];
		clickGenerator(appVariables.svesyOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.svesyName]["Оценка"], true);

		// Стропильная система
		appVariables.stropilnayaSistemaDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.stropilnayaSistemaName]["Выявленные дефекты"];
		appVariables.stropilnayaSistemaPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.stropilnayaSistemaName]["% деф. части"];
		clickGenerator(appVariables.stropilnayaSistemaOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.stropilnayaSistemaName]["Оценка"], true);

		// Чердак
		appVariables.cherdakDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.cherdakName]["Выявленные дефекты"];
		appVariables.cherdakPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.cherdakName]["% деф. части"];
		clickGenerator(appVariables.cherdakOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.cherdakName]["Оценка"], true);

		// Покрытие ж/б
		appVariables.pokritieJBDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.pokritieJBName]["Выявленные дефекты"];
		appVariables.pokritieJBPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.pokritieJBName]["% деф. части"];
		clickGenerator(appVariables.pokritieJBOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.pokritieJBName]["Оценка"], true);

		// Все элементы
		appVariables.vsyaKrishaDefecty.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.vsyaKrishaName]["Выявленные дефекты"];
		appVariables.vsyaKrishaPercent.value = loadData["Результаты выборочного обследования"]["Крыша"][appVariables.vsyaKrishaName]["% деф. части"];
		clickGenerator(appVariables.vsyaKrishaOcenka, loadData["Результаты выборочного обследования"]["Крыша"][appVariables.vsyaKrishaName]["Оценка"], true);

		// Водоотвод
		appVariables.vodootvodDefecty.value = loadData["Результаты выборочного обследования"]["Водоотвод"]["Выявленные дефекты"];
		appVariables.vodootvodPercent.value = loadData["Результаты выборочного обследования"]["Водоотвод"]["% деф. части"];
		clickGenerator(appVariables.vodootvodOcenka, loadData["Результаты выборочного обследования"]["Водоотвод"]["Оценка"], true);

		// Межпанельные стыки
		appVariables.majpanelnyeStykiDefecty.value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Выявленные дефекты"];
		appVariables.majpanelnyeStykiPercent.value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["% деф. части"];
		clickGenerator(appVariables.majpanelnyeStykiOcenka, loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Оценка"], true);

		// Фасад
		appVariables.fasadDefecty.value = loadData["Результаты выборочного обследования"]["Фасад"]["Выявленные дефекты"];
		appVariables.fasadPercent.value = loadData["Результаты выборочного обследования"]["Фасад"]["% деф. части"];
		clickGenerator(appVariables.fasadOcenka, loadData["Результаты выборочного обследования"]["Фасад"]["Оценка"], true);

		// Балконы
		// Балконы
		appVariables.balkonyDefecty.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.balkonyName]["Выявленные дефекты"];
		appVariables.balkonyPercent.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.balkonyName]["% деф. части"];
		clickGenerator(appVariables.balkonyOcenka, loadData["Результаты выборочного обследования"]["Балконы"][appVariables.balkonyName]["Оценка"], true);

		// Лоджии
		appVariables.lodjiiDefecty.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.lodjiiName]["Выявленные дефекты"];
		appVariables.lodjiiPercent.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.lodjiiName]["% деф. части"];
		clickGenerator(appVariables.lodjiiOcenka, loadData["Результаты выборочного обследования"]["Балконы"][appVariables.lodjiiName]["Оценка"], true);

		// Козырьки
		appVariables.kozirkiDefecty.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.kozirkiName]["Выявленные дефекты"];
		appVariables.kozirkiPercent.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.kozirkiName]["% деф. части"];
		clickGenerator(appVariables.kozirkiOcenka, loadData["Результаты выборочного обследования"]["Балконы"][appVariables.kozirkiName]["Оценка"], true);

		// Эркеры
		appVariables.erkeryDefecty.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.erkeryName]["Выявленные дефекты"];
		appVariables.erkeryPercent.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.erkeryName]["% деф. части"];
		clickGenerator(appVariables.erkeryOcenka, loadData["Результаты выборочного обследования"]["Балконы"][appVariables.erkeryName]["Оценка"], true);

		// Все элементы
		appVariables.vseBalkonyDefecty.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.vseBalkonyName]["Выявленные дефекты"];
		appVariables.vseBalkonyPercent.value = loadData["Результаты выборочного обследования"]["Балконы"][appVariables.vseBalkonyName]["% деф. части"];
		clickGenerator(appVariables.vseBalkonyOcenka, loadData["Результаты выборочного обследования"]["Балконы"][appVariables.vseBalkonyName]["Оценка"], true);

		// Стены
		appVariables.stenyDefecty.value = loadData["Результаты выборочного обследования"]["Стены"]["Выявленные дефекты"];
		appVariables.stenyPercent.value = loadData["Результаты выборочного обследования"]["Стены"]["% деф. части"];
		clickGenerator(appVariables.stenyOcenka, loadData["Результаты выборочного обследования"]["Стены"]["Оценка"], true);

		// Подвал
		appVariables.podvalDefecty.value = loadData["Результаты выборочного обследования"]["Подвал"]["Выявленные дефекты"];
		appVariables.podvalPercent.value = loadData["Результаты выборочного обследования"]["Подвал"]["% деф. части"];
		clickGenerator(appVariables.podvalOcenka, loadData["Результаты выборочного обследования"]["Подвал"]["Оценка"], true);

		// Тех.подполье
		appVariables.techPodpolieDefecty.value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["Выявленные дефекты"];
		appVariables.techPodpoliePercent.value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["% деф. части"];
		clickGenerator(appVariables.techPodpolieOcenka, loadData["Результаты выборочного обследования"]["Тех.подполье"]["Оценка"], true);

		// Тех.этаж
		appVariables.techEtajDefecty.value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["Выявленные дефекты"];
		appVariables.techEtajPercent.value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["% деф. части"];
		clickGenerator(appVariables.techEtajOcenka, loadData["Результаты выборочного обследования"]["Тех.этаж"]["Оценка"], true);

		// Гараж стоянка (подземный)
		appVariables.garageDefecty.value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Выявленные дефекты"];
		appVariables.garagePercent.value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["% деф. части"];
		clickGenerator(appVariables.garageOcenka, loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Оценка"], true);

		// Места общего пользования
		// Вестибюли
		appVariables.mopVestibuliDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVestibuliName]["Выявленные дефекты"];
		appVariables.mopVestibuliPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVestibuliName]["% деф. части"];
		clickGenerator(appVariables.mopVestibuliOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVestibuliName]["Оценка"], true);

		// Крыльца
		appVariables.mopKrilcaDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopKrilcaName]["Выявленные дефекты"];
		appVariables.mopKrilcaPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopKrilcaName]["% деф. части"];
		clickGenerator(appVariables.mopKrilcaOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopKrilcaName]["Оценка"], true);

		// Пандусы наружные
		appVariables.mopPandusyNaruzhnieDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyNaruzhnieName]["Выявленные дефекты"];
		appVariables.mopPandusyNaruzhniePercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyNaruzhnieName]["% деф. части"];
		clickGenerator(appVariables.mopPandusyNaruzhnieOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyNaruzhnieName]["Оценка"], true);

		// Пандусы внутри-подъездные
		appVariables.mopPandusyVnutrennieDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyVnutrennieName]["Выявленные дефекты"];
		appVariables.mopPandusyVnutrenniePercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyVnutrennieName]["% деф. части"];
		clickGenerator(appVariables.mopPandusyVnutrennieOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopPandusyVnutrennieName]["Оценка"], true);

		// Сходы/съезды
		appVariables.mopShodySiezdyDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopShodySiezdyName]["Выявленные дефекты"];
		appVariables.mopShodySiezdyPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopShodySiezdyName]["% деф. части"];
		clickGenerator(appVariables.mopShodySiezdyOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopShodySiezdyName]["Оценка"], true);

		// Окна, двери
		appVariables.mopOknaDveriDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopOknaDveriName]["Выявленные дефекты"];
		appVariables.mopOknaDveriPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopOknaDveriName]["% деф. части"];
		clickGenerator(appVariables.mopOknaDveriOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopOknaDveriName]["Оценка"], true);

		// Внутренняя отделка помещений
		appVariables.mopVnOtdelkaPomeshDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVnOtdelkaPomeshName]["Выявленные дефекты"];
		appVariables.mopVnOtdelkaPomeshPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVnOtdelkaPomeshName]["% деф. части"];
		clickGenerator(appVariables.mopVnOtdelkaPomeshOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVnOtdelkaPomeshName]["Оценка"], true);

		// Все элементы
		appVariables.mopVseElementyDefecty.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVseElementyName]["Выявленные дефекты"];
		appVariables.mopVseElementyPercent.value = loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVseElementyName]["% деф. части"];
		clickGenerator(appVariables.mopVseElementyOcenka, loadData["Результаты выборочного обследования"]["Места общего пользования"][appVariables.mopVseElementyName]["Оценка"], true);

		// Лестницы
		appVariables.lestnicyDefecty.value = loadData["Результаты выборочного обследования"]["Лестницы"]["Выявленные дефекты"];
		appVariables.lestnicyPercent.value = loadData["Результаты выборочного обследования"]["Лестницы"]["% деф. части"];
		clickGenerator(appVariables.lestnicyOcenka, loadData["Результаты выборочного обследования"]["Лестницы"]["Оценка"], true);

		// Перекрытия
		appVariables.perekrityaDefecty.value = loadData["Результаты выборочного обследования"]["Перекрытия"]["Выявленные дефекты"];
		appVariables.perekrityaPercent.value = loadData["Результаты выборочного обследования"]["Перекрытия"]["% деф. части"];
		clickGenerator(appVariables.perekrityaOcenka, loadData["Результаты выборочного обследования"]["Перекрытия"]["Оценка"], true);

		// Система отопления
		// Тех.подполье/тех.этаж
		appVariables.otopleniyeTehPodpolieDefecty.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTehPodpolieName]["Выявленные дефекты"];
		appVariables.otopleniyeTehPodpoliePercent.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTehPodpolieName]["% деф. части"];
		clickGenerator(appVariables.otopleniyeTehPodpolieOcenka, loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTehPodpolieName]["Оценка"], true);

		// Транзит питающий
		appVariables.otopleniyeTranzitPitaushDefecty.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTranzitPitaushName]["Выявленные дефекты"];
		appVariables.otopleniyeTranzitPitaushPercent.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTranzitPitaushName]["% деф. части"];
		clickGenerator(appVariables.otopleniyeTranzitPitaushOcenka, loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeTranzitPitaushName]["Оценка"], true);

		// Чердак
		appVariables.otopleniyeCherdakDefecty.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeCherdakName]["Выявленные дефекты"];
		appVariables.otopleniyeCherdakPercent.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeCherdakName]["% деф. части"];
		clickGenerator(appVariables.otopleniyeCherdakOcenka, loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeCherdakName]["Оценка"], true);

		// Этажи
		appVariables.otopleniyeEtajiDefecty.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeEtajiName]["Выявленные дефекты"];
		appVariables.otopleniyeEtajiPercent.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeEtajiName]["% деф. части"];
		clickGenerator(appVariables.otopleniyeEtajiOcenka, loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.otopleniyeEtajiName]["Оценка"], true);

		// Вся система
		appVariables.vseOtopleniyeDefecty.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.vseOtopleniyeName]["Выявленные дефекты"];
		appVariables.vseOtopleniyePercent.value = loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.vseOtopleniyeName]["% деф. части"];
		clickGenerator(appVariables.vseOtopleniyeOcenka, loadData["Результаты выборочного обследования"]["Система отопления"][appVariables.vseOtopleniyeName]["Оценка"], true);

		// ГВС
		// Тех.подполье/тех.этаж
		appVariables.gvsTehPodpolieDefecty.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTehPodpolieName]["Выявленные дефекты"];
		appVariables.gvsTehPodpoliePercent.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTehPodpolieName]["% деф. части"];
		clickGenerator(appVariables.gvsTehPodpolieOcenka, loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTehPodpolieName]["Оценка"], true);

		// Транзит питающий
		appVariables.gvsTranzitPitaushDefecty.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTranzitPitaushName]["Выявленные дефекты"];
		appVariables.gvsTranzitPitaushPercent.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTranzitPitaushName]["% деф. части"];
		clickGenerator(appVariables.gvsTranzitPitaushOcenka, loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsTranzitPitaushName]["Оценка"], true);

		// Чердак
		appVariables.gvsCherdakDefecty.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsCherdakName]["Выявленные дефекты"];
		appVariables.gvsCherdakPercent.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsCherdakName]["% деф. части"];
		clickGenerator(appVariables.gvsCherdakOcenka, loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsCherdakName]["Оценка"], true);

		// Этажи
		appVariables.gvsEtajiDefecty.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsEtajiName]["Выявленные дефекты"];
		appVariables.gvsEtajiPercent.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsEtajiName]["% деф. части"];
		clickGenerator(appVariables.gvsEtajiOcenka, loadData["Результаты выборочного обследования"]["ГВС"][appVariables.gvsEtajiName]["Оценка"], true);

		// Вся система
		appVariables.vseGvsDefecty.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.vseGvsName]["Выявленные дефекты"];
		appVariables.vseGvsPercent.value = loadData["Результаты выборочного обследования"]["ГВС"][appVariables.vseGvsName]["% деф. части"];
		clickGenerator(appVariables.vseGvsOcenka, loadData["Результаты выборочного обследования"]["ГВС"][appVariables.vseGvsName]["Оценка"], true);

		// ХВС
		// Тех.подполье/тех.этаж
		appVariables.hvsTehPodpolieDefecty.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTehPodpolieName]["Выявленные дефекты"];
		appVariables.hvsTehPodpoliePercent.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTehPodpolieName]["% деф. части"];
		clickGenerator(appVariables.hvsTehPodpolieOcenka, loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTehPodpolieName]["Оценка"], true);

		// Транзит питающий
		appVariables.hvsTranzitPitaushDefecty.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTranzitPitaushName]["Выявленные дефекты"];
		appVariables.hvsTranzitPitaushPercent.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTranzitPitaushName]["% деф. части"];
		clickGenerator(appVariables.hvsTranzitPitaushOcenka, loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsTranzitPitaushName]["Оценка"], true);

		// Этажи
		appVariables.hvsEtajiDefecty.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsEtajiName]["Выявленные дефекты"];
		appVariables.hvsEtajiPercent.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsEtajiName]["% деф. части"];
		clickGenerator(appVariables.hvsEtajiOcenka, loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsEtajiName]["Оценка"], true);

		// Внутренний пожарный водопровод
		appVariables.hvsVnPozharProvodDefecty.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsVnPozharProvodName]["Выявленные дефекты"];
		appVariables.hvsVnPozharProvodPercent.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsVnPozharProvodName]["% деф. части"];
		clickGenerator(appVariables.hvsVnPozharProvodOcenka, loadData["Результаты выборочного обследования"]["ХВС"][appVariables.hvsVnPozharProvodName]["Оценка"], true);

		// Вся система
		appVariables.vseHvsDefecty.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.vseHvsName]["Выявленные дефекты"];
		appVariables.vseHvsPercent.value = loadData["Результаты выборочного обследования"]["ХВС"][appVariables.vseHvsName]["% деф. части"];
		clickGenerator(appVariables.vseHvsOcenka, loadData["Результаты выборочного обследования"]["ХВС"][appVariables.vseHvsName]["Оценка"], true);

		// Канализация
		// Тех.подполье/тех.этаж
		appVariables.kanalizaciaTehPodpolieDefecty.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaTehPodpolieName]["Выявленные дефекты"];
		appVariables.kanalizaciaTehPodpoliePercent.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaTehPodpolieName]["% деф. части"];
		clickGenerator(appVariables.kanalizaciaTehPodpolieOcenka, loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaTehPodpolieName]["Оценка"], true);

		// Этажи
		appVariables.kanalizaciaEtajiDefecty.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaEtajiName]["Выявленные дефекты"];
		appVariables.kanalizaciaEtajiPercent.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaEtajiName]["% деф. части"];
		clickGenerator(appVariables.kanalizaciaEtajiOcenka, loadData["Результаты выборочного обследования"]["Канализация"][appVariables.kanalizaciaEtajiName]["Оценка"], true);

		// Вся система
		appVariables.vseKanalizaciaDefecty.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.vseKanalizaciaName]["Выявленные дефекты"];
		appVariables.vseKanalizaciaPercent.value = loadData["Результаты выборочного обследования"]["Канализация"][appVariables.vseKanalizaciaName]["% деф. части"];
		clickGenerator(appVariables.vseKanalizaciaOcenka, loadData["Результаты выборочного обследования"]["Канализация"][appVariables.vseKanalizaciaName]["Оценка"], true);

		// Мусоропроводы
		appVariables.musoroprovodyDefecty.value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Выявленные дефекты"];
		appVariables.musoroprovodyPercent.value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["% деф. части"];
		clickGenerator(appVariables.musoroprovodyOcenka, loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Оценка"], true);

		// Связь с ОДС
		appVariables.odsDefecty.value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Выявленные дефекты"];
		appVariables.odsPosledneeObsled.value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["№ и дата последнего обслед."];
		appVariables.odsOrganizacia.value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Специализированная организация"];
		clickGenerator(appVariables.odsOcenka, loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Оценка"], true);

		// Вентиляция
		appVariables.ventilaciaDefecty.value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Выявленные дефекты"];
		appVariables.ventilaciaPosledneeObsled.value = loadData["Результаты выборочного обследования"]["Вентиляция"]["№ и дата последнего обслед."];
		appVariables.odsOrganizacia.value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Специализированная организация"];
		clickGenerator(appVariables.ventilaciaOcenka, loadData["Результаты выборочного обследования"]["Вентиляция"]["Оценка"], true);

		// Система промывки и прочистки стволов мусоропроводов
		appVariables.musoroChistSistemaDefecty.value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Выявленные дефекты"];
		appVariables.musoroChistSistemaPosledObsled.value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["№ и дата последнего обслед."];
		appVariables.musoroChistSistemaOrganizacia.value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Специализированная организация"];
		clickGenerator(appVariables.musoroChistSistemaOcenka, loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Оценка"], true);

		// ОЗДС (охранно-защитная дератизационная система)
		appVariables.ozdsDefecty.value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Выявленные дефекты"];
		appVariables.ozdsPosledObsled.value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["№ и дата последнего обслед."];
		appVariables.ozdsOrganizacia.value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Специализированная организация"];
		clickGenerator(appVariables.ozdsOcenka, loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Оценка"], true);

		// Газоходы
		appVariables.gazohodyDefecty.value = loadData["Результаты выборочного обследования"]["Газоходы"]["Выявленные дефекты"];
		appVariables.gazohodyPosledObsled.value = loadData["Результаты выборочного обследования"]["Газоходы"]["№ и дата последнего обслед."];
		appVariables.gazohodyOrganizacia.value = loadData["Результаты выборочного обследования"]["Газоходы"]["Специализированная организация"];
		clickGenerator(appVariables.gazohodyOcenka, loadData["Результаты выборочного обследования"]["Газоходы"]["Оценка"], true);

		// Лифты
		appVariables.liftyDefecty.value = loadData["Результаты выборочного обследования"]["Лифты"]["Выявленные дефекты"];
		appVariables.liftyPosledObsled.value = loadData["Результаты выборочного обследования"]["Лифты"]["№ и дата последнего обслед."];
		appVariables.liftyOrganizacia.value = loadData["Результаты выборочного обследования"]["Лифты"]["Специализированная организация"];
		clickGenerator(appVariables.liftyOcenka, loadData["Результаты выборочного обследования"]["Лифты"]["Оценка"], true);

		// Подъёмное устройство для маломобильной группы населения
		appVariables.podyomnikDefecty.value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Выявленные дефекты"];
		appVariables.podyomnikPosledObsled.value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["№ и дата последнего обслед."];
		appVariables.podyomnikOrganizacia.value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Специализированная организация"];
		clickGenerator(appVariables.podyomnikOcenka, loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Оценка"], true);

		// Устройство для автоматического опускания лифта
		appVariables.autoSpuskLiftDefecty.value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Выявленные дефекты"];
		appVariables.autoSpuskLiftPosledObsled.value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["№ и дата последнего обслед."];
		appVariables.autoSpuskLiftOrganizacia.value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Специализированная организация"];
		clickGenerator(appVariables.autoSpuskLiftOcenka, loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Оценка"], true);

		// Система ЭС
		appVariables.systemEsDefecty.value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Выявленные дефекты"];
		appVariables.systemEsPosledObsled.value = loadData["Результаты выборочного обследования"]["Система ЭС"]["№ и дата последнего обслед."];
		appVariables.systemEsOrganizacia.value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Специализированная организация"];
		clickGenerator(appVariables.systemEsOcenka, loadData["Результаты выборочного обследования"]["Система ЭС"]["Оценка"], true);

		// ВКВ (второй кабельный ввод)
		appVariables.vkvDefecty.value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Выявленные дефекты"];
		appVariables.vkvPosledObsled.value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["№ и дата последнего обслед."];
		appVariables.vkvOrganizacia.value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Специализированная организация"];
		clickGenerator(appVariables.vkvOcenka, loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Оценка"], true);

		// АВР (автоматическое включение резервного питания)
		appVariables.avrDefecty.value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Выявленные дефекты"];
		appVariables.avrPosledObsled.value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["№ и дата последнего обслед."];
		appVariables.avrOrganizacia.value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Специализированная организация"];
		clickGenerator(appVariables.avrOcenka, loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Оценка"], true);

		// ППАиДУ
		appVariables.ppaiduDefecty.value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Выявленные дефекты"];
		appVariables.ppaiduPosledObsled.value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["№ и дата последнего обслед."];
		appVariables.ppaiduOrganizacia.value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Специализированная организация"];
		clickGenerator(appVariables.ppaiduOcenka, loadData["Результаты выборочного обследования"]["ППАиДУ"]["Оценка"], true);

		// Система оповещения о пожаре
		appVariables.pozharOpoveshenDefecty.value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Выявленные дефекты"];
		appVariables.pozharOpoveshenPosledObsled.value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["№ и дата последнего обслед."];
		appVariables.pozharOpoveshenOrganizacia.value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Специализированная организация"];
		clickGenerator(appVariables.pozharOpoveshenOcenka, loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Оценка"], true);

		// Система ГС
		appVariables.sistemaGsDefecty.value = loadData["Результаты выборочного обследования"]["Система ГС"]["Выявленные дефекты"];
		appVariables.sistemaGsPosledObsled.value = loadData["Результаты выборочного обследования"]["Система ГС"]["№ и дата последнего обслед."];
		appVariables.sistemaGsOrganizacia.value = loadData["Результаты выборочного обследования"]["Система ГС"]["Специализированная организация"];
		clickGenerator(appVariables.sistemaGsOcenka, loadData["Результаты выборочного обследования"]["Система ГС"]["Оценка"], true);

		// Система видеонаблюдения
		appVariables.sistemaVideonabDefecty.value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Выявленные дефекты"];
		appVariables.sistemaVideonabPosledObsled.value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["№ и дата последнего обслед."];
		appVariables.sistemaVideonabOrganizacia.value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Специализированная организация"];
		clickGenerator(appVariables.sistemaVideonabOcenka, loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Оценка"], true);

		appVariables.dopolnitDannye.value = loadData["Результаты выборочного обследования"]["Дополнительные данные"];
		clickGenerator(appVariables.recomendatciiPoUtepleniuSten, loadData["Результаты выборочного обследования"]["Рекомендации по утеплению стен"], true);
		appVariables.recomendatciiPoDopRabotam.value = loadData["Выводы по результатам обследования"]["РЕКОМЕНДАЦИИ по ремонтно-восстановительным работам"];

		// Подписывающие лица
		// for (let i = 1; i < appVariables.signatoriesRows.length; i++) {
		// 	if (!appVariables.signatoriesRows[i].querySelector("#comp_12340")) {
		// 		continue;
		// 	}
		// 	appVariables[i]["licaOt"].value = loadData["Подписывающие лица"]["Представители от"][i];
		// 	appVariables[i]["LicaDoljnost"].value = loadData["Подписывающие лица"]["Должность и наименование организации"][i];
		// 	appVariables[i]["licaFio"].value = loadData["Подписывающие лица"]["ФИО должностного лица"][i];
		// }

		localStorage.setItem("DataLoaded", JSON.stringify({ address: loadData.address.address }));

		appVariables.pasteButton.textContent = "Вставлено";
		appVariables.pasteButton.classList.add("main__button_done");
		setTimeout(() => {
			appVariables.pasteButton.textContent = "Вставка отчета";
			appVariables.pasteButton.classList.remove("main__button_done");
		}, 1500);
	}

	// Очистка полей отчета на странице
	function clearData() {
		// находим все инпуты в отчете
		searchAllInputs();
		// Если страница не подходит для очистки - выдаем ошибку и выходим из функции
		if (!buttonError(appVariables.clearDataButton, appVariables.currentPage, "main", "Очистка отчета")) {
			return;
		}
		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		// Кровля
		appVariables.krovlyaDefecty.value = "";
		appVariables.krovlyaPercent.value = "";
		clickGenerator(appVariables.krovlyaOcenka, "-", false);

		// Свесы
		appVariables.svesyDefecty.value = "";
		appVariables.svesyPercent.value = "";
		clickGenerator(appVariables.svesyOcenka, "-", false);

		// Стропильная система
		appVariables.stropilnayaSistemaDefecty.value = "";
		appVariables.stropilnayaSistemaPercent.value = "";
		clickGenerator(appVariables.stropilnayaSistemaOcenka, "-", false);

		// Чердак
		appVariables.cherdakDefecty.value = "";
		appVariables.cherdakPercent.value = "";
		clickGenerator(appVariables.cherdakOcenka, "-", false);

		// Покрытие ж/б
		appVariables.pokritieJBDefecty.value = "";
		appVariables.pokritieJBPercent.value = "";
		clickGenerator(appVariables.pokritieJBOcenka, "-", false);

		// Все элементы
		appVariables.vsyaKrishaDefecty.value = "";
		appVariables.vsyaKrishaPercent.value = "";
		clickGenerator(appVariables.vsyaKrishaOcenka, "-", false);

		// Водоотвод
		appVariables.vodootvodDefecty.value = "";
		appVariables.vodootvodPercent.value = "";
		clickGenerator(appVariables.vodootvodOcenka, "-", false);

		// Межпанельные стыки
		appVariables.majpanelnyeStykiDefecty.value = "";
		appVariables.majpanelnyeStykiPercent.value = "";
		clickGenerator(appVariables.majpanelnyeStykiProshlOcenka, "-", false);

		// Фасад
		appVariables.fasadDefecty.value = "";
		appVariables.fasadPercent.value = "";
		clickGenerator(appVariables.fasadOcenka, "-", false);

		// Балконы
		// Балконы
		appVariables.balkonyDefecty.value = "";
		appVariables.balkonyPercent.value = "";
		clickGenerator(appVariables.balkonyOcenka, "-", false);

		// Лоджии
		appVariables.lodjiiDefecty.value = "";
		appVariables.lodjiiPercent.value = "";
		clickGenerator(appVariables.lodjiiOcenka, "-", false);

		// Козырьки
		appVariables.kozirkiDefecty.value = "";
		appVariables.kozirkiPercent.value = "";
		clickGenerator(appVariables.kozirkiOcenka, "-", false);

		// Эркеры
		appVariables.erkeryDefecty.value = "";
		appVariables.erkeryPercent.value = "";
		clickGenerator(appVariables.erkeryOcenka, "-", false);

		// Все элементы
		appVariables.vseBalkonyDefecty.value = "";
		appVariables.vseBalkonyPercent.value = "";
		clickGenerator(appVariables.vseBalkonyOcenka, "-", false);

		// Стены
		appVariables.stenyDefecty.value = "";
		appVariables.stenyPercent.value = "";
		clickGenerator(appVariables.stenyOcenka, "-", false);

		// Подвал
		appVariables.podvalDefecty.value = "";
		appVariables.podvalPercent.value = "";
		clickGenerator(appVariables.podvalOcenka, "-", false);

		// Тех.подполье
		appVariables.techPodpolieDefecty.value = "";
		appVariables.techPodpoliePercent.value = "";
		clickGenerator(appVariables.techPodpolieOcenka, "-", false);

		// Тех.этаж
		appVariables.techEtajDefecty.value = "";
		appVariables.techEtajPercent.value = "";
		clickGenerator(appVariables.techEtajOcenka, "-", false);

		// Гараж стоянка (подземный)
		appVariables.garageDefecty.value = "";
		appVariables.garagePercent.value = "";
		clickGenerator(appVariables.garageOcenka, "-", false);

		// Места общего пользования
		// Вестибюли
		appVariables.mopVestibuliDefecty.value = "";
		appVariables.mopVestibuliPercent.value = "";
		clickGenerator(appVariables.mopVestibuliOcenka, "-", false);

		// Крыльца
		appVariables.mopKrilcaDefecty.value = "";
		appVariables.mopKrilcaPercent.value = "";
		clickGenerator(appVariables.mopKrilcaOcenka, "-", false);

		// Пандусы наружные
		appVariables.mopPandusyNaruzhnieDefecty.value = "";
		appVariables.mopPandusyNaruzhniePercent.value = "";
		clickGenerator(appVariables.mopPandusyNaruzhnieOcenka, "-", false);

		// Пандусы внутри-подъездные
		appVariables.mopPandusyVnutrennieDefecty.value = "";
		appVariables.mopPandusyVnutrenniePercent.value = "";
		clickGenerator(appVariables.mopPandusyVnutrennieOcenka, "-", false);

		// Сходы/съезды
		appVariables.mopShodySiezdyDefecty.value = "";
		appVariables.mopShodySiezdyPercent.value = "";
		clickGenerator(appVariables.mopShodySiezdyOcenka, "-", false);

		// Окна, двери
		appVariables.mopOknaDveriDefecty.value = "";
		appVariables.mopOknaDveriPercent.value = "";
		clickGenerator(appVariables.mopOknaDveriOcenka, "-", false);

		// Внутренняя отделка помещений
		appVariables.mopVnOtdelkaPomeshDefecty.value = "";
		appVariables.mopVnOtdelkaPomeshPercent.value = "";
		clickGenerator(appVariables.mopVnOtdelkaPomeshOcenka, "-", false);

		// Все элементы
		appVariables.mopVseElementyDefecty.value = "";
		appVariables.mopVseElementyPercent.value = "";
		clickGenerator(appVariables.mopVseElementyOcenka, "-", false);

		// Лестницы
		appVariables.lestnicyDefecty.value = "";
		appVariables.lestnicyPercent.value = "";
		clickGenerator(appVariables.lestnicyOcenka, "-", false);

		// Перекрытия
		appVariables.perekrityaDefecty.value = "";
		appVariables.perekrityaPercent.value = "";
		clickGenerator(appVariables.perekrityaOcenka, "-", false);

		// Система отопления
		// Тех.подполье/тех.этаж
		appVariables.otopleniyeTehPodpolieDefecty.value = "";
		appVariables.otopleniyeTehPodpoliePercent.value = "";
		clickGenerator(appVariables.otopleniyeTehPodpolieOcenka, "-", false);

		// Транзит питающий
		appVariables.otopleniyeTranzitPitaushDefecty.value = "";
		appVariables.otopleniyeTranzitPitaushPercent.value = "";
		clickGenerator(appVariables.otopleniyeTranzitPitaushOcenka, "-", false);

		// Чердак
		appVariables.otopleniyeCherdakDefecty.value = "";
		appVariables.otopleniyeCherdakPercent.value = "";
		clickGenerator(appVariables.otopleniyeCherdakOcenka, "-", false);

		// Этажи
		appVariables.otopleniyeEtajiDefecty.value = "";
		appVariables.otopleniyeEtajiPercent.value = "";
		clickGenerator(appVariables.otopleniyeEtajiOcenka, "-", false);

		// Вся система
		appVariables.vseOtopleniyeDefecty.value = "";
		appVariables.vseOtopleniyePercent.value = "";
		clickGenerator(appVariables.vseOtopleniyeOcenka, "-", false);

		// ГВС
		// Тех.подполье/тех.этаж
		appVariables.gvsTehPodpolieDefecty.value = "";
		appVariables.gvsTehPodpoliePercent.value = "";
		clickGenerator(appVariables.gvsTehPodpolieOcenka, "-", false);

		// Транзит питающий
		appVariables.gvsTranzitPitaushDefecty.value = "";
		appVariables.gvsTranzitPitaushPercent.value = "";
		clickGenerator(appVariables.gvsTranzitPitaushOcenka, "-", false);

		// Чердак
		appVariables.gvsCherdakDefecty.value = "";
		appVariables.gvsCherdakPercent.value = "";
		clickGenerator(appVariables.gvsCherdakOcenka, "-", false);

		// Этажи
		appVariables.gvsEtajiDefecty.value = "";
		appVariables.gvsEtajiPercent.value = "";
		clickGenerator(appVariables.gvsEtajiOcenka, "-", false);

		// Вся система
		appVariables.vseGvsDefecty.value = "";
		appVariables.vseGvsPercent.value = "";
		clickGenerator(appVariables.vseGvsOcenka, "-", false);

		// ХВС
		// Тех.подполье/тех.этаж
		appVariables.hvsTehPodpolieDefecty.value = "";
		appVariables.hvsTehPodpoliePercent.value = "";
		clickGenerator(appVariables.hvsTehPodpolieOcenka, "-", false);

		// Транзит питающий
		appVariables.hvsTranzitPitaushDefecty.value = "";
		appVariables.hvsTranzitPitaushPercent.value = "";
		clickGenerator(appVariables.hvsTranzitPitaushOcenka, "-", false);

		// Этажи
		appVariables.hvsEtajiDefecty.value = "";
		appVariables.hvsEtajiPercent.value = "";
		clickGenerator(appVariables.hvsEtajiOcenka, "-", false);

		// Внутренний пожарный водопровод
		appVariables.hvsVnPozharProvodDefecty.value = "";
		appVariables.hvsVnPozharProvodPercent.value = "";
		clickGenerator(appVariables.hvsVnPozharProvodOcenka, "-", false);

		// Вся система
		appVariables.vseHvsDefecty.value = "";
		appVariables.vseHvsPercent.value = "";
		clickGenerator(appVariables.vseHvsOcenka, "-", false);

		// Канализация
		// Тех.подполье/тех.этаж
		appVariables.kanalizaciaTehPodpolieDefecty.value = "";
		appVariables.kanalizaciaTehPodpoliePercent.value = "";
		clickGenerator(appVariables.kanalizaciaTehPodpolieOcenka, "-", false);

		// Этажи
		appVariables.kanalizaciaEtajiDefecty.value = "";
		appVariables.kanalizaciaEtajiPercent.value = "";
		clickGenerator(appVariables.kanalizaciaEtajiOcenka, "-", false);

		// Вся система
		appVariables.vseKanalizaciaDefecty.value = "";
		appVariables.vseKanalizaciaPercent.value = "";
		clickGenerator(appVariables.vseKanalizaciaOcenka, "-", false);

		// Мусоропроводы
		appVariables.musoroprovodyDefecty.value = "";
		appVariables.musoroprovodyPercent.value = "";
		clickGenerator(appVariables.musoroprovodyOcenka, "-", false);

		// Связь с ОДС
		appVariables.odsDefecty.value = "";
		appVariables.odsPosledneeObsled.value = "";
		appVariables.odsOrganizacia.value = "";
		clickGenerator(appVariables.odsOcenka, "-", false);

		// Вентиляция
		appVariables.ventilaciaDefecty.value = "";
		appVariables.ventilaciaPosledneeObsled.value = "";
		appVariables.odsOrganizacia.value = "";
		clickGenerator(appVariables.ventilaciaOcenka, "-", false);

		// Система промывки и прочистки стволов мусоропроводов
		appVariables.musoroChistSistemaDefecty.value = "";
		appVariables.musoroChistSistemaPosledObsled.value = "";
		appVariables.musoroChistSistemaOrganizacia.value = "";
		clickGenerator(appVariables.musoroChistSistemaOcenka, "-", false);

		// ОЗДС (охранно-защитная дератизационная система)
		appVariables.ozdsDefecty.value = "";
		appVariables.ozdsPosledObsled.value = "";
		appVariables.ozdsOrganizacia.value = "";
		clickGenerator(appVariables.ozdsOcenka, "-", false);

		// Газоходы
		appVariables.gazohodyDefecty.value = "";
		appVariables.gazohodyPosledObsled.value = "";
		appVariables.gazohodyOrganizacia.value = "";
		clickGenerator(appVariables.gazohodyOcenka, "-", false);

		// Лифты
		appVariables.liftyDefecty.value = "";
		appVariables.liftyPosledObsled.value = "";
		appVariables.liftyOrganizacia.value = "";
		clickGenerator(appVariables.liftyOcenka, "-", false);

		// Подъёмное устройство для маломобильной группы населения
		appVariables.podyomnikDefecty.value = "";
		appVariables.podyomnikPosledObsled.value = "";
		appVariables.podyomnikOrganizacia.value = "";
		clickGenerator(appVariables.podyomnikOcenka, "-", false);

		// Устройство для автоматического опускания лифта
		appVariables.autoSpuskLiftDefecty.value = "";
		appVariables.autoSpuskLiftPosledObsled.value = "";
		appVariables.autoSpuskLiftOrganizacia.value = "";
		clickGenerator(appVariables.autoSpuskLiftOcenka, "-", false);

		// Система ЭС
		appVariables.systemEsDefecty.value = "";
		appVariables.systemEsPosledObsled.value = "";
		appVariables.systemEsOrganizacia.value = "";
		clickGenerator(appVariables.systemEsOcenka, "-", false);

		// ВКВ (второй кабельный ввод)
		appVariables.vkvDefecty.value = "";
		appVariables.vkvPosledObsled.value = "";
		appVariables.vkvOrganizacia.value = "";
		clickGenerator(appVariables.vkvOcenka, "-", false);

		// АВР (автоматическое включение резервного питания)
		appVariables.avrDefecty.value = "";
		appVariables.avrPosledObsled.value = "";
		appVariables.avrOrganizacia.value = "";
		clickGenerator(appVariables.avrOcenka, "-", false);

		// ППАиДУ
		appVariables.ppaiduDefecty.value = "";
		appVariables.ppaiduPosledObsled.value = "";
		appVariables.ppaiduOrganizacia.value = "";
		clickGenerator(appVariables.ppaiduOcenka, "-", false);

		// Система оповещения о пожаре
		appVariables.pozharOpoveshenDefecty.value = "";
		appVariables.pozharOpoveshenPosledObsled.value = "";
		appVariables.pozharOpoveshenOrganizacia.value = "";
		clickGenerator(appVariables.pozharOpoveshenOcenka, "-", false);

		// Система ГС
		appVariables.sistemaGsDefecty.value = "";
		appVariables.sistemaGsPosledObsled.value = "";
		appVariables.sistemaGsOrganizacia.value = "";
		clickGenerator(appVariables.sistemaGsOcenka, "-", false);

		// Система видеонаблюдения
		appVariables.sistemaVideonabDefecty.value = "";
		appVariables.sistemaVideonabPosledObsled.value = "";
		appVariables.sistemaVideonabOrganizacia.value = "";
		clickGenerator(appVariables.sistemaVideonabProshlOcenka, "-", false);

		appVariables.dopolnitDannye.value = "";
		clickGenerator(appVariables.recomendatciiPoUtepleniuSten, "Н/и (не имеется)", false);
		appVariables.recomendatciiPoDopRabotam.value = "";

		// Подписывающие лица
		for (let i = 1; i < appVariables.signatoriesRows.length; i++) {
			if (!appVariables.signatoriesRows[i].querySelector("#comp_12340")) {
				continue;
			}
			appVariables[i]["licaOt"].value = "";
			appVariables[i]["LicaDoljnost"].value = "";
			appVariables[i]["licaFio"].value = "";
		}

		appVariables.clearDataButton.textContent = "Очищено";
		appVariables.clearDataButton.classList.add("main__button_done");
		setTimeout(() => {
			appVariables.clearDataButton.textContent = "Очистка отчета";
			appVariables.clearDataButton.classList.remove("main__button_done");
		}, 1500);
	}

	// Автоматическая загрузка фотографий на страницу
	function downloadPhotos(evt) {
		evt.preventDefault();
		// Если страница не подходит для вставки фото - выдаем ошибку и выходим из функции
		if (!buttonError(appVariables.submitButton, appVariables.currentPage, "photo", "Загрузить")) {
			return;
		}

		const files = appVariables.formInput.files;
		let counter = 0;
		if (files.length < 1) {
			appVariables.submitButton.classList.add("form__button_error");
			appVariables.submitButton.value = "Ошибка!";
			setTimeout(() => {
				appVariables.submitButton.classList.remove("form__button_error");
				appVariables.submitButton.value = "Загрузить";
			}, 1500);
			return;
		}
		const interval = setInterval(upload, 3000);
		const saveButton = appVariables.html.querySelector("#buttonFormSave");
		const addImgBtnContainer = appVariables.html.querySelector("#\\32 1184 > caption");
		const addImgButton = addImgBtnContainer.querySelector(".button");

		function upload() {
			// 1. Клик по кнопке добавления поля
			addImgButton.click();

			const photoTable = appVariables.html.querySelector("#\\32 1184");
			const downloadInputs = photoTable.querySelectorAll(".fileLoad");
			const downloadInput = downloadInputs[downloadInputs.length - 1];
			const textareas = photoTable.querySelectorAll("textarea");
			const currentTextarea = textareas[textareas.length - 1];
			const currentFile = files[`${counter}`];
			const prepareDate = appVariables.inputDate.value.split("-");
			const downloadDate = `Дата загрузки: ${prepareDate[2]}.${prepareDate[1]}.${prepareDate[0]} г.`;

			currentTextarea.value = downloadDate;

			// Копируем данные файла из расширения
			const myFile = new File(["file"], `${currentFile.name}`, {
				type: `${currentFile.type}`,
				size: currentFile.size,
				webkitRelativePath: `${currentFile.webkitRelativePath}`,
				lastModified: `${currentFile.lastModified}`,
				lastModifiedDate: `${currentFile.lastModifiedDate}`,
			});

			if (myFile.lastModified < 1) {
				return;
			}

			// 2. Выделяем инпут для подгрузки фото и вставляем в него данные
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(currentFile);
			downloadInput.files = dataTransfer.files;
			downloadInput.dispatchEvent(new Event("change"));

			counter++;
			// 3. Сохраняем после добавления всех файлов
			if (counter >= files.length) {
				clearInterval(interval);
				setTimeout(() => {
					saveButton.click();
					appVariables.submitButton.value = "Сохранено";
					appVariables.submitButton.classList.add("form__button_done");
					setTimeout(() => {
						appVariables.submitButton.value = "Загрузить";
						appVariables.submitButton.classList.remove("form__button_done");
					}, 1500);
				}, 3000);
			}
		}
	}

	function clickGenerator(ocenkaInput, value, load) {
		if (load && value === "-") {
			return;
		}
		try {
			const dataElement = ocenkaInput.parentElement.nextElementSibling;
			const listItems = dataElement.querySelectorAll("li");
			for (let i = 0; i < listItems.length; i++) {
				const a = listItems[i].querySelector("a");
				if (a.textContent === value) {
					a.click();
					return;
				}
			}
		} catch {
			console.error(`clickGenerator failed: can't click`);
			return;
		}
	}

	// Добавляет на странице отчета во все поля раскрывающийся список с параметрами для выбора
	function createFakeSelects() {
		if (!buttonError(appVariables.copyButton, appVariables.currentPage, "main", "Всплывающие поля")) {
			return;
		}

		// Поиск полей отчета
		searchAllInputs();

		let counterItems = 1;

		resultsDefectsInputs.inputs.forEach((input) => {
			const groupTable = input.closest(".groupBorder");
			const container = input.parentElement;
			const rowName = container.previousElementSibling.querySelector("span").textContent;
			const groupName = groupTable.querySelector("legend").textContent;

			input.style.boxSizing = "border-box";

			if (selectsValues[groupName]) {
				if (rowName !== "Все элементы" && rowName !== "Вся система") {
					if (!container.querySelector(".fakeSelect")) {
						container.style.position = "relative";
						container.insertAdjacentHTML("afterBegin", fakeSelectList);
						const currentSelect = container.querySelector(".fakeSelect");
						const currentSelectList = currentSelect.querySelector(".fakeSelect__list");
						const currentSelectOpenButton = container.querySelector(".fakeSelect__selector");
						const currentSelectCloseBtn = currentSelect.querySelector(".fakeSelect__close-selector");

						currentSelectOpenButton.addEventListener("click", () => {
							openFakeSelect(currentSelect);
						});
						currentSelectCloseBtn.addEventListener("click", () => {
							closeFakeSelect(currentSelect);
						});
						let listOptions, conditionNode, objAddress, objAddressOpt, objAddressGroup, objAddressRow;
						try {
							objAddress = selectsValues[`${groupName}`][`${rowName}`][`conditionNode`]["appVariables"] || selectsValues[`${groupName}`][`${rowName}`][`conditionNode`];
							objAddressOpt = objAddress[0];
							objAddressGroup = objAddress[1];
							objAddressRow = objAddress[2];
							conditionNode = appVariables[objAddressOpt][objAddressGroup][objAddressRow];
						} catch {}

						if (conditionNode) {
							const conditionValue = `${conditionNode.value}`;
							const conditions = selectsValues[`${groupName}`][`${rowName}`][`conditions`];
							listOptions = conditions[`${conditionValue}`];
						} else {
							console.info(`${groupName}: ${rowName} - безусловно`);
							if (!selectsValues[`${groupName}`][`${rowName}`]) {
								listOptions = ["#", "#"];
							} else {
								listOptions = selectsValues[`${groupName}`][`${rowName}`][`conditions`]["Безусловно"];
							}
						}

						listOptions.forEach((item) => {
							const listItem = `
								<div class="fakeSelect__item-wrapper">
									<input type="checkbox" id="fakselect-item-${counterItems}" />
									<label for="fakselect-item-${counterItems}">${item}</label>
								</div>`;
							currentSelectList.insertAdjacentHTML("beforeend", listItem);
							counterItems += 1;
						});

						const allGroupItems = currentSelectList.querySelectorAll(".fakeSelect__item-wrapper");

						currentSelectCloseBtn.addEventListener("click", () => {
							const resultValue = [];
							allGroupItems.forEach((item) => {
								const checkbox = item.querySelector("input");
								const value = item.querySelector("label");

								if (checkbox.checked) {
									if (!input.value.includes(value.textContent)) {
										resultValue.push(value.textContent);
									}
								} else {
									const sentences = splitBySentences(input.value);
									const toDelete = sentences.find((str) => `${str}.` === value.textContent);
									if (toDelete) {
										input.value = input.value.trimStart().trimEnd().replace(`${toDelete}.`, "");
									}
								}
							});
							input.value = `${input.value.trimStart().trimEnd()} ${resultValue.join(" ").trimStart().trimEnd()}`.trimStart().trimEnd();
						});
					}
				}
			}
		});

		appVariables.fakeSelectsButton.textContent = "Создано!";
		appVariables.fakeSelectsButton.classList.add("main__button_done");
		setTimeout(() => {
			appVariables.fakeSelectsButton.textContent = "Всплывающие поля";
			appVariables.fakeSelectsButton.classList.remove("main__button_done");
		}, 1500);
	}

	function setRepresentatives() {
		Object.keys(representativesInputs).forEach((key) => {
			for (let i = 1; i < Object.keys(representativesInputs[key]).length; i += 2) {
				if (typeof representativesInputs[key] == "boolean") {
					break;
				}

				const firstColName = Object.keys(representativesInputs[key])[i]; // licaOt
				const secondColName = Object.keys(representativesInputs[key])[i - 1]; // LicaDoljnost
				const thirdColName = Object.keys(representativesInputs[key])[i + 1]; // licaFio

				const firstColInput = representativesInputs[key][firstColName][0];
				const secondColInput = representativesInputs[key][secondColName][0];
				const thirdColInput = representativesInputs[key][thirdColName][0];

				switch (secondColInput.value) {
					case "Директор" || "Генеральный директор": {
						firstColInput.value = "ООО СпецСтройЭксперт"
						thirdColInput.value = representatives["Генеральный директор"]
						break;
					}
					case "Руководитель работ": {
						firstColInput.value = "ООО СпецСтройЭксперт"
						thirdColInput.value = representatives["Руководитель работ"]
						break;
					}
					case "Исполнитель работ": {
						firstColInput.value = "ООО СпецСтройЭксперт";
						thirdColInput.value = currentFio;
					}
				}
			}
		});
	}

	function splitBySentences(text) {
		if (text === "") {
			return [""];
		}
		const regex = /[.!?]\s+/g;
		const sentences = text.trimStart().split(regex);
		const clearedSentences = [];
		for (let i = 0; i < sentences.length; i++) {
			clearedSentences.push(sentences[i].replace(".", ""));
		}
		return clearedSentences;
	}

	function openFakeSelect(selectList) {
		if (appVariables.htmlBody.querySelector(".fakeSelect_opened")) {
			closeFakeSelect(appVariables.htmlBody.querySelector(".fakeSelect_opened"));
		}
		selectList.classList.add("fakeSelect_opened");
	}

	function closeFakeSelect(selectList) {
		selectList.classList.remove("fakeSelect_opened");
	}

	function setRatings() {
		const ratesData = appData.ratesData;
		searchAllInputs();

		for (let key in appVariables) {
			if (key.includes("Ocenka") && !key.includes("Proshl")) {
				const name = key.replace("Ocenka", "");
				if (!allRatesPercentsInputs[name]) {
					allRatesPercentsInputs[name] = new Object();
				}
				allRatesPercentsInputs[name]["Ocenka"] = appVariables[key];
			}
			if (key.includes("Percent")) {
				const name = key.replace("Percent", "");
				if (!allRatesPercentsInputs[name]) {
					allRatesPercentsInputs[name] = new Object();
				}
				allRatesPercentsInputs[name]["Percent"] = appVariables[key];
				allRatesPercentsInputs[name]["Group"] = appVariables[key].closest(".groupBorder").querySelector("legend").textContent;
			}
			if (key.includes("Name")) {
				const name = key.replace("Name", "");
				if (!allRatesPercentsInputs[name]) {
					allRatesPercentsInputs[name] = new Object();
				}
				allRatesPercentsInputs[name]["name"] = appVariables[key];
			}
		}

		for (let key in allRatesPercentsInputs) {
			if (!allRatesPercentsInputs[key]["Percent"]) {
				break;
			}
			const dataElement = allRatesPercentsInputs[key]["Ocenka"].parentElement.nextElementSibling;
			const listItems = dataElement.querySelectorAll("li");

			allRatesPercentsInputs[key]["Percent"].addEventListener("change", (evt) => {
				checkPercentValidity(evt.target.value, evt.target);
				checkRatePercent(evt.target.value, "Percent", evt.target, dataElement);
			});
			listItems.forEach((item) => {
				item.addEventListener("click", () => {
					checkRatePercent(item.textContent, "Ocenka", item, allRatesPercentsInputs[key]["Percent"]);
				});
			});
		}

		function checkRatePercent(value, inputType, input, siblingInput) {
			let rowName, validPercent, conditions, rate, percentToValidRateIsEqual;
			const groupName = input.closest(".groupBorder").querySelector("legend").textContent;

			if (inputType === "Percent") {
				rowName = input.parentElement.parentElement.firstElementChild.nextElementSibling.querySelector("span").textContent;
				const valueToNumber = Number(value);
				conditions = ratesData[groupName][rowName];

				for (let ocenka in conditions) {
					if (conditions[ocenka] === "algorythm A") {
						algorythmA(allRatesPercentsInputs, input, groupName);
						return;
					}
					if (conditions[ocenka] === "algorythm B") {
						algorythmB(allRatesPercentsInputs, input, groupName);
						return;
					}
					if (conditions[ocenka] === "algorythm C") {
						algorythmC(allRatesPercentsInputs, input, groupName);
						return;
					}
				}

				for (let ocenka in conditions) {
					validPercent = conditions[ocenka].find((num) => num == valueToNumber);
					if (validPercent) {
						rate = ocenka;
					}
				}
				const siblingItem = siblingInput.parentElement.querySelector("input");
				if (siblingItem.value !== rate) {
					siblingItem.parentElement.classList.add("inputErrorValidity");
				} else {
					siblingItem.parentElement.classList.remove("inputErrorValidity");
					input.classList.remove("inputErrorValidity");
					input.style.borderColor = "#D0D0D0 !important";
				}
			}
			if (inputType === "Ocenka") {
				rowName = input.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.firstElementChild.nextElementSibling.querySelector("span").textContent;
				conditions = ratesData[groupName][rowName];
				const validRatesArr = conditions[value];
				if (typeof validRatesArr == "string") {
					return;
				}
				if (validRatesArr) {
					percentToValidRateIsEqual = validRatesArr.find((num) => num === Number(siblingInput.value));
				}
				if (!percentToValidRateIsEqual || !validRatesArr) {
					siblingInput.classList.add("inputErrorValidity");
				} else {
					siblingInput.classList.remove("inputErrorValidity");
					input.parentElement.parentElement.previousElementSibling.classList.remove("inputErrorValidity");
					input.parentElement.parentElement.previousElementSibling.classList.remove("dataMarker");
				}
			}
		}

		function checkPercentValidity(value, input) {
			if (input.value === "") {
				return;
			}
			const validValues = [3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];

			if (value < 3) {
				input.value = 3;
			}
			for (let i = 1; i < validValues.length; i += 2) {
				const low = Math.abs(Number(value) - validValues[i - 1]);
				const mid = Math.abs(Number(value) - validValues[i]);
				const high = Math.abs(Number(value) - validValues[i + 1]);

				if (low > 2 && mid > 2 && high > 2) {
					continue;
				}

				const differs = [low, mid, high];
				const result = differs.indexOf(Math.min(...differs));
				let end = false;

				switch (result) {
					case 0: {
						input.value = validValues[i - 1];
						end = true;
						break;
					}
					case 1: {
						input.value = validValues[i];
						end = true;
						break;
					}
					case 2: {
						input.value = validValues[i + 1];
						end = true;
						break;
					}
					default: {
						continue;
					}
				}
				if (end) {
					break;
				}
			}
		}

		function algorythmA(rowsInputs, input, groupName) {
			const rates = [];
			let resultRate = "";
			let rowNameTranslite = "";
			let maxPercent = 0;
			for (let row in rowsInputs) {
				if (rowsInputs[row]["Group"] === groupName) {
					if (rowsInputs[row]["name"] === "Все элементы") {
						rowNameTranslite = row;
						break;
					}
					if (maxPercent < rowsInputs[row]["Percent"].value) {
						maxPercent = rowsInputs[row]["Percent"].value;
					}
					rates.push({
						RowName: `${rowsInputs[row]["name"]}`,
						Percent: rowsInputs[row]["Percent"].value,
						Ocenka: rowsInputs[row]["Ocenka"].value,
					});
				}
			}
			input.value = maxPercent;

			if (rates.find((rate) => rate["Ocenka"] === "А")) {
				resultRate = "А";
				clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
				return;
			}
			if (resultRate !== "") {
				return;
			}
			rates.forEach((rate) => {
				switch (rate.RowName) {
					case "Стропильная система":
						if (rate.Ocenka === "ОГР") {
							resultRate = "ОГР";
							clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
						}
						return;
					case "Покрытие ж/б":
						if (rate.Ocenka === "ОГР") {
							resultRate = "ОГР";
							clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
						}
						return;
				}
			});
			if (resultRate !== "") {
				return;
			}
			rates.forEach((rate) => {
				switch (rate.RowName) {
					case "Кровля":
						if (rate.Ocenka === "Н") {
							resultRate = "Н";
							clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
							return;
						}
						break;
					case "Свесы":
						if (rate.Ocenka === "Н") {
							resultRate = "Н";
							clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
							return;
						}
						break;
					case "Чердак":
						if (rate.Ocenka === "Н") {
							resultRate = "Н";
							clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
							return;
						}
						break;
				}
			});
			if (resultRate !== "") {
				return;
			}
			resultRate = "Р";
			clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
		}

		function algorythmB(rowsInputs, input, groupName) {
			const rates = [];
			let resultRate = "";
			let rowNameTranslite = "";
			let maxPercent = 0;
			for (let row in rowsInputs) {
				if (rowsInputs[row]["Group"] === groupName) {
					if (rowsInputs[row]["name"] === "Все элементы" || rowsInputs[row]["name"] === "Вся система") {
						rowNameTranslite = row;
						break;
					}
					if (maxPercent < rowsInputs[row]["Percent"].value) {
						maxPercent = rowsInputs[row]["Percent"].value;
					}
					rates.push({
						RowName: `${rowsInputs[row]["name"]}`,
						Percent: rowsInputs[row]["Percent"].value,
						Ocenka: rowsInputs[row]["Ocenka"].value,
					});
				}
			}
			input.value = maxPercent;

			if (rates.find((rate) => rate["Ocenka"] === "А")) {
				resultRate = "А";
				clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
				return;
			}
			if (resultRate !== "") {
				return;
			}
			if (rates.find((rate) => rate["Ocenka"] === "ОГР")) {
				resultRate = "ОГР";
				clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
				return;
			}
			if (resultRate !== "") {
				return;
			}
			resultRate = "Р";
			clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
		}

		function algorythmC(rowsInputs, input, groupName) {
			const rates = [];
			let resultRate = "";
			let rowNameTranslite = "";
			let maxPercent = 0;
			for (let row in rowsInputs) {
				if (rowsInputs[row]["Group"] === groupName) {
					if (rowsInputs[row]["name"] === "Все элементы" || rowsInputs[row]["name"] === "Вся система") {
						rowNameTranslite = row;
						break;
					}
					if (maxPercent < rowsInputs[row]["Percent"].value) {
						maxPercent = rowsInputs[row]["Percent"].value;
					}
					rates.push({
						RowName: `${rowsInputs[row]["name"]}`,
						Percent: rowsInputs[row]["Percent"].value,
						Ocenka: rowsInputs[row]["Ocenka"].value,
					});
				}
			}
			input.value = maxPercent;

			if (rates.find((rate) => rate["Ocenka"] === "А")) {
				resultRate = "А";
				clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
				return;
			}
			if (resultRate !== "") {
				return;
			}
			if (rates.find((rate) => rate["Ocenka"] === "Н")) {
				resultRate = "Н";
				clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
				return;
			}
			if (resultRate !== "") {
				return;
			}
			resultRate = "Р";
			clickGenerator(appVariables[`${rowNameTranslite}Ocenka`], resultRate, true);
		}
	}

	setRatings();
}
