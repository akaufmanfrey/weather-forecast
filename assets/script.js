const searchHistory = $('aside');
const submitButton = $('button');
const weatherDisplayElement = $('#weather');
const apiKey = 'f1d985f2f05b0ca0bb78b860038d22dc'

function initializePage() {
    // generate search buttons based on local storage
    const cityHistory = readCitiesFromStorage();
    if (cityHistory) {
        cityHistory.forEach(generateHistoryButton);
    }
}

function generateHistoryButton(city) {
    // generate a single button and append it to the search history column
    const cityButton = $('<button>');
    cityButton.addClass('bg-primary-subtle py-2 search-history block my-2 w-100');
    cityButton.text(city);
    searchHistory.append(cityButton);
}

function handleSubmit(e) {
    e.preventDefault();
    // grab user's input
    const cityInputEl = $('#city');
    const cityInput = cityInputEl.val().trim();
    // if non-empty, make a call to the geo api to get city coordinates
    if (cityInput) {
        const apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=1&appid=${apiKey}`
        fetch(apiUrl).then(function (response) {
            if (response.ok) {
                console.log(response);

                // parse response into a JS object
                response.json().then(function (data) {
                    if (data.length !== 0) {
                        fetchWeatherInfo(data[0]);
                    } else {
                        alert("No city with that name found");
                    }
                });
            } else {
                alert(`Error: ${response.statusText}`);
            }
        });
    }
}

function fetchWeatherInfo(city) {
    // using the city's coordinates, make a call to the weather api
    const apiUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${apiKey}`
    fetch(apiUrl).then(function (response) {
        if (response.ok) {
            console.log(response);
            response.json().then(function(data) {
                // get search history and check if the current city is already in local storage
                const cityArray = readCitiesFromStorage();
                if (!(cityArray.includes(city.name))) {
                    // if not included, add city name to local storage array
                    cityArray.push(city.name);
                    generateHistoryButton(city.name);
                    localStorage.setItem('cities', JSON.stringify(cityArray));
                }
                //clear display and generate new city cards
                weatherDisplayElement.empty();
                //give first card extra width
                createWeatherCard(data.list[0], city.name, 12);
                // generate header for 5 day forecast cards
                const title = $('<h2>');
                title.text('5 day forecast:');
                title.addClass('mx-3 w-100');
                weatherDisplayElement.append(title);
                createWeatherCard(data.list[8]);
                createWeatherCard(data.list[16]);
                createWeatherCard(data.list[24]);
                createWeatherCard(data.list[32]);
                createWeatherCard(data.list[data.list.length-1]);  
                
            });
        }
    });
}

function readCitiesFromStorage() {

    //Retrieve cities from localStorage and parse the JSON to an array. If there are no cities in localStorage, initialize an empty array and return it.
    const storageArray = JSON.parse(localStorage.getItem("cities"));
    if (storageArray) {
        return storageArray
    } else {
        const emptyArray = [];
        return emptyArray
    }

}

function createWeatherCard(data, name='', width=2) {
    // create container for all weather info
    const mainCard = $('<div>');
    mainCard.addClass(`card bg-primary text-white my-3 mx-3 col-${width}`);
    const cardDate = $('<div>');
    cardDate.addClass('card-header');
    // check if the card being created is the current forecast, add the city name in front of the date
    if (width=12) {
        cardDate.text(name + ' (' + data.dt_txt.slice(0, 10) + ')');
    } else {
        cardDate.text(data.dt_txt.slice(0, 10));
    }
    // create img for weather conditions based on the icons stored on openweathermap
    const cardCond = $('<img>');
    cardCond.attr('src', `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
    cardCond.attr('height', '50px');
    cardCond.attr('width', '50px');
    const cardTemp = $('<p>');
    cardTemp.addClass('card-text');
    // since the api call is made with units=metric, the temp is in celsius, wind speed is in m/s
    cardTemp.text('Temperature: ' + data.main.temp + ' \u00B0C');
    const cardWind = $('<p>');
    cardWind.addClass('card-text');
    cardWind.text('Wind: ' + data.wind.speed + ' m/s');
    const cardHumid = $('<p>');
    cardHumid.addClass('card-text');
    cardHumid.text('Humidity: '+ data.main.humidity +'%');
    // all all content to the card and append the card to the page
    mainCard.append(cardDate);
    mainCard.append(cardCond);
    mainCard.append(cardTemp);
    mainCard.append(cardWind);
    mainCard.append(cardHumid);
    weatherDisplayElement.append(mainCard);

}
// event handler for clicking on search history buttons
searchHistory.on('click', '.search-history', function (event) {
    $('#city').val($(event.target).text());
    submitButton.click();
})
$(document).ready(function() {
    initializePage();
    submitButton.on('click', handleSubmit);
})

