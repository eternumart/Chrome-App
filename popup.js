const buttonPhotos = document.querySelector("#photos");
const buttonSave = document.querySelector("#save");
const inputDate = document.querySelector("#form-date");
const buttonLoad = document.querySelector("#load");
buttonPhotos.addEventListener("click", uploadPhotos);
buttonSave.addEventListener("click", injectionSave);
buttonLoad.addEventListener("click", injectionLoad);

function uploadPhotos(evt) {
  evt.preventDefault();

  chrome.tabs.query({ active: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: injectionPhotos,
      });
    }
  });
}

function injectionSave(evt) {
  evt.preventDefault();

  chrome.tabs.query({ active: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: saveData,
      });
    }
  });
}

function injectionLoad(evt) {
  evt.preventDefault();

  chrome.tabs.query({ active: true }, (tabs) => {
    const tab = tabs[0];
    if (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        func: loadData,
      });
    }
  });
}

function injectionPhotos() {
  // Variables
  const iFrameHTML = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
  if (iFrameHTML.querySelector(".injection")) {
    return;
  }
  const iFrameHead = iFrameHTML.querySelector("head");
  let iframeForm = iFrameHTML.querySelector("#formData107"); // for photo save
  const saveButton = iFrameHTML.querySelector("#buttonFormSave");
  const addImgBtnContainer = iFrameHTML.querySelector("#\\32 1184 > caption");
  const addImgButton = addImgBtnContainer.querySelector(".button");
  const injectDiv = document.createElement("div");
  const divWrapper = document.createElement("div");
  const injectInput = document.createElement("input");
  const injectButton = document.createElement("button");
  const dragIco = document.createElement("div");
  const divTitle = document.createElement("span");
  const inputDate = document.createElement("input");
  const stylesLayout = `<style>
  .injection {
    width: 270px;
    position: absolute;
    z-index: 999;
    background: #fff;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0px 0px 10px grey;
    top: 20px;
    right: 20px;
  }
  .injection__content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .injection__content div {
    position: absolute;
    right: -10px;
    top: -10px;
    width: 20px;
    height: 20px;
    background: url("https://img.icons8.com/?size=512&id=LSSRyyQ8tv5H&format=png");
    background-size: contain;
    background-repeat: no-repeat;
    cursor: grab;
  }
  .injection__content span {
    font-size: 25px;
    line-height: 1;
    margin-bottom: 10px;
  }
  .injection input[type=file]::file-selector-button {
    border: none;
    background: #084cdf;
    padding: 10px 20px;
    min-height: 45px;
    border-radius: 10px;
    margin-right: 15px;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  .injection input[type=file]::file-selector-button:hover {
    background: #0d45a5;
  }
  .injection button {
    border: none;
    background: #084cdf;
    padding: 10px 20px;
    border-radius: 10px;
    color: #fff;
    min-height: 45px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  .injection button:hover {
    background: #0d45a5;
  }
  .injection input[type="date"] {
    min-height: 45px;
    color: #000;
    font-family: Open Sans, Arial, sans-serif;
    font-size: 16px;
    padding-left: 10px;
    border: 2px solid #084cdf;
    border-radius: 10px;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
}
  </style>`;

  // Listeners
  injectButton.addEventListener("click", downloadPhotos);
  dragIco.addEventListener("mousedown", startDraggingDiv);
  iFrameHTML.addEventListener("mouseup", stopDraggingDiv);

  // Main
  injectDiv.classList.add("injection");
  divWrapper.classList.add("injection__content");
  divTitle.textContent = "I-N-J-E-C-T-E-D 😈";
  injectInput.type = "file";
  injectInput.setAttribute("multiple", "");
  inputDate.type = "date";
  injectButton.textContent = "Вставить";

  iFrameHead.insertAdjacentHTML("beforeEnd", stylesLayout);
  divWrapper.appendChild(divTitle);
  divWrapper.appendChild(dragIco);
  divWrapper.appendChild(injectInput);
  divWrapper.appendChild(inputDate);
  divWrapper.appendChild(injectButton);
  injectDiv.appendChild(divWrapper);
  iframeForm.appendChild(injectDiv);

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

  inputDate.value = `${year}-${month}-${day}`;

  // Methods
  function downloadPhotos(evt) {
    evt.preventDefault();
    const files = injectInput.files;
    let counter = 0;
    const interval = setInterval(upload, 3000);

    function upload() {
      // 1. Клик по кнопке добавления поля
      addImgButton.click();

      const photoTable = iFrameHTML.querySelector("#\\32 1184");
      const downloadInputs = photoTable.querySelectorAll(".fileLoad");
      const downloadInput = downloadInputs[downloadInputs.length - 1];
      const textareas = photoTable.querySelectorAll("textarea");
      const currentTextarea = textareas[textareas.length - 1];
      const currentFile = files[`${counter}`];
      const prepareDate = inputDate.value.split("-");
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
      console.log(downloadInput.files);
      downloadInput.dispatchEvent(new Event("change"));

      counter++;
      // 3. Сохраняем после добавления всех файлов
      if (counter >= files.length) {
        clearInterval(interval);
        setTimeout(() => {
          saveButton.click();
          alert("Успех! 😈");
        }, 3000);
      }
    }
  }

  function startDraggingDiv(evt) {
    dragIco.style.cursor = "grabbing";
    iFrameHTML.addEventListener("mousemove", dragDiv);
  }

  function stopDraggingDiv(evt) {
    dragIco.style.cursor = "grab";
    iFrameHTML.removeEventListener("mousemove", dragDiv);
  }

  function dragDiv(evt) {
    injectDiv.style.top = `${evt.pageY - 25}px`;
    injectDiv.style.left = `${evt.pageX - 300}px`;
  }
}

function saveData() {
  let iFrameHTML, wholeAddress;

  if (!document.querySelector("#formCanvas")) {
    iFrameHTML = document;
    wholeAddress = document.querySelector("#comboboxTextcomp_12339").value;
  } else {
    iFrameHTML = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
    wholeAddress = document.querySelector("#title").textContent;
  }

  let iFrameHead = iFrameHTML.querySelector("head");
  let iFrameBody = iFrameHTML.querySelector("body");
  let iframeForm = iFrameHTML.querySelector("#formData181");
  const area = wholeAddress.split(",")[0];
  const district = wholeAddress.split(",")[1];
  const address = iFrameBody.querySelector("#comboboxTextcomp_12339").value;
  const repairProjectsTable = iframeForm.querySelector("#group_22130");
  const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
  const conclusionsPrevSurvey = iframeForm.querySelector("#gridSql_22131").querySelector(".data");
  const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

  const recomendationsDone = iframeForm.querySelector("#group_22127");
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

  const results = iframeForm.querySelector("#group_22125");
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

  const data = {
    address: {
      area: area,
      district: district,
      address: address,
    },
    "Паспортные данные": {
      "Количество этажей": iframeForm.querySelector("#comp_12472").value,
      "Количество подъездов": iframeForm.querySelector("#comp_12473").value,
      "Строительный объем здания": iframeForm.querySelector("#comp_12474").value,
      "Кол-во квартир": iframeForm.querySelector("#comp_12475").value,
      "Площадь полезная": iframeForm.querySelector("#comp_12476").value,
      "Площадь в жилых помещениях": iframeForm.querySelector("#comp_12477").value,
      "Площадь в нежилых помещениях": iframeForm.querySelector("#comp_12478").value,
      "Серия проекта": iframeForm.querySelector("#lookupTextcomp_12479").value,
      "Год постройки": iframeForm.querySelector("#comp_12480").value,
      "Год реконструкции": iframeForm.querySelector("#comp_12481").value,
      "Класс энергетической эффективности здания": iframeForm.querySelector("#lookupTextcomp_12482").value,
      "Физический износ (%) по данным БТИ": iframeForm.querySelector("#comp_12661").value,
      "по данным БТИ на дату": iframeForm.querySelector("#comp_12662").value,
      "Наличие встроенных инженерных сооружений": iframeForm.querySelector("#lookupTextcomp_12663").value,
      "Кол-во встроенных инженерных сооружений": iframeForm.querySelector("#comp_12664").value,
      "Кол-во надстроенных инженерных сооружений": iframeForm.querySelector("#comp_12671").value,
      ТП: iframeForm.querySelector("#comp_12665").value,
      "в т.ч. масляные ТП": iframeForm.querySelector("#comp_12666").value,
      "Магистрали транзитные": iframeForm.querySelector("#lookupTextcomp_12667").value,
      "Факт. уд. потребление тепловой эн., Гкал/м²": iframeForm.querySelector("#comp_12668").value,
      "Проект. уд. потребление тепловой эн., кДж/(м²×град.×сут.)": iframeForm.querySelector("#comp_12669").value,
      "Величина отклонения (%)": iframeForm.querySelector("#comp_12670").value,
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
      "Вентиляция": {
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
        Оценка: results.querySelector("#lookupTextcomp_12710").value,
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

  localStorage.setItem("MJIDATA", JSON.stringify(data));
}

function loadData() {
  debugger;
  // Если никаких данных в localStorage нет - выходим из функции
  if (localStorage.getItem("MJIDATA") === null) {
    return;
  }
  const loadData = JSON.parse(localStorage.getItem("MJIDATA"));
  let loadTrigger;

  // Если данные этой страницы уже вставлены - выходим из функции
  if (localStorage.getItem("DataLoaded")) {
    loadTrigger = JSON.parse(localStorage.getItem("DataLoaded"));
    if (loadTrigger.address === loadData.address.address) {
      return;
    }
  }

  let iFrameHTML, wholeAddress;

  // Проверка есть ли iFrame
  if (!document.querySelector("#formCanvas")) {
    iFrameHTML = document;
    wholeAddress = document.querySelector("#comboboxTextcomp_12339").value;
  } else {
    iFrameHTML = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
    wholeAddress = document.querySelector("#title").textContent;
  }

  let iFrameHead = iFrameHTML.querySelector("head");
  let iFrameBody = iFrameHTML.querySelector("body");
  let iframeForm = iFrameHTML.querySelector("#formData181");
  const area = wholeAddress.split(",")[0];
  const district = wholeAddress.split(",")[1];
  const address = iFrameBody.querySelector("#comboboxTextcomp_12339").value;
  const repairProjectsTable = iframeForm.querySelector("#group_22130");
  const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
  const conclusionsPrevSurvey = iframeForm.querySelector("#gridSql_22131").querySelector(".data");
  const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

  const recomendationsDone = iframeForm.querySelector("#group_22127");
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

  const results = iframeForm.querySelector("#group_22125");
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

  // РЕЗУЛЬТАТЫ ВЫБОРОЧНОГО ОБСЛЕДОВАНИЯ
  // Крыша
  for (let i = 1; i < resultsRoofRows.length; i++) {
    if (!resultsRoofRows[i].querySelector("#comp_12642")) {
      continue;
    }
    resultsRoofRows[i].querySelector("#comp_12642").value = loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Выявленные дефекты"];
    resultsRoofRows[i].querySelector("#comp_12644").value = loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["% деф. части"];
    resultsRoofRows[i].querySelector("#lookupTextcomp_12645").value = loadData["Результаты выборочного обследования"]["Крыша"][resultsRoofRows[i].querySelector("#lookupTextcomp_12641").textContent]["Оценка"];
  }

  // Водоотвод
  results.querySelector("#comp_12647").value = loadData["Результаты выборочного обследования"]["Водоотвод"]["Выявленные дефекты"];
  results.querySelector("#comp_12649").value = loadData["Результаты выборочного обследования"]["Водоотвод"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12650").value = loadData["Результаты выборочного обследования"]["Водоотвод"]["Оценка"];

  // Межпанельные стыки
  results.querySelector("#comp_12652").value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Выявленные дефекты"];
  results.querySelector("#comp_12654").value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12655").value = loadData["Результаты выборочного обследования"]["Межпанельные стыки"]["Оценка"];

  // Фасад
  results.querySelector("#comp_12657").value = loadData["Результаты выборочного обследования"]["Фасад"]["Выявленные дефекты"];
  results.querySelector("#comp_12659").value = loadData["Результаты выборочного обследования"]["Фасад"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12660").value = loadData["Результаты выборочного обследования"]["Фасад"]["Оценка"];

  // Балконы
  for (let i = 1; i < resultsBalconyRows.length; i++) {
    if (!resultsBalconyRows[i].querySelector("#comp_12736")) {
      continue;
    }
    resultsBalconyRows[i].querySelector("#comp_12736").value = loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Выявленные дефекты"];
    resultsBalconyRows[i].querySelector("#comp_12738").value = loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["% деф. части"];
    resultsBalconyRows[i].querySelector("#lookupTextcomp_12739").value = loadData["Результаты выборочного обследования"]["Балконы"][resultsBalconyRows[i].querySelector("#lookupTextcomp_12735").textContent]["Оценка"];
  }

  // Стены
  results.querySelector("#comp_12624").value = loadData["Результаты выборочного обследования"]["Стены"]["Выявленные дефекты"];
  results.querySelector("#comp_12626").value = loadData["Результаты выборочного обследования"]["Стены"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12672").value = loadData["Результаты выборочного обследования"]["Стены"]["Оценка"];

  // Подвал
  results.querySelector("#comp_12628").value = loadData["Результаты выборочного обследования"]["Подвал"]["Выявленные дефекты"];
  results.querySelector("#comp_12630").value = loadData["Результаты выборочного обследования"]["Подвал"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12631").value = loadData["Результаты выборочного обследования"]["Подвал"]["Оценка"];

  // Тех.подполье
  results.querySelector("#comp_12633").value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["Выявленные дефекты"];
  results.querySelector("#comp_12635").value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12636").value = loadData["Результаты выборочного обследования"]["Тех.подполье"]["Оценка"];

  // Тех.этаж
  results.querySelector("#comp_12638").value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["Выявленные дефекты"];
  results.querySelector("#comp_12640").value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12673").value = loadData["Результаты выборочного обследования"]["Тех.этаж"]["Оценка"];

  // Гараж стоянка (подземный)
  results.querySelector("#comp_12747").value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Выявленные дефекты"];
  results.querySelector("#comp_12749").value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12750").value = loadData["Результаты выборочного обследования"]["Гараж стоянка (подземный)"]["Оценка"];

  // Места общего пользования
  for (let i = 1; i < resultsMopRows.length; i++) {
    if (!resultsMopRows[i].querySelector("#comp_12752")) {
      continue;
    }
    resultsMopRows[i].querySelector("#comp_12752").value = loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Выявленные дефекты"];
    resultsMopRows[i].querySelector("#comp_12754").value = loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["% деф. части"];
    resultsMopRows[i].querySelector("#lookupTextcomp_12755").value = loadData["Результаты выборочного обследования"]["Места общего пользования"][resultsMopRows[i].querySelector("#lookupTextcomp_12751").textContent]["Оценка"];
  }

  // Лестницы
  results.querySelector("#comp_12757").value = loadData["Результаты выборочного обследования"]["Лестницы"]["Выявленные дефекты"];
  results.querySelector("#comp_12759").value = loadData["Результаты выборочного обследования"]["Лестницы"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12674").value = loadData["Результаты выборочного обследования"]["Лестницы"]["Оценка"];

  // Перекрытия
  results.querySelector("#comp_12761").value = loadData["Результаты выборочного обследования"]["Перекрытия"]["Выявленные дефекты"];
  results.querySelector("#comp_12763").value = loadData["Результаты выборочного обследования"]["Перекрытия"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12764").value = loadData["Результаты выборочного обследования"]["Перекрытия"]["Оценка"];

  // Система отопления
  for (let i = 1; i < resultsHeatSystemRows.length; i++) {
    if (!resultsHeatSystemRows[i].querySelector("#comp_12766")) {
      continue;
    }
    resultsHeatSystemRows[i].querySelector("#comp_12766").value = loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Выявленные дефекты"];
    resultsHeatSystemRows[i].querySelector("#comp_12768").value = loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["% деф. части"];
    resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12769").value = loadData["Результаты выборочного обследования"]["Система отопления"][resultsHeatSystemRows[i].querySelector("#lookupTextcomp_12765").textContent]["Оценка"];
  }

  // ГВС
  for (let i = 1; i < resultsGvsRows.length; i++) {
    if (!resultsGvsRows[i].querySelector("#comp_12771")) {
      continue;
    }
    resultsGvsRows[i].querySelector("#comp_12771").value = loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Выявленные дефекты"];
    resultsGvsRows[i].querySelector("#comp_12773").value = loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["% деф. части"];
    resultsGvsRows[i].querySelector("#lookupTextcomp_12675").value = loadData["Результаты выборочного обследования"]["ГВС"][resultsGvsRows[i].querySelector("#lookupTextcomp_12770").textContent]["Оценка"];
  }

  // ХВС
  for (let i = 1; i < resultsHvsRows.length; i++) {
    if (!resultsHvsRows[i].querySelector("#comp_12775")) {
      continue;
    }
    resultsHvsRows[i].querySelector("#comp_12775").value = loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Выявленные дефекты"];
    resultsHvsRows[i].querySelector("#comp_12777").value = loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["% деф. части"];
    resultsHvsRows[i].querySelector("#lookupTextcomp_12778").value = loadData["Результаты выборочного обследования"]["ХВС"][resultsHvsRows[i].querySelector("#lookupTextcomp_12774").textContent]["Оценка"];
  }

  // Канализация
  for (let i = 1; i < resultsSewerRows.length; i++) {
    if (!resultsSewerRows[i].querySelector("#comp_12780")) {
      continue;
    }
    resultsSewerRows[i].querySelector("#comp_12780").value = loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Выявленные дефекты"];
    resultsSewerRows[i].querySelector("#comp_12782").value = loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["% деф. части"];
    resultsSewerRows[i].querySelector("#lookupTextcomp_12783").value = loadData["Результаты выборочного обследования"]["Канализация"][resultsSewerRows[i].querySelector("#lookupTextcomp_12779").textContent]["Оценка"];
  }

  // Мусоропроводы
  results.querySelector("#comp_12785").value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Выявленные дефекты"];
  results.querySelector("#comp_12787").value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["% деф. части"];
  results.querySelector("#lookupTextcomp_12788").value = loadData["Результаты выборочного обследования"]["Мусоропроводы"]["Оценка"];

  // Связь с ОДС
  results.querySelector("#comp_12790").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Выявленные дефекты"];
  results.querySelector("#comp_12791").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12792").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12793").value = loadData["Результаты выборочного обследования"]["Связь с ОДС"]["Оценка"];

  // Вентиляция
  results.querySelector("#comp_12795").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Выявленные дефекты"];
  results.querySelector("#comp_12796").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12797").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12798").value = loadData["Результаты выборочного обследования"]["Вентиляция"]["Оценка"];

  // Система промывки и прочистки стволов мусоропроводов
  results.querySelector("#comp_12800").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Выявленные дефекты"];
  results.querySelector("#comp_12801").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12802").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12803").value = loadData["Результаты выборочного обследования"]["Система промывки и прочистки стволов мусоропроводов"]["Оценка"];

  // ОЗДС (охранно-защитная дератизационная система)
  results.querySelector("#comp_12677").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Выявленные дефекты"];
  results.querySelector("#comp_12678").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12679").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12680").value = loadData["Результаты выборочного обследования"]["ОЗДС (охранно-защитная дератизационная система)"]["Оценка"];

  // Газоходы
  results.querySelector("#comp_12687").value = loadData["Результаты выборочного обследования"]["Газоходы"]["Выявленные дефекты"];
  results.querySelector("#comp_12688").value = loadData["Результаты выборочного обследования"]["Газоходы"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12689").value = loadData["Результаты выборочного обследования"]["Газоходы"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12690").value = loadData["Результаты выборочного обследования"]["Газоходы"]["Оценка"];

  // Лифты
  results.querySelector("#comp_12692").value = loadData["Результаты выборочного обследования"]["Лифты"]["Выявленные дефекты"];
  results.querySelector("#comp_12693").value = loadData["Результаты выборочного обследования"]["Лифты"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12694").value = loadData["Результаты выборочного обследования"]["Лифты"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12695").value = loadData["Результаты выборочного обследования"]["Лифты"]["Оценка"];

  // Подъёмное устройство для маломобильной группы населения
  results.querySelector("#comp_12697").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Выявленные дефекты"];
  results.querySelector("#comp_12698").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12699").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12700").value = loadData["Результаты выборочного обследования"]["Подъёмное устройство для маломобильной группы населения"]["Оценка"];

  // Устройство для автоматического опускания лифта
  results.querySelector("#comp_12702").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Выявленные дефекты"];
  results.querySelector("#comp_12703").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12704").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12705").value = loadData["Результаты выборочного обследования"]["Устройство для автоматического опускания лифта"]["Оценка"];

  // Система ЭС
  results.querySelector("#comp_12707").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Выявленные дефекты"];
  results.querySelector("#comp_12708").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12709").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12710").value = loadData["Результаты выборочного обследования"]["Система ЭС"]["Оценка"];

  // ВКВ (второй кабельный ввод)
  results.querySelector("#comp_12712").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Выявленные дефекты"];
  results.querySelector("#comp_12713").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12714").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12710").value = loadData["Результаты выборочного обследования"]["ВКВ (второй кабельный ввод)"]["Оценка"];

  // АВР (автоматическое включение резервного питания)
  results.querySelector("#comp_12717").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Выявленные дефекты"];
  results.querySelector("#comp_12718").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12719").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12720").value = loadData["Результаты выборочного обследования"]["АВР (автоматическое включение резервного питания)"]["Оценка"];

  // ППАиДУ
  results.querySelector("#comp_12722").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Выявленные дефекты"];
  results.querySelector("#comp_12723").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12724").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12725").value = loadData["Результаты выборочного обследования"]["ППАиДУ"]["Оценка"];

  // Система оповещения о пожаре
  results.querySelector("#comp_12727").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Выявленные дефекты"];
  results.querySelector("#comp_12728").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12729").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12730").value = loadData["Результаты выборочного обследования"]["Система оповещения о пожаре"]["Оценка"];

  // Система ГС
  results.querySelector("#comp_12732").value = loadData["Результаты выборочного обследования"]["Система ГС"]["Выявленные дефекты"];
  results.querySelector("#comp_12733").value = loadData["Результаты выборочного обследования"]["Система ГС"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12734").value = loadData["Результаты выборочного обследования"]["Система ГС"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12740").value = loadData["Результаты выборочного обследования"]["Система ГС"]["Оценка"];

  // Система видеонаблюдения
  results.querySelector("#comp_12742").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Выявленные дефекты"];
  results.querySelector("#comp_12743").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["№ и дата последнего обслед."];
  results.querySelector("#comp_12744").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Специализированная организация"];
  results.querySelector("#lookupTextcomp_12745").value = loadData["Результаты выборочного обследования"]["Система видеонаблюдения"]["Оценка"];

  console.log("Done!");
  localStorage.setItem("DataLoaded", JSON.stringify({ address: loadData.address.address }));
}
