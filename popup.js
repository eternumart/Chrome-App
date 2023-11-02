document.addEventListener("DOMContentLoaded", initialization);

function initialization(evt) {
	evt.preventDefault();

	chrome.tabs.query({ active: true }, (tabs) => {
		const tab = tabs[0];
		if (tab) {
			chrome.scripting.executeScript({
				target: { tabId: tab.id, allFrames: true },
				func: app,
			});
		}
	});
}

function app() {
	// Предотвращение двойного старта
	if (sessionStorage.getItem("appStarted")) {
		return;
	}
	sessionStorage.setItem("appStarted", "true");

	let html, wholeAddress, isIFrame, iFrame, currentPage, form;

	// Определение наличия iFrame
	try {
		iFrame = document.querySelector("#formCanvas");
		isIFrame = true;
		console.log("isIFrame = true");
	} catch {
		isIFrame = false;
		console.log("isIFrame = false");
	}

	if (!isIFrame) {
		html = document;
		wholeAddress = document.querySelector("#comboboxTextcomp_12339").value;
	} else {
		html = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
		wholeAddress = document.querySelector("#title").textContent;
	}

	// Встраивание приложения в страницу
	const htmlHead = html.querySelector("head");
	const htmlBody = html.querySelector("body");
	const popupLayout = `<div class="app">
		<div class="header">
			<div class="header__title-wrapper">
				<div class="header__logo">
					<svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M13.8099 0H23.3333V20H13.8099L22.747 11.0196C23.3052 10.4587 23.3052 9.54127 22.747 8.98039L13.8099 0ZM0 0H9.52339L0.586308 8.98039C0.0281374 9.54127 0.0281374 10.4587 0.586308 11.0196L9.52339 20H0V0Z"
							fill="#1F5473"
						/>
						<path
							d="M8.07028 6.50342H10.1732C9.79199 6.73415 9.58506 7.10533 9.44982 7.53032H8.07028C7.87424 7.53032 7.69635 7.61149 7.56657 7.74191C7.43678 7.87232 7.356 8.05198 7.356 8.24806V11.8422C7.356 12.0392 7.43678 12.218 7.56657 12.3484C7.69635 12.4788 7.87515 12.56 8.07028 12.56H9.44982C9.58415 12.985 9.79199 13.3561 10.1732 13.5869H8.07028C7.59198 13.5869 7.15815 13.3908 6.84412 13.0752C6.53009 12.7597 6.33496 12.3228 6.33496 11.8431V8.24897C6.33496 7.76835 6.53009 7.33242 6.84412 7.01687C7.15815 6.6995 7.59289 6.50342 8.07028 6.50342Z"
							fill="#1A1A18"
						/>
						<path
							d="M11.7424 6.50342H13.8453C13.4641 6.73415 13.2572 7.10533 13.1219 7.53032H11.7424C11.5464 7.53032 11.3685 7.61149 11.2387 7.74191C11.1089 7.87232 11.0281 8.05198 11.0281 8.24806V11.8422C11.0281 12.0392 11.1089 12.218 11.2387 12.3484C11.3685 12.4788 11.5473 12.56 11.7424 12.56H13.1219C13.2563 12.985 13.4641 13.3561 13.8453 13.5869H11.7424C11.2641 13.5869 10.8303 13.3908 10.5162 13.0752C10.2022 12.7597 10.0071 12.3228 10.0071 11.8431V8.24897C10.0071 7.76835 10.2022 7.33242 10.5162 7.01687C10.8303 6.6995 11.265 6.50342 11.7424 6.50342Z"
							fill="#E2000F"
						/>
						<path
							d="M15.0616 6.50342H14.458C14.3337 6.58367 14.2184 6.68035 14.1168 6.7907C13.9262 6.9959 13.7801 7.24852 13.6938 7.53032H15.0616C15.2576 7.53032 15.4355 7.61149 15.5653 7.74191C15.6951 7.87232 15.7759 8.05198 15.7759 8.24806V9.29594H14.3237V10.2371H15.7759V11.8422C15.7759 12.0392 15.6951 12.218 15.5653 12.3484C15.4355 12.4788 15.2576 12.56 15.0616 12.56H13.6938C13.7801 12.8418 13.9262 13.0944 14.1168 13.2996C14.2184 13.4099 14.3337 13.5066 14.458 13.5869H15.0616C15.5399 13.5869 15.9737 13.3908 16.2878 13.0752C16.6018 12.7597 16.7969 12.3228 16.7969 11.8431V8.24897C16.7969 7.76835 16.6018 7.33242 16.2878 7.01687C15.9737 6.6995 15.5399 6.50342 15.0616 6.50342Z"
							fill="#1A1A18"
						/>
					</svg>
				</div>
				<h1 class="header__title">МЖИ менеджер v1.5.0</h1>
			</div>
			<div class="header__drag-button">
				<svg width="20" height="6" viewBox="0 0 20 6" fill="none" xmlns="http://www.w3.org/2000/svg">
					<line y1="3.5" x2="20" y2="3.5" stroke="#787878" />
					<line x1="20" y1="0.5" x2="4.37114e-08" y2="0.500002" stroke="#787878" />
				</svg>
			</div>
			<div class="header__buttons">
				<button class="header__button" id="cleanButton">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M18.8713 0L14.64 7.16364L11.5096 5.39618L10.186 7.51232L17.5073 11.6484L18.8308 9.52988L15.7535 7.79127L20 0.601178L18.8713 0ZM5.18284 3.99423C4.8392 3.99423 4.50963 4.12395 4.26664 4.35484C4.02364 4.58574 3.88713 4.8989 3.88713 5.22544C3.88713 5.55198 4.02364 5.86514 4.26664 6.09604C4.50963 6.32694 4.8392 6.45666 5.18284 6.45666C5.52649 6.45666 5.85605 6.32694 6.09905 6.09604C6.34204 5.86514 6.47855 5.55198 6.47855 5.22544C6.47855 4.8989 6.34204 4.58574 6.09905 4.35484C5.85605 4.12395 5.52649 3.99423 5.18284 3.99423ZM0.647855 5.22544C0.476033 5.22544 0.311249 5.2903 0.189753 5.40575C0.0682561 5.5212 0 5.67778 0 5.84105C0 6.00432 0.0682561 6.1609 0.189753 6.27635C0.311249 6.3918 0.476033 6.45666 0.647855 6.45666C0.819677 6.45666 0.984461 6.3918 1.10596 6.27635C1.22745 6.1609 1.29571 6.00432 1.29571 5.84105C1.29571 5.67778 1.22745 5.5212 1.10596 5.40575C0.984461 5.2903 0.819677 5.22544 0.647855 5.22544ZM2.59142 7.68787C2.24778 7.68787 1.91821 7.81759 1.67522 8.04848C1.43222 8.27938 1.29571 8.59254 1.29571 8.91908C1.29571 9.24562 1.43222 9.55878 1.67522 9.78968C1.91821 10.0206 2.24778 10.1503 2.59142 10.1503C2.93506 10.1503 3.26463 10.0206 3.50763 9.78968C3.75062 9.55878 3.88713 9.24562 3.88713 8.91908C3.88713 8.59254 3.75062 8.27938 3.50763 8.04848C3.26463 7.81759 2.93506 7.68787 2.59142 7.68787ZM9.06997 8.91908C7.62074 10.845 4.9697 12.3799 0 12.6127V13.8439C2.73876 17.9952 6.47855 20 11.6614 20H12.9571C14.6561 18.0458 16.0118 16.2665 16.8442 13.8439V12.6127L10.3657 8.91908H9.06997ZM9.75579 10.2753L15.3638 13.4736C14.6216 15.3779 13.4565 17.0486 12.0157 18.7303C7.77426 18.7688 3.9555 16.9719 1.71833 13.6347C5.75864 13.2523 8.22221 12.0529 9.75579 10.2753Z"
							fill="#787878"
						/>
					</svg>
				</button>
				<button class="header__button" id="minimizeButton">
					<svg width="20" height="2" viewBox="0 0 20 2" fill="none" xmlns="http://www.w3.org/2000/svg">
						<line y1="1" x2="20" y2="1" stroke="#787878" stroke-width="2" />
					</svg>
				</button>
				<button class="header__button" id="closeButton">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M20 1.32086L18.6792 0.00012207L10 8.67927L1.32085 0.00012207L0 1.32086L8.67921 10.0001L0 18.6793L1.32085 20L10 11.3209L18.6792 20L20 18.6793L11.3208 10.0001L20 1.32086Z" fill="#787878" />
					</svg>
				</button>
			</div>
		</div>

		<div class="tabs">
			<button class="tabs__button" id="main">Основное</button>
			<button class="tabs__button" id="photo">Фото</button>
		</div>

		<div class="main">
			<div class="content" id="main">
				<button class="main__button" id="copy">Копирование отчета</button>
				<button class="main__button" id="clean">Очистка отчета</button>
				<button class="main__button" id="paste">Вставка отчета</button>
			</div>
			<div class="content" id="photo">
				<form class="form" action="submit">
					<div class="form__field">
						<label class="form__label" for="file">Выбрать фото для загрузки</label>
						<input class="form__input" type="file" name="file" id="file" multiple />
					</div>
					<div class="form__field">
						<label class="form__label" for="date">Выбор даты загрузки фото</label>
						<input class="form__input" type="date" name="date" id="date" />
					</div>

					<input class="form__button" type="button" value="Загрузить" />
				</form>
			</div>
		</div>
		</div>`;
	const stylesLayout = `<style>
		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		  }
		  
		  .app {
			font-family: Inter;
			z-index: 999;
			background: #fff;
			position: fixed;
			width: 410px;
			top: 50px;
			right: 20px;
			border-radius: 10px;
			box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.5);
		  }
		  .app_minimized {
			top: unset !important;
    		bottom: 0 !important;
    		left: unset !important;
			max-height: 48px;
			width: auto;
		  }
		  .app_minimized .header__drag-button,
		  .app_minimized #cleanButton {
			display: none;
		  }
		  .app_minimized #minimizeButton {
			transform: rotate(180deg);
		  }
		  
		  .header {
			position: relative;
			width: 100%;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 14px 10px;
			border-bottom: 1px solid #e9e9e9;
		  }
		  
		  .header__title-wrapper {
			display: flex;
			align-items: center;
			gap: 10px;
		  }
		  
		  .header__logo {
			width: 24px;
		  }
		  
		  .header__title {
			color: #1a1a18;
			
			font-size: 20px;
			font-style: normal;
			font-weight: 400;
			line-height: 100%;
		  }
		  
		  .header__drag-button {
			position: absolute;
			top: 2px;
			left: calc(50% - (20px / 2));
			height: 6px;
			display: flex;
			align-items: center;
			cursor: grab;
		  }
		  
		  .header__buttons {
			display: flex;
			align-items: center;
			gap: 10px;
		  }
		  
		  .header__button {
			outline: none;
			border: none;
			display: flex;
			width: 20px;
			height: 20px;
			transition: opacity 0.3s;
			background-color: transparent;
			cursor: pointer;
			align-items: flex-end;
		  }
		  .header__button:hover {
			opacity: 0.7;
			transition: opacity 0.3s;
		  }

		  	.app_minimized .header {
				gap: 20px;
			}

			.animation {
				animation: colorChange;
				animation-duration: 1s;
				animation-timing-function: ease-in-out;
				animation-fill-mode: both;
				animation-direction: normal;
				animation-iteration-count: 1;
			
			}
			
			@keyframes colorChange {
				0% {
					fill: #787878;
				}
				50% {
					fill: #008000;
				}
				100% {
					fill: #787878;
				}
			}
		  
		  .tabs {
			display: flex;
			width: 100%;
			border-bottom: 1px solid #e9e9e9;
			margin-bottom: 20px;
		  }
		  
		  .tabs__button {
			outline: none;
			border: none;
			transition: 0.3s;
			cursor: pointer;
			background: #e9e9e9;
			width: 50%;
			padding: 8px;
			color: #1a1a18;
			text-align: center;
			
			font-size: 14px;
			font-style: normal;
			font-weight: 400;
			line-height: 100%;
		  }
		  
		  .tabs__button:hover {
			opacity: 0.7;
			transition: 0.3s;
		  }
		  
		  .tabs__button_active {
			background: #1f5473;
			color: #fff;
		  }
		  
		  .main {
			padding: 0 10px 20px 10px;
		  }
		  .content_deactive {
			display: none !important;
		  }		  
		  .content#main {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 10px;
		  }
		  
		  .main__button {
			outline: none;
			border: none;
			color: #1a1a18;
			font-size: 14px;
			font-style: normal;
			font-weight: 400;
			line-height: 100%;
			background: #e9e9e9;
			padding: 10px 0;
			transition: opacity 0.3s;
		  }
		  .main__button:hover {
			  transition: opacity 0.3s;
			  opacity: 0.7;
			  cursor: pointer;
		  }
		  .main__button_done {
			color: #00931a !important;
		  }
		  .main__button_error {
			color: #9f0000 !important;
		  }
		  .form__field {
			  display: flex;
			  flex-direction: column;
			  gap: 10px;
			  width: 100%;
			  margin-bottom: 20px;
		  }
		  
		  .form__label {
			  color: #1A1A18;
		  font-size: 12px;
		  font-style: normal;
		  font-weight: 400;
		  line-height: 100%;
		  }
		  
		  .form__input[type=file]::file-selector-button {
			  	width: 190px;
			  	border: none;
			  	background: #1F5473;
			  	padding: 10px 30px;
		  		margin-right: 10px;
			  	color: #fff;
			  cursor: pointer;
			  transition: opacity 0.3s;
			  font-size: 14px;
			  font-style: normal;
			  font-weight: 400;
			  line-height: 100%;
			}
			.form__input[type=file]::file-selector-button:hover {
			  transition: opacity 0.3s;
			  opacity: 0.7;
			}
			.form__input[type=date] {
			  width: 190px;
			  border: 1px solid #1F5473;
			  padding: 11px 10px;
			  color: #1A1A18;
		  font-size: 12px;
		  font-style: normal;
		  font-weight: 400;
		  line-height: 100%;
		  outline: none;
			}
		  
			.form__button {
			  width: 190px;
			  outline: none;
			  border: none;
			  background: #1F5473;
			  color: #FFF;
			  transition: opacity 0.3s;
		  
		  
		  font-size: 14px;
		  font-style: normal;
		  font-weight: 400;
		  line-height: 100%;
		  cursor: pointer;
		  padding: 10px 30px;
			}
		  
			.form__button:hover {
			  transition: opacity 0.3s;
			  opacity: 0.7;
			}	
	  	</style>`;

	// Определение страницы встраивания
	if (htmlBody.querySelector("#formData107")) {
		form = htmlBody.querySelector("#formData107");
		currentPage = "photo";
	} else {
		form = htmlBody.querySelector("#formData181");
		currentPage = "main";
	}

	htmlHead.insertAdjacentHTML("beforeEnd", stylesLayout);
	htmlBody.insertAdjacentHTML("afterBegin", popupLayout);

	const app = htmlBody.querySelector(".app");
	const dragIco = app.querySelector(".header__drag-button");
	const tabs = app.querySelectorAll(".tabs__button");
	const tabsContent = app.querySelectorAll(".content");
	const inputDate = app.querySelector("#date");
	const cleanButton = app.querySelector("#cleanButton");
	const minimizeButton = app.querySelector("#minimizeButton");
	const closeButton = app.querySelector("#closeButton");
	const copyButton = app.querySelector("#copy");
	const clearDataButton = app.querySelector("#clean");
	const pasteButton = app.querySelector("#paste");

	// Listeners
	dragIco.addEventListener("mousedown", startDraggingDiv);
	dragIco.addEventListener("dragstart", removeDefaultDrag);
	cleanButton.addEventListener("click", clearCache);
	minimizeButton.addEventListener("click", minimizeApp);
	closeButton.addEventListener("click", closeApp);
	clearDataButton.addEventListener("click", clearData);
	copyButton.addEventListener("click", saveData);
	pasteButton.addEventListener("click", loadData);
	tabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			changeTab(tab);
		});
	});

	// Установка табов и контента под текущую страницу
	currentPage === "main" ? tabs[0].classList.add("tabs__button_active") : tabs[1].classList.add("tabs__button_active");
	currentPage === "main" ? tabsContent[1].classList.add("content_deactive") : tabsContent[0].classList.add("content_deactive");

	setInitialDate(inputDate);

	// Функционал приложения
	function clearCache() {
		cleanButton.firstElementChild.firstElementChild.classList.add("animation");
		localStorage.removeItem("MJIDATA");
		localStorage.removeItem("DataLoaded");
		setTimeout(() => {
			cleanButton.firstElementChild.firstElementChild.classList.remove("animation");
		}, 1100);
	}

	function minimizeApp() {
		app.style.transition = "0.5s";
		app.classList.toggle("app_minimized");
		setTimeout(() => {
			app.style.transition = null;
		}, 500);
	}

	function closeApp() {
		cleanButton.removeEventListener("click", clearCache);
		minimizeButton.removeEventListener("click", minimizeApp);
		closeButton.removeEventListener("click", closeApp);
		dragIco.removeEventListener("mousedown", startDraggingDiv);
		sessionStorage.removeItem("appStarted");
		app.remove();
	}

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

	function changeTab(clickedTab) {
		tabs.forEach((tab) => {
			if (tab === clickedTab) {
				tab.classList.add("tabs__button_active");
			} else {
				tab.classList.remove("tabs__button_active");
			}
		});
		tabsContent.forEach((content) => {
			if (clickedTab.id === content.id) {
				content.classList.remove("content_deactive");
			} else {
				content.classList.add("content_deactive");
			}
		});
	}

	function startDraggingDiv(event) {
		dragIco.style.cursor = "grabbing";
		let shiftX = event.clientX - app.getBoundingClientRect().left;
		let shiftY = event.clientY - app.getBoundingClientRect().top;

		html.addEventListener("mousemove", onMouseMove);
		html.addEventListener("mouseup", () => {
			html.removeEventListener("mousemove", onMouseMove);
			dragIco.style.cursor = "grab";
			dragIco.onmouseup = null;
		});

		function moveAt(screenX, screenY) {
			app.style.left = screenX - shiftX + "px";
			app.style.top = screenY - 142 + "px";
		}

		function onMouseMove(event) {
			moveAt(event.screenX, event.screenY);
		}

		moveAt(event.screenX, event.screenY);
	}

	function removeDefaultDrag() {
		return false;
	}

	function saveData() {
		const area = wholeAddress.split(",")[0];
		const district = wholeAddress.split(",")[1];
		const address = htmlBody.querySelector("#comboboxTextcomp_12339").value;
		const repairProjectsTable = form.querySelector("#group_22130");
		const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
		const conclusionsPrevSurvey = form.querySelector("#gridSql_22131").querySelector(".data");
		const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

		const recomendationsDone = form.querySelector("#group_22127");
		const recomendationsRoofBlock = recomendationsDone.querySelector("#group_22193");
		const roofTable = recomendationsRoofBlock.querySelector("tbody");
		const roofRows = roofTable.querySelectorAll("tr");
		const balconyBlock = recomendationsDone.querySelector("#group_22196");
		const balconyTable = balconyBlock.querySelector("tbody");
		const balconyRows = balconyTable.querySelectorAll("tr");
		const mopBlock = recomendationsDone.querySelector("#group_22201");
		const mopTable = mopBlock.querySelector("tbody");
		const mopRows = mopTable.querySelectorAll("tr");
		const heatSystemBlock = recomendationsDone.querySelector("#group_22204");
		const heatSystemTable = heatSystemBlock.querySelector("tbody");
		const heatSystemRows = heatSystemTable.querySelectorAll("tr");
		const gvsBlock = recomendationsDone.querySelector("#group_22205");
		const gvsTable = gvsBlock.querySelector("tbody");
		const gvsRows = gvsTable.querySelectorAll("tr");
		const hvsBlock = recomendationsDone.querySelector("#group_22206");
		const hvsTable = hvsBlock.querySelector("tbody");
		const hvsRows = hvsTable.querySelectorAll("tr");
		const sewerBlock = recomendationsDone.querySelector("#group_22207");
		const sewerTable = sewerBlock.querySelector("tbody");
		const sewerRows = sewerTable.querySelector("tr");

		const results = form.querySelector("#group_22125");
		const resultsRoofBlock = results.querySelector("#group_22243");
		const resultsRoofTable = resultsRoofBlock.querySelector("tbody");
		const resultsRoofRows = resultsRoofTable.querySelectorAll("tr");

		const resultsBalconyBlock = results.querySelector("#group_22264");
		const resultsBalconyTable = resultsBalconyBlock.querySelector("tbody");
		const resultsBalconyRows = resultsBalconyTable.querySelectorAll("tr");

		const resultsMopBlock = results.querySelector("#group_22268");
		const resultsMopTable = resultsMopBlock.querySelector("tbody");
		const resultsMopRows = resultsMopTable.querySelectorAll("tr");

		const resultHeatSystemBlock = results.querySelector("#group_22271");
		const resultsHeatSystemTable = resultHeatSystemBlock.querySelector("tbody");
		const resultsHeatSystemRows = resultsHeatSystemTable.querySelectorAll("tr");

		const resultsGvsBlock = results.querySelector("#group_22272");
		const resultsGvsTable = resultsGvsBlock.querySelector("tbody");
		const resultsGvsRows = resultsGvsTable.querySelectorAll("tr");

		const resultsHvsBlock = results.querySelector("#group_22273");
		const resultsHvsTable = resultsHvsBlock.querySelector("tbody");
		const resultsHvsRows = resultsHvsTable.querySelectorAll("tr");

		const resultsSewerBlock = results.querySelector("#group_22274");
		const resultsSewerTable = resultsSewerBlock.querySelector("tbody");
		const resultsSewerRows = resultsSewerTable.querySelectorAll("tr");

		const signatoriesBlock = html.querySelector("#group_22133");
		const signatoriesTable = signatoriesBlock.querySelector("tbody");
		const signatoriesRows = signatoriesTable.querySelectorAll("tr");

		const data = {
			address: {
				area: area,
				district: district,
				address: address,
			},
			"Паспортные данные": {
				"Количество этажей": form.querySelector("#comp_12472").value,
				"Количество подъездов": form.querySelector("#comp_12473").value,
				"Строительный объем здания": form.querySelector("#comp_12474").value,
				"Кол-во квартир": form.querySelector("#comp_12475").value,
				"Площадь полезная": form.querySelector("#comp_12476").value,
				"Площадь в жилых помещениях": form.querySelector("#comp_12477").value,
				"Площадь в нежилых помещениях": form.querySelector("#comp_12478").value,
				"Серия проекта": form.querySelector("#lookupTextcomp_12479").value,
				"Год постройки": form.querySelector("#comp_12480").value,
				"Год реконструкции": form.querySelector("#comp_12481").value,
				"Класс энергетической эффективности здания": form.querySelector("#lookupTextcomp_12482").value,
				"Физический износ (%) по данным БТИ": form.querySelector("#comp_12661").value,
				"по данным БТИ на дату": form.querySelector("#comp_12662").value,
				"Наличие встроенных инженерных сооружений": form.querySelector("#lookupTextcomp_12663").value,
				"Кол-во встроенных инженерных сооружений": form.querySelector("#comp_12664").value,
				"Кол-во надстроенных инженерных сооружений": form.querySelector("#comp_12671").value,
				ТП: form.querySelector("#comp_12665").value,
				"в т.ч. масляные ТП": form.querySelector("#comp_12666").value,
				"Магистрали транзитные": form.querySelector("#lookupTextcomp_12667").value,
				"Факт. уд. потребление тепловой эн., Гкал/м²": form.querySelector("#comp_12668").value,
				"Проект. уд. потребление тепловой эн., кДж/(м²×град.×сут.)": form.querySelector("#comp_12669").value,
				"Величина отклонения (%)": form.querySelector("#comp_12670").value,
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
			"Выводы по результатам предыдущего обследования": {
				0: {
					id: "",
					Дата: "",
					"№": "",
					"Техническое состояние здания в целом": "",
				},
			},
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
					Рекомендации: recomendationsDone.querySelector("#comp_12489").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12490").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12491").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12492").value,
				},
				Герметизация: {
					Рекомендации: recomendationsDone.querySelector("#comp_12359").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12366").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12365").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12364").value,
				},
				Фасад: {
					Рекомендации: recomendationsDone.querySelector("#comp_12494").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12495").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12496").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12497").value,
					"Остекление оконных заполнений фасада": recomendationsDone.querySelector("#lookupTextcomp_12601").value,
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
					"Остекление балконов": recomendationsDone.querySelector("#lookupTextcomp_12604").value,
					"Остекление лоджий": recomendationsDone.querySelector("#lookupTextcomp_12603").value,
				},
				Стены: {
					Рекомендации: recomendationsDone.querySelector("#comp_12504").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12505").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12506").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12348").value,
					"Утепление стен": recomendationsDone.querySelector("#lookupTextcomp_12602").value,
				},
				Подвал: {
					Рекомендации: recomendationsDone.querySelector("#comp_12360").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12361").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12362").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12363").value,
				},
				"Тех.подполье": {
					Рекомендации: recomendationsDone.querySelector("#comp_12353").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12507").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12508").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12509").value,
				},
				"Тех.этаж": {
					Рекомендации: recomendationsDone.querySelector("#comp_12511").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12512").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12513").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12514").value,
				},
				"Гараж стоянка (подземный)": {
					Рекомендации: recomendationsDone.querySelector("#comp_12516").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12517").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12518").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12519").value,
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
					Рекомендации: recomendationsDone.querySelector("#comp_12526").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12527").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12528").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12529").value,
				},
				Перекрытия: {
					Рекомендации: recomendationsDone.querySelector("#comp_12531").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12532").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12533").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12534").value,
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
					Рекомендации: recomendationsDone.querySelector("#comp_12556").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12557").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12558").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12559").value,
				},
				"Система промывки и прочистки стволов мусоропроводов": {
					Рекомендации: recomendationsDone.querySelector("#comp_12561").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12562").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12563").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12564").value,
				},
				"Вентиляц.": {
					Рекомендации: recomendationsDone.querySelector("#comp_12566").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12567").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12568").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12569").value,
				},
				Газоходы: {
					Рекомендации: recomendationsDone.querySelector("#comp_12576").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12577").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12578").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12579").value,
				},
				Лифты: {
					Рекомендации: recomendationsDone.querySelector("#comp_12581").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12582").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12583").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12584").value,
				},
				"Подъёмное устройство для маломобильной группы населения": {
					Рекомендации: recomendationsDone.querySelector("#comp_12586").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12587").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12588").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12589").value,
				},
				"Устройство для автоматического опускания лифта": {
					Рекомендации: recomendationsDone.querySelector("#comp_12591").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12592").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12593").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12594").value,
				},
				"Система ЭС (ВРУ)": {
					Рекомендации: recomendationsDone.querySelector("#comp_12596").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12597").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12598").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12599").value,
				},
				"ВКВ (второй кабельный ввод)": {
					Рекомендации: recomendationsDone.querySelector("#comp_12436").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12437").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12438").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12439").value,
				},
				"АВР (автоматическое включение резервного питания)": {
					Рекомендации: recomendationsDone.querySelector("#comp_12441").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12442").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12443").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12404").value,
				},
				ППАиДУ: {
					Рекомендации: recomendationsDone.querySelector("#comp_12406").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12407").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12408").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12409").value,
				},
				"Система оповещения о пожаре": {
					Рекомендации: recomendationsDone.querySelector("#comp_12411").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12412").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12413").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12414").value,
				},
				ГС: {
					Рекомендации: recomendationsDone.querySelector("#comp_12416").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12417").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12418").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12419").value,
				},
				"Связь с ОДС": {
					Рекомендации: recomendationsDone.querySelector("#comp_12421").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12422").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12423").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12424").value,
				},
				"Система видеонаблюдения": {
					Рекомендации: recomendationsDone.querySelector("#comp_12426").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12427").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12428").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12429").value,
				},
				"ОЗДС(охранно-защитная дератизационная система)": {
					Рекомендации: recomendationsDone.querySelector("#comp_12431").value,
					"Треб. объем, %": recomendationsDone.querySelector("#comp_12432").value,
					"Выполнен, год": recomendationsDone.querySelector("#comp_12423").value,
					"Факт. объем, %": recomendationsDone.querySelector("#comp_12424").value,
				},
				"Общий вывод: Рекомендации по выполнению объемов капитального ремонта": recomendationsDone.querySelector("#lookupTextcomp_12435").value,
			},
			"Результаты выборочного обследования": {
				Крыша: {
					"Конструкция крыши": results.querySelector("#lookupTextcomp_12453").value,
					"Материал кровли": results.querySelector("#lookupTextcomp_12454").value,
					"Площадь кровли, м²": results.querySelector("#comp_12455").value,
					Кровля: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Свесы: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Стропильная система": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Чердак: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Покрытие ж/б": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Все элементы": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				Водоотвод: {
					"Тип водоотвода": results.querySelector("#lookupTextcomp_12456").value,
					"Материал водоотвода": results.querySelector("#lookupTextcomp_12457").value,
					"Выявленные дефекты": results.querySelector("#comp_12647").value,
					"Оценка пред.": results.querySelector("#comp_12648").value,
					"% деф. части": results.querySelector("#comp_12649").value,
					Оценка: results.querySelector("#lookupTextcomp_12650").value,
				},
				"Межпанельные стыки": {
					"Тип стыков": results.querySelector("#lookupTextcomp_12458").value,
					"Выявленные дефекты": results.querySelector("#comp_12652").value,
					"Оценка пред.": results.querySelector("#comp_12653").value,
					"% деф. части": results.querySelector("#comp_12654").value,
					Оценка: results.querySelector("#lookupTextcomp_12655").value,
				},
				Фасад: {
					"Площадь фасада, м²": results.querySelector("#comp_12459").value,
					"Отделка стен": results.querySelector("#lookupTextcomp_12460").value,
					"Отделка цоколя": results.querySelector("#lookupTextcomp_12461").value,
					"Оконные заполнения": results.querySelector("#lookupTextcomp_12462").value,

					"Выявленные дефекты": results.querySelector("#comp_12657").value,
					"Оценка пред.": results.querySelector("#comp_12658").value,
					"% деф. части": results.querySelector("#comp_12659").value,
					Оценка: results.querySelector("#lookupTextcomp_12660").value,
				},
				Балконы: {
					"Количество балконов": results.querySelector("#comp_12463").value,
					"Количество лоджий": results.querySelector("#comp_12464").value,
					"Козырьков над входами": results.querySelector("#comp_12465").value,
					"Козырьков на верхних этажах": results.querySelector("#comp_12466").value,
					"Козырьков непроектных": results.querySelector("#comp_12467").value,
					"Количество эркеров": results.querySelector("#comp_12468").value,

					Балконы: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Лоджии: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Козырьки: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Эркеры: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Все элементы": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				Стены: {
					"Материал стен": results.querySelector("#lookupTextcomp_12444").value,
					"Теплофизические свойства": results.querySelector("#lookupTextcomp_12445").value,

					"Выявленные дефекты": results.querySelector("#comp_12624").value,
					"Оценка пред.": results.querySelector("#comp_12625").value,
					"% деф. части": results.querySelector("#comp_12626").value,
					Оценка: results.querySelector("#lookupTextcomp_12672").value,
				},
				Подвал: {
					"Наличие подвала": results.querySelector("#lookupTextcomp_12446").value,
					"Площадь, м²": results.querySelector("#comp_12447").value,

					"Выявленные дефекты": results.querySelector("#comp_12628").value,
					"Оценка пред.": results.querySelector("#comp_12629").value,
					"% деф. части": results.querySelector("#comp_12630").value,
					Оценка: results.querySelector("#lookupTextcomp_12631").value,
				},
				"Тех.подполье": {
					"Наличие тех.подполья": results.querySelector("#lookupTextcomp_12448").value,

					"Выявленные дефекты": results.querySelector("#comp_12633").value,
					"Оценка пред.": results.querySelector("#comp_12634").value,
					"% деф. части": results.querySelector("#comp_12635").value,
					Оценка: results.querySelector("#lookupTextcomp_12636").value,
				},
				"Тех.этаж": {
					"Наличие тех.этажа": results.querySelector("#lookupTextcomp_12449").value,
					"Местонахождение, этаж": results.querySelector("#comp_12367").value,

					"Выявленные дефекты": results.querySelector("#comp_12638").value,
					"Оценка пред.": results.querySelector("#comp_12639").value,
					"% деф. части": results.querySelector("#comp_12640").value,
					Оценка: results.querySelector("#lookupTextcomp_12673").value,
				},
				"Гараж стоянка (подземный)": {
					Тип: results.querySelector("#lookupTextcomp_12450").value,
					"Площадь,м²": results.querySelector("#comp_12451").value,
					"Этажность, эт": results.querySelector("#comp_12452").value,
					"Количество маш.мест, шт": results.querySelector("#comp_12369").value,

					"Выявленные дефекты": results.querySelector("#comp_12747").value,
					"Оценка пред.": results.querySelector("#comp_12748").value,
					"% деф. части": results.querySelector("#comp_12749").value,
					Оценка: results.querySelector("#lookupTextcomp_12750").value,
				},
				"Места общего пользования": {
					"Пандусы наружные, шт": results.querySelector("#comp_12463").value,
					"Пандусы внутренние, шт": results.querySelector("#comp_12464").value,
					"Сходы-съезды, шт.": results.querySelector("#comp_12465").value,

					Вестибюли: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Крыльца: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Пандусы наружные": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Пандусы внутри-подъездные": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Сходы/съезды": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Окна, двери": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Внутренняя отделка помещений": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Все элементы": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				Лестницы: {
					Конструкция: results.querySelector("#lookupTextcomp_12370").value,

					"Выявленные дефекты": results.querySelector("#comp_12757").value,
					"Оценка пред.": results.querySelector("#comp_12758").value,
					"% деф. части": results.querySelector("#comp_12759").value,
					Оценка: results.querySelector("#lookupTextcomp_12674").value,
				},
				Перекрытия: {
					"Материал перекрытия": results.querySelector("#lookupTextcomp_12371").value,

					"Выявленные дефекты": results.querySelector("#comp_12761").value,
					"Оценка пред.": results.querySelector("#comp_12762").value,
					"% деф. части": results.querySelector("#comp_12763").value,
					Оценка: results.querySelector("#lookupTextcomp_12764").value,
				},
				"Система отопления": {
					"Вид отопления": results.querySelector("#lookupTextcomp_12605").value,
					"Материал трубопроводов": results.querySelector("#lookupTextcomp_13393").value,
					"Тип приборов": results.querySelector("#lookupTextcomp_12372").value,
					"Термо-регуляторы в квартирах": results.querySelector("#lookupTextcomp_12373").value,
					"Наличие АУУ, шт": results.querySelector("#comp_12374").value,
					"Наличие ОДУУ": results.querySelector("#lookupTextcomp_12375").value,
					"Элеваторный узел, шт": results.querySelector("#comp_12376").value,
					"Тепловой узел, шт": results.querySelector("#comp_12377").value,
					"Тип стояков": results.querySelector("#lookupTextcomp_12299").value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Транзит питающий": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Чердак: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Этажи: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Вся система": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				ГВС: {
					"Тип системы": results.querySelector("#lookupTextcomp_12378").value,
					"Материал трубопроводов": results.querySelector("#lookupTextcomp_12379").value,
					"Наличие ОДУУ": results.querySelector("#lookupTextcomp_12380").value,
					"Тип стояков": results.querySelector("#lookupTextcomp_13394").value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Транзит питающий": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Чердак: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Этажи: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Вся система": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				ХВС: {
					"Материал трубопроводов": results.querySelector("#lookupTextcomp_12382").value,
					"Наличие ОДУУ": results.querySelector("#lookupTextcomp_12381").value,
					"Тип стояков": results.querySelector("#lookupTextcomp_13395").value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Транзит питающий": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Внутренний пожарный водопровод": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Этажи: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Вся система": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				Канализация: {
					"Материал трубопроводов": results.querySelector("#lookupTextcomp_12383").value,
					"Тип стояков": results.querySelector("#lookupTextcomp_13396").value,

					"Тех.подполье/тех.этаж": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					Этажи: {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
					"Вся система": {
						"Выявленные дефекты": "",
						"Оценка пред.": "",
						"% деф. части": "",
						Оценка: "",
					},
				},
				Мусоропроводы: {
					Мусоропроводы: results.querySelector("#lookupTextcomp_12384").value,
					Мусорокамеры: results.querySelector("#lookupTextcomp_12385").value,

					"Выявленные дефекты": results.querySelector("#comp_12785").value,
					"Оценка пред.": results.querySelector("#comp_12786").value,
					"% деф. части": results.querySelector("#comp_12787").value,
					Оценка: results.querySelector("#lookupTextcomp_12788").value,
				},
				"Связь с ОДС": {
					Тип: results.querySelector("#lookupTextcomp_12386").value,
					Состояние: results.querySelector("#lookupTextcomp_12607").value,

					"Выявленные дефекты": results.querySelector("#comp_12790").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12791").value,
					"Специализированная организация": results.querySelector("#comp_12792").value,
					"Оценка пред.": results.querySelector("#comp_13401").value,
					Оценка: results.querySelector("#lookupTextcomp_12793").value,
				},
				Вентиляция: {
					Состояние: results.querySelector("#lookupTextcomp_12608").value,

					"Выявленные дефекты": results.querySelector("#comp_12795").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12796").value,
					"Специализированная организация": results.querySelector("#comp_12797").value,
					"Оценка пред.": results.querySelector("#comp_13402").value,
					Оценка: results.querySelector("#lookupTextcomp_12798").value,
				},
				"Система промывки и прочистки стволов мусоропроводов": {
					Наличие: results.querySelector("#lookupTextcomp_12387").value,
					Состояние: results.querySelector("#lookupTextcomp_12609").value,

					"Выявленные дефекты": results.querySelector("#comp_12800").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12801").value,
					"Специализированная организация": results.querySelector("#comp_12802").value,
					"Оценка пред.": results.querySelector("#comp_13403").value,
					Оценка: results.querySelector("#lookupTextcomp_12803").value,
				},
				"ОЗДС (охранно-защитная дератизационная система)": {
					Наличие: results.querySelector("#lookupTextcomp_12388").value,
					Состояние: results.querySelector("#lookupTextcomp_12610").value,

					"Выявленные дефекты": results.querySelector("#comp_12677").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12678").value,
					"Специализированная организация": results.querySelector("#comp_12679").value,
					"Оценка пред.": results.querySelector("#comp_13404").value,
					Оценка: results.querySelector("#lookupTextcomp_12680").value,
				},
				Газоходы: {
					Наличие: results.querySelector("#lookupTextcomp_12390").value,
					Состояние: results.querySelector("#lookupTextcomp_12612").value,

					"Выявленные дефекты": results.querySelector("#comp_12687").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12688").value,
					"Специализированная организация": results.querySelector("#comp_12689").value,
					"Оценка пред.": results.querySelector("#comp_13405").value,
					Оценка: results.querySelector("#lookupTextcomp_12690").value,
				},
				Лифты: {
					"Пассажирские, шт": results.querySelector("#comp_12391").value,
					"Грузопассажирские, шт": results.querySelector("#comp_12392").value,
					"В т.ч. навесные, шт": results.querySelector("#comp_12393").value,
					Состояние: results.querySelector("#lookupTextcomp_12613").value,

					"Выявленные дефекты": results.querySelector("#comp_12692").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12693").value,
					"Специализированная организация": results.querySelector("#comp_12694").value,
					"Оценка пред.": results.querySelector("#comp_13406").value,
					Оценка: results.querySelector("#lookupTextcomp_12695").value,
				},
				"Подъёмное устройство для маломобильной группы населения": {
					"Кол-во, шт": results.querySelector("#comp_12394").value,
					Состояние: results.querySelector("#lookupTextcomp_12614").value,

					"Выявленные дефекты": results.querySelector("#comp_12697").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12698").value,
					"Специализированная организация": results.querySelector("#comp_12699").value,
					"Оценка пред.": results.querySelector("#comp_13407").value,
					Оценка: results.querySelector("#lookupTextcomp_12700").value,
				},
				"Устройство для автоматического опускания лифта": {
					Наличие: results.querySelector("#lookupTextcomp_12395").value,
					Состояние: results.querySelector("#lookupTextcomp_12615").value,

					"Выявленные дефекты": results.querySelector("#comp_12702").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12703").value,
					"Специализированная организация": results.querySelector("#comp_12704").value,
					"Оценка пред.": results.querySelector("#comp_13408").value,
					Оценка: results.querySelector("#lookupTextcomp_12705").value,
				},
				"Система ЭС": {
					"Кол-во ВРУ, шт": results.querySelector("#comp_12397").value,
					"Размещение ВРУ": results.querySelector("#lookupTextcomp_12396").value,
					Состояние: results.querySelector("#lookupTextcomp_12616").value,

					"Выявленные дефекты": results.querySelector("#comp_12707").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12708").value,
					"Специализированная организация": results.querySelector("#comp_12709").value,
					"Оценка пред.": results.querySelector("#comp_13409").value,
					Оценка: results.querySelector("#lookupTextcomp_12710").value,
				},
				"ВКВ (второй кабельный ввод)": {
					Наличие: results.querySelector("#lookupTextcomp_12398").value,
					Состояние: results.querySelector("#lookupTextcomp_12622").value,

					"Выявленные дефекты": results.querySelector("#comp_12712").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12713").value,
					"Специализированная организация": results.querySelector("#comp_12714").value,
					"Оценка пред.": results.querySelector("#comp_13409").value,
					Оценка: results.querySelector("#lookupTextcomp_12715").value,
				},
				"АВР (автоматическое включение резервного питания)": {
					Наличие: results.querySelector("#lookupTextcomp_12399").value,
					Состояние: results.querySelector("#lookupTextcomp_12617").value,

					"Выявленные дефекты": results.querySelector("#comp_12717").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12718").value,
					"Специализированная организация": results.querySelector("#comp_12719").value,
					"Оценка пред.": results.querySelector("#comp_13411").value,
					Оценка: results.querySelector("#lookupTextcomp_12720").value,
				},
				ППАиДУ: {
					Тип: results.querySelector("#lookupTextcomp_12400").value,
					Состояние: results.querySelector("#lookupTextcomp_12618").value,

					"Выявленные дефекты": results.querySelector("#comp_12722").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12723").value,
					"Специализированная организация": results.querySelector("#comp_12724").value,
					"Оценка пред.": results.querySelector("#comp_13412").value,
					Оценка: results.querySelector("#lookupTextcomp_12725").value,
				},
				"Система оповещения о пожаре": {
					Наличие: results.querySelector("#lookupTextcomp_12401").value,
					Состояние: results.querySelector("#lookupTextcomp_12619").value,

					"Выявленные дефекты": results.querySelector("#comp_12727").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12728").value,
					"Специализированная организация": results.querySelector("#comp_12729").value,
					"Оценка пред.": results.querySelector("#comp_13413").value,
					Оценка: results.querySelector("#lookupTextcomp_12730").value,
				},
				"Система ГС": {
					Вводы: results.querySelector("#lookupTextcomp_12402").value,
					Разводка: results.querySelector("#lookupTextcomp_12403").value,
					Состояние: results.querySelector("#lookupTextcomp_12620").value,

					"Выявленные дефекты": results.querySelector("#comp_12732").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12733").value,
					"Специализированная организация": results.querySelector("#comp_12734").value,
					"Оценка пред.": results.querySelector("#comp_13414").value,
					Оценка: results.querySelector("#lookupTextcomp_12740").value,
				},
				"Система видеонаблюдения": {
					Место: results.querySelector("#lookupTextcomp_12349").value,
					Состояние: results.querySelector("#lookupTextcomp_12621").value,

					"Выявленные дефекты": results.querySelector("#comp_12742").value,
					"№ и дата последнего обслед.": results.querySelector("#comp_12743").value,
					"Специализированная организация": results.querySelector("#comp_12744").value,
					"Оценка пред.": results.querySelector("#comp_13415").value,
					Оценка: results.querySelector("#lookupTextcomp_12745").value,
				},
				"Дополнительные данные": results.querySelector("#comp_12324").value,
				"Выполнено обследование": results.querySelector("#lookupTextcomp_12347").value,
				"Рекомендации по утеплению стен": results.querySelector("#lookupTextcomp_12350").value,
			},
			"Выводы по результатам обследования": {
				"Техническое состояние (приведенная оценка) здания (в целом)": form.querySelector("#lookupTextcomp_12325").value,
				"РЕКОМЕНДАЦИИ по ремонтно-восстановительным работам": form.querySelector("#comp_12606").value,
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

		for (let i = 0; i < repairProjectsTableRows.length; i++) {
			if (i < 2 || repairProjectsTableRows[i].classList.contains("gridBGTotal")) {
				continue;
			}
			if (i > 1) {
				data["Технические заключения и проекты ремонтов"][i]["Организация"] = repairProjectsTableRows[i].querySelector("#comp_12333").value;
				data["Технические заключения и проекты ремонтов"][i]["Дата, №"] = repairProjectsTableRows[i].querySelector("#comp_12334").value;
				data["Технические заключения и проекты ремонтов"][i]["Наименование, содержание"] = repairProjectsTableRows[i].querySelector("#comp_12335").value;
			}
		}
		for (let i = 0; i < conclusionsPrevSurveyRows.length; i++) {
			if (!data["Выводы по результатам предыдущего обследования"][i]) {
				data["Выводы по результатам предыдущего обследования"][i] = new Object();
			}
			data["Выводы по результатам предыдущего обследования"][i]["id"] = conclusionsPrevSurveyRows[i].querySelector("td:nth-child(1)").firstElementChild.textContent;
			data["Выводы по результатам предыдущего обследования"][i]["Дата"] = conclusionsPrevSurveyRows[i].querySelector("td:nth-child(2)").textContent;
			data["Выводы по результатам предыдущего обследования"][i]["№"] = conclusionsPrevSurveyRows[i].querySelector("td:nth-child(3)").textContent;
			data["Выводы по результатам предыдущего обследования"][i]["Техническое состояние здания в целом"] = conclusionsPrevSurveyRows[i].querySelector("td:nth-child(4)").textContent;
		}
		// РЕКОМЕНДАЦИИ ПО КАП РЕМОНТУ
		// Крыша
		for (let i = 1; i < roofRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][roofRows[i].querySelector("#lookupTextcomp_12483").textContent]["Рекомендации"] = roofRows[i].querySelector("#comp_12484").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][roofRows[i].querySelector("#lookupTextcomp_12483").textContent]["Треб. объем, %"] = roofRows[i].querySelector("#comp_12485").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][roofRows[i].querySelector("#lookupTextcomp_12483").textContent]["Выполнен, год"] = roofRows[i].querySelector("#comp_12486").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Крыша"][roofRows[i].querySelector("#lookupTextcomp_12483").textContent]["Факт. объем, %"] = roofRows[i].querySelector("#comp_12487").value;
		}
		// Балконы
		for (let i = 1; i < balconyRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][balconyRows[i].querySelector("#lookupTextcomp_12498").textContent]["Рекомендации"] = balconyRows[i].querySelector("#comp_12499").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][balconyRows[i].querySelector("#lookupTextcomp_12498").textContent]["Треб. объем, %"] = balconyRows[i].querySelector("#comp_12500").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][balconyRows[i].querySelector("#lookupTextcomp_12498").textContent]["Выполнен, год"] = balconyRows[i].querySelector("#comp_12501").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Балконы"][balconyRows[i].querySelector("#lookupTextcomp_12498").textContent]["Факт. объем, %"] = balconyRows[i].querySelector("#comp_12502").value;
		}
		// Места общего пользования
		for (let i = 1; i < mopRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][mopRows[i].querySelector("#lookupTextcomp_12520").textContent]["Рекомендации"] = mopRows[i].querySelector("#comp_12521").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][mopRows[i].querySelector("#lookupTextcomp_12520").textContent]["Треб. объем, %"] = mopRows[i].querySelector("#comp_12522").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][mopRows[i].querySelector("#lookupTextcomp_12520").textContent]["Выполнен, год"] = mopRows[i].querySelector("#comp_12523").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Места общего пользования"][mopRows[i].querySelector("#lookupTextcomp_12520").textContent]["Факт. объем, %"] = mopRows[i].querySelector("#comp_12524").value;
		}
		// Системы отопления
		for (let i = 1; i < heatSystemRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent]["Рекомендации"] = heatSystemRows[i].querySelector("#comp_12536").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent]["Треб. объем, %"] = heatSystemRows[i].querySelector("#comp_12537").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent]["Выполнен, год"] = heatSystemRows[i].querySelector("#comp_12538").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Система отопления"][heatSystemRows[i].querySelector("#lookupTextcomp_12535").textContent]["Факт. объем, %"] = heatSystemRows[i].querySelector("#comp_12539").value;
		}
		// ГВС
		for (let i = 1; i < gvsRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][gvsRows[i].querySelector("#lookupTextcomp_12540").textContent]["Рекомендации"] = gvsRows[i].querySelector("#comp_12541").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][gvsRows[i].querySelector("#lookupTextcomp_12540").textContent]["Треб. объем, %"] = gvsRows[i].querySelector("#comp_12542").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][gvsRows[i].querySelector("#lookupTextcomp_12540").textContent]["Выполнен, год"] = gvsRows[i].querySelector("#comp_12543").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ГВС"][gvsRows[i].querySelector("#lookupTextcomp_12540").textContent]["Факт. объем, %"] = gvsRows[i].querySelector("#comp_12544").value;
		}
		// ХВС
		for (let i = 1; i < hvsRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][hvsRows[i].querySelector("#lookupTextcomp_12545").textContent]["Рекомендации"] = hvsRows[i].querySelector("#comp_12546").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][hvsRows[i].querySelector("#lookupTextcomp_12545").textContent]["Треб. объем, %"] = hvsRows[i].querySelector("#comp_12547").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][hvsRows[i].querySelector("#lookupTextcomp_12545").textContent]["Выполнен, год"] = hvsRows[i].querySelector("#comp_12548").value;
			data["Выполнение рекомендаций по кап. ремонту"]["ХВС"][hvsRows[i].querySelector("#lookupTextcomp_12545").textContent]["Факт. объем, %"] = hvsRows[i].querySelector("#comp_12549").value;
		}
		// Канализация
		for (let i = 1; i < sewerRows.length; i++) {
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][sewerRows[i].querySelector("#lookupTextcomp_12550").textContent]["Рекомендации"] = sewerRows[i].querySelector("#comp_12551").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][sewerRows[i].querySelector("#lookupTextcomp_12550").textContent]["Треб. объем, %"] = sewerRows[i].querySelector("#comp_12552").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][sewerRows[i].querySelector("#lookupTextcomp_12550").textContent]["Выполнен, год"] = sewerRows[i].querySelector("#comp_12553").value;
			data["Выполнение рекомендаций по кап. ремонту"]["Канализация"][sewerRows[i].querySelector("#lookupTextcomp_12550").textContent]["Факт. объем, %"] = sewerRows[i].querySelector("#comp_12554").value;
		}

		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		for (let i = 1; i < resultsRoofRows.length; i++) {
			if (!resultsRoofRows[i].querySelector("#comp_12642")) {
				continue;
			}
			data["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Выявленные дефекты"] = resultsRoofRows[i].querySelector("#comp_12642").value;
			data["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Оценка пред."] = resultsRoofRows[i].querySelector("#lookupTextcomp_12643").textContent;
			data["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["% деф. части"] = resultsRoofRows[i].querySelector("#comp_12644").value;
			data["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Оценка"] = resultsRoofRows[i].querySelector("#lookupTextcomp_12645").value;
		}
		// Балконы
		for (let i = 1; i < resultsBalconyRows.length; i++) {
			if (!resultsBalconyRows[i].querySelector("#comp_12736")) {
				continue;
			}
			data["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Выявленные дефекты"] = resultsBalconyRows[i].querySelector("#comp_12736").value;
			data["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Оценка пред."] = resultsBalconyRows[i].querySelector("#comp_12737").value;
			data["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["% деф. части"] = resultsBalconyRows[i].querySelector("#comp_12738").value;
			data["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Оценка"] = resultsBalconyRows[i].querySelector("#lookupTextcomp_12739").value;
		}
		// Места общего пользования
		for (let i = 1; i < resultsMopRows.length; i++) {
			if (!resultsMopRows[i].querySelector("#comp_12752")) {
				continue;
			}
			data["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Выявленные дефекты"] = resultsMopRows[i].querySelector("#comp_12752").value;
			data["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Оценка пред."] = resultsMopRows[i].querySelector("#comp_12753").value;
			data["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["% деф. части"] = resultsMopRows[i].querySelector("#comp_12754").value;
			data["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Оценка"] = resultsMopRows[i].querySelector("#lookupTextcomp_12755").value;
		}
		// Система отопления
		for (let i = 1; i < resultsHeatSystemRows.length; i++) {
			if (!resultsHeatSystemRows[i].querySelector("#comp_12766")) {
				continue;
			}
			data["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Выявленные дефекты"] = resultsHeatSystemRows[i].querySelector("#comp_12766").value;
			data["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Оценка пред."] = resultsHeatSystemRows[i].querySelector("#comp_12767").value;
			data["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["% деф. части"] = resultsHeatSystemRows[i].querySelector("#comp_12768").value;
			data["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Оценка"] = resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769").value;
		}
		// ГВС
		for (let i = 1; i < resultsGvsRows.length; i++) {
			if (!resultsGvsRows[i].querySelector("#comp_12771")) {
				continue;
			}
			data["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Выявленные дефекты"] = resultsGvsRows[i].querySelector("#comp_12771").value;
			data["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Оценка пред."] = resultsGvsRows[i].querySelector("#comp_12772").value;
			data["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["% деф. части"] = resultsGvsRows[i].querySelector("#comp_12773").value;
			data["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Оценка"] = resultsGvsRows[i].querySelector("#lookupTextcomp_12675").value;
		}
		// ХВС
		for (let i = 1; i < resultsHvsRows.length; i++) {
			if (!resultsHvsRows[i].querySelector("#comp_12775")) {
				continue;
			}
			data["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Выявленные дефекты"] = resultsHvsRows[i].querySelector("#comp_12775").value;
			data["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Оценка пред."] = resultsHvsRows[i].querySelector("#comp_12776").value;
			data["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["% деф. части"] = resultsHvsRows[i].querySelector("#comp_12777").value;
			data["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Оценка"] = resultsHvsRows[i].querySelector("#lookupTextcomp_12778").value;
		}
		// Канализация
		for (let i = 1; i < resultsSewerRows.length; i++) {
			if (!resultsSewerRows[i].querySelector("#comp_12780")) {
				continue;
			}
			data["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Выявленные дефекты"] = resultsSewerRows[i].querySelector("#comp_12780").value;
			data["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Оценка пред."] = resultsSewerRows[i].querySelector("#comp_12781").value;
			data["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["% деф. части"] = resultsSewerRows[i].querySelector("#comp_12782").value;
			data["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Оценка"] = resultsSewerRows[i].querySelector("#lookupTextcomp_12783").value;
		}

		// Подписывающие лица
		for (let i = 1; i < signatoriesRows.length; i++) {
			if (!signatoriesRows[i].querySelector("#comp_12340")) {
				continue;
			}
			data["Подписывающие лица"]["Представители от"][i] = signatoriesRows[i].querySelector("#comp_12340").value;
			data["Подписывающие лица"]["Должность и наименование организации"][i] = signatoriesRows[i].querySelector("#comp_12341").value;
			data["Подписывающие лица"]["ФИО должностного лица"][i] = signatoriesRows[i].querySelector("#comp_12342").value;
		}

		localStorage.setItem("MJIDATA", JSON.stringify(data));

		copyButton.textContent = "Скопировано";
		copyButton.classList.add("main__button_done");
		setTimeout(() => {
			copyButton.textContent = "Копирование отчета";
			copyButton.classList.remove("main__button_done");
		}, 1500);
	}

	function loadData() {
		// Если никаких данных в localStorage нет - выходим из функции
		if (localStorage.getItem("MJIDATA") === null) {
			pasteButton.classList.add("main__button_error");
			pasteButton.textContent = "Ничего не скопировано";
			setTimeout(() => {
				pasteButton.textContent = "Вставка отчета";
				pasteButton.classList.remove("main__button_error");
			}, 1500);
			return;
		}
		const loadData = JSON.parse(localStorage.getItem("MJIDATA"));

		const area = wholeAddress.split(",")[0];
		const district = wholeAddress.split(",")[1];
		const address = htmlBody.querySelector("#comboboxTextcomp_12339").value;
		const repairProjectsTable = form.querySelector("#group_22130");
		const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
		const conclusionsPrevSurvey = form.querySelector("#gridSql_22131").querySelector(".data");
		const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

		const recomendationsDone = form.querySelector("#group_22127");
		const recomendationsRoofBlock = recomendationsDone.querySelector("#group_22193");
		const roofTable = recomendationsRoofBlock.querySelector("tbody");
		const roofRows = roofTable.querySelectorAll("tr");
		const balconyBlock = recomendationsDone.querySelector("#group_22196");
		const balconyTable = balconyBlock.querySelector("tbody");
		const balconyRows = balconyTable.querySelectorAll("tr");
		const mopBlock = recomendationsDone.querySelector("#group_22201");
		const mopTable = mopBlock.querySelector("tbody");
		const mopRows = mopTable.querySelectorAll("tr");
		const heatSystemBlock = recomendationsDone.querySelector("#group_22204");
		const heatSystemTable = heatSystemBlock.querySelector("tbody");
		const heatSystemRows = heatSystemTable.querySelectorAll("tr");
		const gvsBlock = recomendationsDone.querySelector("#group_22205");
		const gvsTable = gvsBlock.querySelector("tbody");
		const gvsRows = gvsTable.querySelectorAll("tr");
		const hvsBlock = recomendationsDone.querySelector("#group_22206");
		const hvsTable = hvsBlock.querySelector("tbody");
		const hvsRows = hvsTable.querySelectorAll("tr");
		const sewerBlock = recomendationsDone.querySelector("#group_22207");
		const sewerTable = sewerBlock.querySelector("tbody");
		const sewerRows = sewerTable.querySelector("tr");

		const results = form.querySelector("#group_22125");
		const resultsRoofBlock = results.querySelector("#group_22243");
		const resultsRoofTable = resultsRoofBlock.querySelector("tbody");
		const resultsRoofRows = resultsRoofTable.querySelectorAll("tr");

		const resultsBalconyBlock = results.querySelector("#group_22264");
		const resultsBalconyTable = resultsBalconyBlock.querySelector("tbody");
		const resultsBalconyRows = resultsBalconyTable.querySelectorAll("tr");

		const resultsMopBlock = results.querySelector("#group_22268");
		const resultsMopTable = resultsMopBlock.querySelector("tbody");
		const resultsMopRows = resultsMopTable.querySelectorAll("tr");

		const resultHeatSystemBlock = results.querySelector("#group_22271");
		const resultsHeatSystemTable = resultHeatSystemBlock.querySelector("tbody");
		const resultsHeatSystemRows = resultsHeatSystemTable.querySelectorAll("tr");

		const resultsGvsBlock = results.querySelector("#group_22272");
		const resultsGvsTable = resultsGvsBlock.querySelector("tbody");
		const resultsGvsRows = resultsGvsTable.querySelectorAll("tr");

		const resultsHvsBlock = results.querySelector("#group_22273");
		const resultsHvsTable = resultsHvsBlock.querySelector("tbody");
		const resultsHvsRows = resultsHvsTable.querySelectorAll("tr");

		const resultsSewerBlock = results.querySelector("#group_22274");
		const resultsSewerTable = resultsSewerBlock.querySelector("tbody");
		const resultsSewerRows = resultsSewerTable.querySelectorAll("tr");

		const signatoriesBlock = html.querySelector("#group_22133");
		const signatoriesTable = signatoriesBlock.querySelector("tbody");
		const signatoriesRows = signatoriesTable.querySelectorAll("tr");

		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		for (let i = 1; i < resultsRoofRows.length; i++) {
			if (!resultsRoofRows[i].querySelector("#comp_12642")) {
				continue;
			}
			resultsRoofRows[i].querySelector("#comp_12642").value = loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Выявленные дефекты"];
			resultsRoofRows[i].querySelector("#comp_12644").value = loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["% деф. части"];
			clickGenerator(resultsRoofRows[i], "#lookupTextcomp_12645", loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Оценка"]);
		}

		// Водоотвод
		results.querySelector("#comp_12647").value = loadData["Результаты выборочного обследования"]["Водоотвод"]["Выявленные дефекты"];
		results.querySelector("#comp_12649").value = loadData["Результаты выборочного обследования"]["Водоотвод"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12650", loadData["Результаты выборочного обследования"]["Водоотвод"]["Оценка"]);

		// Межпанельные стыки
		results.querySelector("#comp_12652").value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Выявленные дефекты"];
		results.querySelector("#comp_12654").value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12655", loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Оценка"]);

		// Фасад
		results.querySelector("#comp_12657").value = loadData["Результаты выборочного обследования"]["Фасад"]["Выявленные дефекты"];
		results.querySelector("#comp_12659").value = loadData["Результаты выборочного обследования"]["Фасад"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12660", loadData["Результаты выборочного обследования"]["Фасад"]["Оценка"]);

		// Балконы
		for (let i = 1; i < resultsBalconyRows.length; i++) {
			if (!resultsBalconyRows[i].querySelector("#comp_12736")) {
				continue;
			}
			resultsBalconyRows[i].querySelector("#comp_12736").value = loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Выявленные дефекты"];
			resultsBalconyRows[i].querySelector("#comp_12738").value = loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["% деф. части"];
			clickGenerator(resultsBalconyRows[i], "#lookupTextcomp_12739", loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Оценка"]);
		}

		// Стены
		results.querySelector("#comp_12624").value = loadData["Результаты выборочного обследования"]["Стены"]["Выявленные дефекты"];
		results.querySelector("#comp_12626").value = loadData["Результаты выборочного обследования"]["Стены"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12672", loadData["Результаты выборочного обследования"]["Стены"]["Оценка"]);

		// Подвал
		results.querySelector("#comp_12628").value = loadData["Результаты выборочного обследования"]["Подвал"]["Выявленные дефекты"];
		results.querySelector("#comp_12630").value = loadData["Результаты выборочного обследования"]["Подвал"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12631", loadData["Результаты выборочного обследования"]["Подвал"]["Оценка"]);

		// Тех.подполье
		results.querySelector("#comp_12633").value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["Выявленные дефекты"];
		results.querySelector("#comp_12635").value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12636", loadData["Результаты выборочного обследования"]["Тех.подполье"]["Оценка"]);

		// Тех.этаж
		results.querySelector("#comp_12638").value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["Выявленные дефекты"];
		results.querySelector("#comp_12640").value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12673", loadData["Результаты выборочного обследования"]["Тех.этаж"]["Оценка"]);

		// Гараж стоянка (подземный)
		results.querySelector("#comp_12747").value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Выявленные дефекты"];
		results.querySelector("#comp_12749").value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12750", loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Оценка"]);

		// Места общего пользования
		for (let i = 1; i < resultsMopRows.length; i++) {
			if (!resultsMopRows[i].querySelector("#comp_12752")) {
				continue;
			}
			resultsMopRows[i].querySelector("#comp_12752").value = loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Выявленные дефекты"];
			resultsMopRows[i].querySelector("#comp_12754").value = loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["% деф. части"];
			clickGenerator(resultsMopRows[i], "#lookupTextcomp_12755", loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Оценка"]);
		}

		// Лестницы
		results.querySelector("#comp_12757").value = loadData["Результаты выборочного обследования"]["Лестницы"]["Выявленные дефекты"];
		results.querySelector("#comp_12759").value = loadData["Результаты выборочного обследования"]["Лестницы"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12674", loadData["Результаты выборочного обследования"]["Лестницы"]["Оценка"]);

		// Перекрытия
		results.querySelector("#comp_12761").value = loadData["Результаты выборочного обследования"]["Перекрытия"]["Выявленные дефекты"];
		results.querySelector("#comp_12763").value = loadData["Результаты выборочного обследования"]["Перекрытия"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12764", loadData["Результаты выборочного обследования"]["Перекрытия"]["Оценка"]);

		// Система отопления
		for (let i = 1; i < resultsHeatSystemRows.length; i++) {
			if (!resultsHeatSystemRows[i].querySelector("#comp_12766")) {
				continue;
			}
			resultsHeatSystemRows[i].querySelector("#comp_12766").value = loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Выявленные дефекты"];
			resultsHeatSystemRows[i].querySelector("#comp_12768").value = loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["% деф. части"];
			clickGenerator(resultsHeatSystemRows[i], "#lookupTextcomp_12769", loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Оценка"]);
		}

		// ГВС
		for (let i = 1; i < resultsGvsRows.length; i++) {
			if (!resultsGvsRows[i].querySelector("#comp_12771")) {
				continue;
			}
			resultsGvsRows[i].querySelector("#comp_12771").value = loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Выявленные дефекты"];
			resultsGvsRows[i].querySelector("#comp_12773").value = loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["% деф. части"];
			clickGenerator(resultsGvsRows[i], "#lookupTextcomp_12675", loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Оценка"]);
		}

		// ХВС
		for (let i = 1; i < resultsHvsRows.length; i++) {
			if (!resultsHvsRows[i].querySelector("#comp_12775")) {
				continue;
			}
			resultsHvsRows[i].querySelector("#comp_12775").value = loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Выявленные дефекты"];
			resultsHvsRows[i].querySelector("#comp_12777").value = loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["% деф. части"];
			clickGenerator(resultsHvsRows[i], "#lookupTextcomp_12778", loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Оценка"]);
		}

		// Канализация
		for (let i = 1; i < resultsSewerRows.length; i++) {
			if (!resultsSewerRows[i].querySelector("#comp_12780")) {
				continue;
			}
			resultsSewerRows[i].querySelector("#comp_12780").value = loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Выявленные дефекты"];
			resultsSewerRows[i].querySelector("#comp_12782").value = loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["% деф. части"];
			clickGenerator(resultsSewerRows[i], "#lookupTextcomp_12783", loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Оценка"]);
		}
		// Мусоропроводы
		results.querySelector("#comp_12785").value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Выявленные дефекты"];
		results.querySelector("#comp_12787").value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["% деф. части"];
		clickGenerator(results, "#lookupTextcomp_12788", loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Оценка"]);

		// Связь с ОДС
		clickGenerator(results, "#lookupTextcomp_12607", loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Состояние"]);
		results.querySelector("#comp_12790").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Выявленные дефекты"];
		results.querySelector("#comp_12791").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12792").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12793", loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Оценка"]);

		// Вентиляция
		clickGenerator(results, "#lookupTextcomp_12608", loadData["Результаты выборочного обследования"]["Вентиляция"]["Состояние"]);
		results.querySelector("#comp_12795").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Выявленные дефекты"];
		results.querySelector("#comp_12796").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12797").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12798", loadData["Результаты выборочного обследования"]["Вентиляция"]["Оценка"]);

		// Система промывки и прочистки стволов мусоропроводов
		clickGenerator(results, "#lookupTextcomp_126090", loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Состояние"]);
		results.querySelector("#comp_12800").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Выявленные дефекты"];
		results.querySelector("#comp_12801").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12802").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12803", loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Оценка"]);

		// ОЗДС (охранно-защитная дератизационная система)
		clickGenerator(results, "#lookupTextcomp_12610", loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Состояние"]);
		results.querySelector("#comp_12677").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Выявленные дефекты"];
		results.querySelector("#comp_12678").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12679").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12680", loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Оценка"]);

		// Газоходы
		clickGenerator(results, "#lookupTextcomp_12612", loadData["Результаты выборочного обследования"]["Газоходы"]["Состояние"]);
		results.querySelector("#comp_12687").value = loadData["Результаты выборочного обследования"]["Газоходы"]["Выявленные дефекты"];
		results.querySelector("#comp_12688").value = loadData["Результаты выборочного обследования"]["Газоходы"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12689").value = loadData["Результаты выборочного обследования"]["Газоходы"]["Специализированная организация"];
		clickGenerator(results, "#ookupTextcomp_12690", loadData["Результаты выборочного обследования"]["Газоходы"]["Оценка"]);

		// Лифты
		clickGenerator(results, "#lookupTextcomp_12613", loadData["Результаты выборочного обследования"]["Лифты"]["Состояние"]);
		results.querySelector("#lookupTextcomp_12613").value = loadData["Результаты выборочного обследования"]["Лифты"]["Состояние"];
		results.querySelector("#comp_12692").value = loadData["Результаты выборочного обследования"]["Лифты"]["Выявленные дефекты"];
		results.querySelector("#comp_12693").value = loadData["Результаты выборочного обследования"]["Лифты"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12694").value = loadData["Результаты выборочного обследования"]["Лифты"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12695", loadData["Результаты выборочного обследования"]["Лифты"]["Оценка"]);

		// Подъёмное устройство для маломобильной группы населения
		clickGenerator(results, "#lookupTextcomp_12614", loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Состояние"]);
		results.querySelector("#lookupTextcomp_12614").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Состояние"];
		results.querySelector("#comp_12697").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Выявленные дефекты"];
		results.querySelector("#comp_12698").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12699").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12700", loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Оценка"]);

		// Устройство для автоматического опускания лифта
		clickGenerator(results, "#lookupTextcomp_12615", loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Состояние"]);
		results.querySelector("#comp_12702").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Выявленные дефекты"];
		results.querySelector("#comp_12703").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12704").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12705", loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Оценка"]);

		// Система ЭС
		clickGenerator(results, "#lookupTextcomp_12616", loadData["Результаты выборочного обследования"]["Система ЭС"]["Состояние"]);
		results.querySelector("#lookupTextcomp_12616").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Состояние"];
		results.querySelector("#comp_12707").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Выявленные дефекты"];
		results.querySelector("#comp_12708").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12709").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Специализированная организация"];
		results.querySelector("#lookupTextcomp_12710").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Оценка"];

		// ВКВ (второй кабельный ввод)
		clickGenerator(results, "#lookupTextcomp_12398", loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Наличие"]);
		clickGenerator(results, "#lookupTextcomp_12622", loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Состояние"]);
		results.querySelector("#lookupTextcomp_12622").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Состояние"];
		results.querySelector("#comp_12712").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Выявленные дефекты"];
		results.querySelector("#comp_12713").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12714").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12715", loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Оценка"]);

		// АВР (автоматическое включение резервного питания)
		clickGenerator(results, "#lookupTextcomp_12399", loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Наличие"]);
		clickGenerator(results, "#lookupTextcomp_12617", loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Состояние"]);
		results.querySelector("#comp_12717").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Выявленные дефекты"];
		results.querySelector("#comp_12718").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12719").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12720", loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Оценка"]);

		// ППАиДУ
		clickGenerator(results, "#lookupTextcomp_12400", loadData["Результаты выборочного обследования"]["ППАиДУ"]["Тип"]);
		clickGenerator(results, "#lookupTextcomp_12618", loadData["Результаты выборочного обследования"]["ППАиДУ"]["Состояние"]);
		results.querySelector("#comp_12722").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Выявленные дефекты"];
		results.querySelector("#comp_12723").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12724").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12725", loadData["Результаты выборочного обследования"]["ППАиДУ"]["Оценка"]);

		// Система оповещения о пожаре
		clickGenerator(results, "#lookupTextcomp_12401", loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Наличие"]);
		clickGenerator(results, "#lookupTextcomp_12619", loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Состояние"]);
		results.querySelector("#comp_12727").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Выявленные дефекты"];
		results.querySelector("#comp_12728").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12729").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12730", loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Оценка"]);

		// Система ГС
		clickGenerator(results, "#lookupTextcomp_12402", loadData["Результаты выборочного обследования"]["Система ГС"]["Вводы"]);
		clickGenerator(results, "#lookupTextcomp_12620", loadData["Результаты выборочного обследования"]["Система ГС"]["Состояние"]);
		results.querySelector("#comp_12732").value = loadData["Результаты выборочного обследования"]["Система ГС"]["Выявленные дефекты"];
		results.querySelector("#comp_12733").value = loadData["Результаты выборочного обследования"]["Система ГС"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12734").value = loadData["Результаты выборочного обследования"]["Система ГС"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12740", loadData["Результаты выборочного обследования"]["Система ГС"]["Оценка"]);

		// Система видеонаблюдения
		clickGenerator(results, "#lookupTextcomp_12349", loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Место"]);
		clickGenerator(results, "#lookupTextcomp_12621", loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Состояние"]);
		results.querySelector("#comp_12742").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Выявленные дефекты"];
		results.querySelector("#comp_12743").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["№ и дата последнего обслед."];
		results.querySelector("#comp_12744").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Специализированная организация"];
		clickGenerator(results, "#lookupTextcomp_12745", loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Оценка"]);

		form.querySelector("#comp_12324").value = loadData["Результаты выборочного обследования"]["Дополнительные данные"];
		clickGenerator(form, "#lookupTextcomp_12350", loadData["Результаты выборочного обследования"]["Рекомендации по утеплению стен"]);
		form.querySelector("#comp_12606").value = loadData["Выводы по результатам обследования"]["РЕКОМЕНДАЦИИ по ремонтно-восстановительным работам"];

		// Подписывающие лица
		for (let i = 1; i < signatoriesRows.length; i++) {
			if (!signatoriesRows[i].querySelector("#comp_12340")) {
				continue;
			}
			signatoriesRows[i].querySelector("#comp_12340").value = loadData["Подписывающие лица"]["Представители от"][i];
			signatoriesRows[i].querySelector("#comp_12341").value = loadData["Подписывающие лица"]["Должность и наименование организации"][i];
			signatoriesRows[i].querySelector("#comp_12342").value = loadData["Подписывающие лица"]["ФИО должностного лица"][i];
		}

		function clickGenerator(parent, id, value) {
			try {
				const element = parent.querySelector(id);
				const dataElement = element.parentElement.nextElementSibling;
				const listItems = dataElement.querySelectorAll("li");

				listItems.forEach((item) => {
					const a = item.querySelector("a");
					if (a.textContent === value) {
						a.click();
					}
				});
			} catch {
				return;
			}
		}

		localStorage.setItem("DataLoaded", JSON.stringify({ address: loadData.address.address }));

		pasteButton.textContent = "Вставлено";
		pasteButton.classList.add("main__button_done");
		setTimeout(() => {
			pasteButton.textContent = "Вставка отчета";
			pasteButton.classList.remove("main__button_done");
		}, 1500);
	}

	function clearData() {
		const repairProjectsTable = form.querySelector("#group_22130");
		const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
		const conclusionsPrevSurvey = form.querySelector("#gridSql_22131").querySelector(".data");
		const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

		const recomendationsDone = form.querySelector("#group_22127");
		const recomendationsRoofBlock = recomendationsDone.querySelector("#group_22193");
		const roofTable = recomendationsRoofBlock.querySelector("tbody");
		const roofRows = roofTable.querySelectorAll("tr");
		const balconyBlock = recomendationsDone.querySelector("#group_22196");
		const balconyTable = balconyBlock.querySelector("tbody");
		const balconyRows = balconyTable.querySelectorAll("tr");
		const mopBlock = recomendationsDone.querySelector("#group_22201");
		const mopTable = mopBlock.querySelector("tbody");
		const mopRows = mopTable.querySelectorAll("tr");
		const heatSystemBlock = recomendationsDone.querySelector("#group_22204");
		const heatSystemTable = heatSystemBlock.querySelector("tbody");
		const heatSystemRows = heatSystemTable.querySelectorAll("tr");
		const gvsBlock = recomendationsDone.querySelector("#group_22205");
		const gvsTable = gvsBlock.querySelector("tbody");
		const gvsRows = gvsTable.querySelectorAll("tr");
		const hvsBlock = recomendationsDone.querySelector("#group_22206");
		const hvsTable = hvsBlock.querySelector("tbody");
		const hvsRows = hvsTable.querySelectorAll("tr");
		const sewerBlock = recomendationsDone.querySelector("#group_22207");
		const sewerTable = sewerBlock.querySelector("tbody");
		const sewerRows = sewerTable.querySelector("tr");

		const results = form.querySelector("#group_22125");
		const resultsRoofBlock = results.querySelector("#group_22243");
		const resultsRoofTable = resultsRoofBlock.querySelector("tbody");
		const resultsRoofRows = resultsRoofTable.querySelectorAll("tr");

		const resultsBalconyBlock = results.querySelector("#group_22264");
		const resultsBalconyTable = resultsBalconyBlock.querySelector("tbody");
		const resultsBalconyRows = resultsBalconyTable.querySelectorAll("tr");

		const resultsMopBlock = results.querySelector("#group_22268");
		const resultsMopTable = resultsMopBlock.querySelector("tbody");
		const resultsMopRows = resultsMopTable.querySelectorAll("tr");

		const resultHeatSystemBlock = results.querySelector("#group_22271");
		const resultsHeatSystemTable = resultHeatSystemBlock.querySelector("tbody");
		const resultsHeatSystemRows = resultsHeatSystemTable.querySelectorAll("tr");

		const resultsGvsBlock = results.querySelector("#group_22272");
		const resultsGvsTable = resultsGvsBlock.querySelector("tbody");
		const resultsGvsRows = resultsGvsTable.querySelectorAll("tr");

		const resultsHvsBlock = results.querySelector("#group_22273");
		const resultsHvsTable = resultsHvsBlock.querySelector("tbody");
		const resultsHvsRows = resultsHvsTable.querySelectorAll("tr");

		const resultsSewerBlock = results.querySelector("#group_22274");
		const resultsSewerTable = resultsSewerBlock.querySelector("tbody");
		const resultsSewerRows = resultsSewerTable.querySelectorAll("tr");

		const signatoriesBlock = html.querySelector("#group_22133");
		const signatoriesTable = signatoriesBlock.querySelector("tbody");
		const signatoriesRows = signatoriesTable.querySelectorAll("tr");

		// РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
		// Крыша
		for (let i = 1; i < resultsRoofRows.length; i++) {
			if (!resultsRoofRows[i].querySelector("#comp_12642")) {
				continue;
			}
			resultsRoofRows[i].querySelector("#comp_12642").value = "";
			resultsRoofRows[i].querySelector("#comp_12644").value = "";
			clickGenerator(resultsRoofRows[i], "#lookupTextcomp_12645", "-");
		}

		// Водоотвод
		results.querySelector("#comp_12647").value = "";
		results.querySelector("#comp_12649").value = "";
		clickGenerator(results, "#lookupTextcomp_12650", "-");

		// Межпанельные стыки
		results.querySelector("#comp_12652").value = "";
		results.querySelector("#comp_12654").value = "";
		clickGenerator(results, "#lookupTextcomp_12655", "-");

		// Фасад
		results.querySelector("#comp_12657").value = "";
		results.querySelector("#comp_12659").value = "";
		clickGenerator(results, "#lookupTextcomp_12660", "-");

		// Балконы
		for (let i = 1; i < resultsBalconyRows.length; i++) {
			if (!resultsBalconyRows[i].querySelector("#comp_12736")) {
				continue;
			}
			resultsBalconyRows[i].querySelector("#comp_12736").value = "";
			resultsBalconyRows[i].querySelector("#comp_12738").value = "";
			clickGenerator(resultsBalconyRows[i], "#lookupTextcomp_12739", "-");
		}

		// Стены
		results.querySelector("#comp_12624").value = "";
		results.querySelector("#comp_12626").value = "";
		clickGenerator(results, "#lookupTextcomp_12672", "-");

		// Подвал
		results.querySelector("#comp_12628").value = "";
		results.querySelector("#comp_12630").value = "";
		clickGenerator(results, "#lookupTextcomp_12631", "-");

		// Тех.подполье
		results.querySelector("#comp_12633").value = "";
		results.querySelector("#comp_12635").value = "";
		clickGenerator(results, "#lookupTextcomp_12636", "-");

		// Тех.этаж
		results.querySelector("#comp_12638").value = "";
		results.querySelector("#comp_12640").value = "";
		clickGenerator(results, "#lookupTextcomp_12673", "-");

		// Гараж стоянка (подземный)
		results.querySelector("#comp_12747").value = "";
		results.querySelector("#comp_12749").value = "";
		clickGenerator(results, "#lookupTextcomp_12750", "-");

		// Места общего пользования
		for (let i = 1; i < resultsMopRows.length; i++) {
			if (!resultsMopRows[i].querySelector("#comp_12752")) {
				continue;
			}
			resultsMopRows[i].querySelector("#comp_12752").value = "";
			resultsMopRows[i].querySelector("#comp_12754").value = "";
			clickGenerator(resultsMopRows[i], "#lookupTextcomp_12755", "-");
		}

		// Лестницы
		results.querySelector("#comp_12757").value = "";
		results.querySelector("#comp_12759").value = "";
		clickGenerator(results, "#lookupTextcomp_12674", "-");

		// Перекрытия
		results.querySelector("#comp_12761").value = "";
		results.querySelector("#comp_12763").value = "";
		clickGenerator(results, "#lookupTextcomp_12764", "-");

		// Система отопления
		for (let i = 1; i < resultsHeatSystemRows.length; i++) {
			if (!resultsHeatSystemRows[i].querySelector("#comp_12766")) {
				continue;
			}
			resultsHeatSystemRows[i].querySelector("#comp_12766").value = "";
			resultsHeatSystemRows[i].querySelector("#comp_12768").value = "";
			clickGenerator(resultsHeatSystemRows[i], "#lookupTextcomp_12769", "-");
		}

		// ГВС
		for (let i = 1; i < resultsGvsRows.length; i++) {
			if (!resultsGvsRows[i].querySelector("#comp_12771")) {
				continue;
			}
			resultsGvsRows[i].querySelector("#comp_12771").value = "";
			resultsGvsRows[i].querySelector("#comp_12773").value = "";
			clickGenerator(resultsGvsRows[i], "#lookupTextcomp_12675", "-");
		}

		// ХВС
		for (let i = 1; i < resultsHvsRows.length; i++) {
			if (!resultsHvsRows[i].querySelector("#comp_12775")) {
				continue;
			}
			resultsHvsRows[i].querySelector("#comp_12775").value = "";
			resultsHvsRows[i].querySelector("#comp_12777").value = "";
			clickGenerator(resultsHvsRows[i], "#lookupTextcomp_12778", "-");
		}

		// Канализация
		for (let i = 1; i < resultsSewerRows.length; i++) {
			if (!resultsSewerRows[i].querySelector("#comp_12780")) {
				continue;
			}
			resultsSewerRows[i].querySelector("#comp_12780").value = "";
			resultsSewerRows[i].querySelector("#comp_12782").value = "";
			clickGenerator(resultsSewerRows[i], "#lookupTextcomp_12783", "-");
		}
		// Мусоропроводы
		results.querySelector("#comp_12785").value = "";
		results.querySelector("#comp_12787").value = "";
		clickGenerator(results, "#lookupTextcomp_12788", "-");

		// Связь с ОДС
		clickGenerator(results, "#lookupTextcomp_12607", "-");
		results.querySelector("#comp_12790").value = "";
		results.querySelector("#comp_12791").value = "";
		results.querySelector("#comp_12792").value = "";
		clickGenerator(results, "#lookupTextcomp_12793", "-");

		// Вентиляция
		clickGenerator(results, "#lookupTextcomp_12608", "-");
		results.querySelector("#comp_12795").value = "";
		results.querySelector("#comp_12796").value = "";
		results.querySelector("#comp_12797").value = "";
		clickGenerator(results, "#lookupTextcomp_12798", "-");

		// Система промывки и прочистки стволов мусоропроводов
		clickGenerator(results, "#lookupTextcomp_126090", "-");
		results.querySelector("#comp_12800").value = "";
		results.querySelector("#comp_12801").value = "";
		results.querySelector("#comp_12802").value = "";
		clickGenerator(results, "#lookupTextcomp_12803", "-");

		// ОЗДС (охранно-защитная дератизационная система)
		clickGenerator(results, "#lookupTextcomp_12610", "-");
		results.querySelector("#comp_12677").value = "";
		results.querySelector("#comp_12678").value = "";
		results.querySelector("#comp_12679").value = "";
		clickGenerator(results, "#lookupTextcomp_12680", "-");

		// Газоходы
		clickGenerator(results, "#lookupTextcomp_12612", "-");
		results.querySelector("#comp_12687").value = "";
		results.querySelector("#comp_12688").value = "";
		results.querySelector("#comp_12689").value = "";
		clickGenerator(results, "#ookupTextcomp_12690", "-");

		// Лифты
		clickGenerator(results, "#lookupTextcomp_12613", "-");
		results.querySelector("#lookupTextcomp_12613").value = "";
		results.querySelector("#comp_12692").value = "";
		results.querySelector("#comp_12693").value = "";
		results.querySelector("#comp_12694").value = "";
		clickGenerator(results, "#lookupTextcomp_12695", "-");

		// Подъёмное устройство для маломобильной группы населения
		clickGenerator(results, "#lookupTextcomp_12614", "-");
		results.querySelector("#lookupTextcomp_12614").value = "";
		results.querySelector("#comp_12697").value = "";
		results.querySelector("#comp_12698").value = "";
		results.querySelector("#comp_12699").value = "";
		clickGenerator(results, "#lookupTextcomp_12700", "-");

		// Устройство для автоматического опускания лифта
		clickGenerator(results, "#lookupTextcomp_12615", "-");
		results.querySelector("#comp_12702").value = "";
		results.querySelector("#comp_12703").value = "";
		results.querySelector("#comp_12704").value = "";
		clickGenerator(results, "#lookupTextcomp_12705", "-");

		// Система ЭС
		clickGenerator(results, "#lookupTextcomp_12616", "-");
		results.querySelector("#lookupTextcomp_12616").value = "";
		results.querySelector("#comp_12707").value = "";
		results.querySelector("#comp_12708").value = "";
		results.querySelector("#comp_12709").value = "";
		results.querySelector("#lookupTextcomp_12710").value = "";

		// ВКВ (второй кабельный ввод)
		clickGenerator(results, "#lookupTextcomp_12398", "-");
		clickGenerator(results, "#lookupTextcomp_12622", "-");
		results.querySelector("#lookupTextcomp_12622").value = "";
		results.querySelector("#comp_12712").value = "";
		results.querySelector("#comp_12713").value = "";
		results.querySelector("#comp_12714").value = "";
		clickGenerator(results, "#lookupTextcomp_12715", "-");

		// АВР (автоматическое включение резервного питания)
		clickGenerator(results, "#lookupTextcomp_12399", "-");
		clickGenerator(results, "#lookupTextcomp_12617", "-");
		results.querySelector("#comp_12717").value = "";
		results.querySelector("#comp_12718").value = "";
		results.querySelector("#comp_12719").value = "";
		clickGenerator(results, "#lookupTextcomp_12720", "-");

		// ППАиДУ
		clickGenerator(results, "#lookupTextcomp_12400", "-");
		clickGenerator(results, "#lookupTextcomp_12618", "-");
		results.querySelector("#comp_12722").value = "";
		results.querySelector("#comp_12723").value = "";
		results.querySelector("#comp_12724").value = "";
		clickGenerator(results, "#lookupTextcomp_12725", "-");

		// Система оповещения о пожаре
		clickGenerator(results, "#lookupTextcomp_12401", "-");
		clickGenerator(results, "#lookupTextcomp_12619", "-");
		results.querySelector("#comp_12727").value = "";
		results.querySelector("#comp_12728").value = "";
		results.querySelector("#comp_12729").value = "";
		clickGenerator(results, "#lookupTextcomp_12730", "-");

		// Система ГС
		clickGenerator(results, "#lookupTextcomp_12402", "-");
		clickGenerator(results, "#lookupTextcomp_12620", "-");
		results.querySelector("#comp_12732").value = "";
		results.querySelector("#comp_12733").value = "";
		results.querySelector("#comp_12734").value = "";
		clickGenerator(results, "#lookupTextcomp_12740", "-");

		// Система видеонаблюдения
		clickGenerator(results, "#lookupTextcomp_12349", "-");
		clickGenerator(results, "#lookupTextcomp_12621", "-");
		results.querySelector("#comp_12742").value = "";
		results.querySelector("#comp_12743").value = "";
		results.querySelector("#comp_12744").value = "";
		clickGenerator(results, "#lookupTextcomp_12745", "-");

		form.querySelector("#comp_12324").value = "";
		clickGenerator(form, "#lookupTextcomp_12350", "-");
		form.querySelector("#comp_12606").value = "";

		// Подписывающие лица
		for (let i = 1; i < signatoriesRows.length; i++) {
			if (!signatoriesRows[i].querySelector("#comp_12340")) {
				continue;
			}
			signatoriesRows[i].querySelector("#comp_12340").value = "";
			signatoriesRows[i].querySelector("#comp_12341").value = "";
			signatoriesRows[i].querySelector("#comp_12342").value = "";
		}

		function clickGenerator(parent, id, value) {
			try {
				const element = parent.querySelector(id);
				const dataElement = element.parentElement.nextElementSibling;
				const listItems = dataElement.querySelectorAll("li");

				listItems.forEach((item) => {
					const a = item.querySelector("a");
					if (a.textContent === value) {
						a.click();
					}
				});
			} catch {
				return;
			}
		}

		clearDataButton.textContent = "Очищено";
		clearDataButton.classList.add("main__button_done");
		setTimeout(() => {
			clearDataButton.textContent = "Очистка отчета";
			clearDataButton.classList.remove("main__button_done");
		}, 1500);
	}
}
