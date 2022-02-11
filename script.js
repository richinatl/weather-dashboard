// search
// 1. function: event handler
// 2. create url for search
// 3. fetch the results
// 4. call function to update results

// function: DoResults
// 1. call function add search term to results
// 2. call function add todays results
// 3. call function add 5 days results
// 4. clear out the text box

// recent search
// function: add search term to results
// parameter in: search term
// 1. add button to the screen with a data attribute that stores the term

// function: event handler
// 1. rear the data attribute to get the search term
// 2. call search function

// results today
// function add today's results

// results 5 days
// function add 5 day results

const apiKey = "5fa2f3286902be895a51818a9f69199a";

let historyArray = [];

searchHistory();

$("#search").on("click", (event) => {
  event.preventDefault();

  const userCity = $("#userInput").val();

  currentConditions(userCity)
    .then((currentConditions) => {
      clear();
      renderCurrent(currentConditions);
    })
    .then(() => {
      savedCities(userCity);
      searchHistory();
    })
    .then(() => {
      fiveDayForecast(userCity).then((forecast) => {
        renderFiveDay(forecast);
      });
    });
});

function currentConditions(city) {
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${apiKey}`;

  return $.ajax({
    url: queryURL,
    method: "GET",
  });
}

function renderCurrent(currentConditions) {
  $(".city__div").html(
    `<h2>${currentConditions.name} ${moment().format("L")}</h2>`
  );

  const iconImg = $("<img>");
  $(".Image__div").append(
    iconImg.attr(
      "src",
      `https://openweathermap.org/img/wn/${currentConditions.weather[0].icon}@2x.png`
    )
  );

  // open weather default kelvin, formula for conversion from w3 schools
  // ℉=((K-273.15)*1.8)+32

  const tempF = (currentConditions.main.temp - 273.15) * 1.8 + 32;
  $(".temp").text(`Temperature: ${tempF.toFixed(1)}°F`);
  $(".humidity").text(`Humidity: ${currentConditions.main.humidity}%`);
  $(".windspeed__div").text(`Windspeed: ${currentConditions.wind.speed} MPH`);

  const lon = currentConditions.coord.lon;
  const lat = currentConditions.coord.lat;

  uvIndex(lat, lon);
}

function uvIndex(lat, lon) {
  const queryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(({ value }) => {
    const uv = value;
    $(".uv__div").html(`UV Index: <span class="uv__span">${uv}</span>`);

    if (uv < 4) {
      $(".uv__span").css({
        "background-color": "green",
        color: "white",
        padding: "1px",
      });
    } else if (uv >= 5 && uv <= 7) {
      $(".uv__span").css({
        "background-color": "yellow",
        color: "black",
        padding: "1px",
      });
    } else {
      $(".uv__span").css({
        "background-color": "red",
        color: "white",
        padding: "1px",
      });
    }
  });
}

function fiveDayForecast(city) {
  const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${apiKey}`;

  return $.ajax({
    url: queryURL,
    method: "GET",
  });
}

function renderFiveDay({ list }) {
  for (let i = 0; i < list.length; i += 8) {
    const date = list[i].dt_txt;
    const formatDate = moment(date).format("L");
    const temp = (list[i].main.temp_max - 273.15) * 1.8 + 32;
    const humidity = list[i].main.humidity;
    const windSpeed = list[i].wind.speed;
    const icon = list[i].weather[0].icon;
    const iconSource = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    const dailyCard = $(
      '<div class="card bg-light ml-0 mb-3 mr-3" style="min-width: 200px;">'
    ).html(
      `<div class="card-body forecast__card"><h5 class="card-title" id="date">${formatDate}</h5><img src="${iconSource}"/><div class="card-text" id="temp-humidity">Temperature: ${temp.toFixed(
        2
      )}°F<br>Humidity: ${humidity}%<br>Wind: ${windSpeed} MPH</div></div></div>`
    );

    $("#fiveDay").append(dailyCard);
  }
}

function clear() {
  $(".Image__div").empty();
  $("#fiveDay").empty();
  $("#userInput").val("");
}

$("#clear").on("click", clear);

function savedCities(city) {
  historyArray.push(city.toLowerCase());

  localStorage.setItem("city", JSON.stringify(historyArray));
}

function searchHistory() {
  let searchHistory = JSON.parse(localStorage.getItem("city"));
  if (!searchHistory) {
    return null;
  }
  historyArray = searchHistory;

  $("#cities").empty();

  for (let i = 0; i < searchHistory.length; i++) {
    const cityButton = $("<button>");
    cityButton.addClass("btn btn-light city__btn m-2 d-block");
    cityButton.attr("data-name", searchHistory[i]);
    cityButton.text(searchHistory[i]);

    $("#cities").append(cityButton);
  }
}

$(document).on("click", ".city__btn", function (event) {
  event.preventDefault();

  clear();

  const historyCity = $(this).attr("data-name");

  currentConditions(historyCity)
    .then((currentConditions) => {
      renderCurrent(currentConditions);
    })
    .then(() => {
      fiveDayForecast(historyCity).then((forecast) => {
        renderFiveDay(forecast);
      });
    });
});
