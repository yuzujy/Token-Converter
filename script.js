import { API_URL } from "./api";

const corsProxyUrl = 'https://corsproxy.io/?';
const apiUrl = `${corsProxyUrl}${API_URL}`;

const DATA_PRECISION = 2;

const dropList = document.querySelectorAll("form select"),
fromCurrency = document.querySelector(".from select"),
toCurrency = document.querySelector(".to select"),
getButton = document.querySelector("form button");

let data = [];

async function fetchData() {
    try {
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const fetchedData = await response.json();
      data = fetchedData;
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  };

  fetchData()
  .then(() => {
    data = filterData();
    console.log(data);

    for (let i = 0; i < dropList.length; i++) {
      dropList[i].innerHTML = '';
      data.forEach((currency) => {
        let selected =
          i === 0 ? (currency.currency === "USD" ? "selected" : "") : (currency.currency === "ETH" ? "selected" : "");
        let optionTag = `<option value="${currency.currency}" ${selected}>${currency.currency}</option>`;
        dropList[i].insertAdjacentHTML("beforeend", optionTag);
      });

      dropList[i].addEventListener("change", (e) => {
        loadToken(e.target);
      });
    }

    getRate();
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

  fromCurrency.addEventListener("change", () => {
    loadToken(fromCurrency);
  });

  toCurrency.addEventListener("change", () => {
    loadToken(toCurrency);
  });

  window.addEventListener("load", ()=>{
    getRate();
});

  const exchangeIcon = document.querySelector("form .icon");
  exchangeIcon.addEventListener("click", () => {
    let tempCode = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = tempCode;
    loadToken(fromCurrency);
    loadToken(toCurrency);
    getRate();
  });

function loadToken(element) {
  let currencyCode = element.value;
  let imgTag = element.parentElement.querySelector("img");
  imgTag.src = `./images/tokens/${currencyCode}.svg`;
}

function filterData() {
const filteredData = {};

    for(const currencyData of data) {
        const currencyCode = currencyData.currency;

        if(!(currencyCode in filteredData)) {
            filteredData[currencyCode] = currencyData;
        } else {
            const existingData = filteredData[currencyCode];
            const currentDate = new Date(currencyData.date);
            const existingDate = new Date(existingData.date);
            if(currentDate > existingDate) {
                filteredData[currencyCode] = currencyData;
            }
        }
    }
    return Object.values(filteredData);
}

function getRate() {
    const amount = document.querySelector("form input");
    const txt = document.querySelector("form .exchange-rate");
    let amountVal = amount.value;
    if (amountVal === "" || amountVal === "0") {
      amount.value = "1";
      amountVal = 1;
    }

    if (amountVal < 0 || isNaN(amountVal)) {
        txt.innerText = "Please enter a valid numeric amount";
        return;
    }

    txt.innerText = "Getting rate...";
    
    let fromCurrencyCode = fromCurrency.value;
    let toCurrencyCode = toCurrency.value;
  
    let fromCurrencyObject = data.find((currency) => currency.currency === fromCurrencyCode);
    let toCurrencyObject = data.find((currency) => currency.currency === toCurrencyCode);
    
    if (fromCurrencyObject && toCurrencyObject) {
      let exchangeRate = fromCurrencyObject.price / toCurrencyObject.price;
      let totalRate = (amountVal * exchangeRate).toFixed(DATA_PRECISION);
      txt.innerText = `${amountVal} ${fromCurrencyCode} = ${totalRate} ${toCurrencyCode}`;
    } else {
      txt.innerText = "Exchange rate not available.";
    }
  }

  getButton.onclick = function () {
    this.innerHTML = "<div class='loader'></div>";
    setTimeout(() => {
      this.innerHTML = "Get Rate";
      getRate(); 
    }, 2000); 
  };
  