const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");
const hourlyCardsDiv = document.querySelector(".hourly-cards");
const API_KEY = "b803c7708e6edc3c73ef2047a011d4e2"; // API key for OpenWeatherMap API
// Selecting elements from the DOM



// Function to create the main weather card and 5-day forecast cards
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>Sunrise: ${new Date(weatherItem.sys.sunrise * 1000).toLocaleTimeString()}</h6>
                    <h6>Sunset: ${new Date(weatherItem.sys.sunset * 1000).toLocaleTimeString()}</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else {
        // HTML for the 5-day forecast cards
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                    <h6>Sunrise: ${new Date(weatherItem.sys.sunrise * 1000).toLocaleTimeString()}</h6>
                    <h6>Sunset: ${new Date(weatherItem.sys.sunset * 1000).toLocaleTimeString()}</h6>
                </li>`;
    }
};

// Function to create hourly weather cards
const createHourlyWeatherCard = (weatherItem) => {
    return `<li class="card">
                <h3>${weatherItem.dt_txt.split(" ")[1]}</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                <h6>Humidity: ${weatherItem.main.humidity}%</h6>
            </li>`;
};

// Function to get weather details based on city name
const getCityWeatherDetails = (cityName) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            // Filter the forecasts to get only one forecast per day
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    return uniqueForecastDays.push(forecastDate);
                }
            });

            // Clear previous weather data
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardsDiv.innerHTML = "";
            hourlyCardsDiv.innerHTML = "";

            // Creating weather cards and adding them to the DOM
            fiveDaysForecast.forEach((weatherItem, index) => {
                const html = createWeatherCard(cityName, weatherItem, index);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", html);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", html);
                }
            });

            // Fetch hourly forecast data
            const hourlyForecast = data.list.filter(forecast => {
                const forecastHour = new Date(forecast.dt_txt).getHours();
                return forecastHour % 3 === 0; // Fetch data for every 3 hours
            });

            // Create and add hourly weather cards to the DOM
            hourlyForecast.forEach(weatherItem => {
                const hourlyCardHtml = createHourlyWeatherCard(weatherItem);
                hourlyCardsDiv.insertAdjacentHTML("beforeend", hourlyCardHtml);
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

// Event listeners for search and location buttons
searchButton.addEventListener("click", () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    getCityWeatherDetails(cityName);
});

cityInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const cityName = cityInput.value.trim();
        if (cityName === "") return;
        getCityWeatherDetails(cityName);
    }
});

locationButton.addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
            fetch(WEATHER_API_URL)
                .then(response => response.json())
                .then(data => {
                    const cityName = data.city.name;
                    getCityWeatherDetails(cityName);
                })
                .catch(() => {
                    alert("An error occurred while fetching the weather forecast!");
                });
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        });
});
