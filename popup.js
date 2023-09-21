const buttonPhotos = document.querySelector("#photos");
const buttonSave = document.querySelector("#save");
const inputDate = document.querySelector("#form-date");
buttonPhotos.addEventListener("click", uploadPhotos);
buttonSave.addEventListener("click", injectionSave);

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

function injectionPhotos() {
  // Variables
  const iFrameHTML = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
  if (iFrameHTML.querySelector(".injection")) {
    return;
  }
  const iFrameHead = iFrameHTML.querySelector("head");
  const iframeForm = iFrameHTML.querySelector("#formData107");
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
      debugger;
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
  if (!document.querySelector("#formCanvas")) {
    return;
  }
  const iFrameHTML = document.querySelector("#formCanvas").contentWindow.document.querySelector("html");
  const iFrameHead = iFrameHTML.querySelector("head");
  const iFrameBody = iFrameHTML.querySelector("body");
  const iframeForm = iFrameHTML.querySelector("#formData181");
  const wholeAddress = document.querySelector("#title").textContent;
  const area = wholeAddress.split(",")[0];
  const district = wholeAddress.split(",")[1];
  const address = iFrameBody.querySelector("#comboboxTextcomp_12339").value;
  const repairProjectsTable = iframeForm.querySelector("#group_22130");
  const repairProjectsTableRows = repairProjectsTable.querySelectorAll("tr");
  const conclusionsPrevSurvey = iframeForm.querySelector("#gridSql_22131").querySelector(".data");
  const conclusionsPrevSurveyRows = conclusionsPrevSurvey.querySelectorAll("tr");

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

  console.log(data);
}
