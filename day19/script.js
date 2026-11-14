// 1. Select HTML elements.

const searchForm =
    document.getElementById("searchForm");

const cityInput =
    document.getElementById("cityInput");

const searchButton =
    document.getElementById("searchButton");

const statusMessage =
    document.getElementById("statusMessage");

const weatherResult =
    document.getElementById("weatherResult");

const cityName =
    document.getElementById("cityName");

const updatedAt =
    document.getElementById("updatedAt");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const forecastContainer =
    document.getElementById("forecastContainer");


// 2. Weather descriptions.

const weatherCodes = {

    0: {
        description: "Clear Sky",
        icon: "☀️"
    },

    1: {
        description: "Mainly Clear",
        icon: "🌤"
    },

    2: {
        description: "Partly Cloudy",
        icon: "⛅"
    },

    3: {
        description: "Overcast",
        icon: "☁️"
    },

    45: {
        description: "Fog",
        icon: "🌫"
    },

    48: {
        description: "Fog",
        icon: "🌫"
    },

    51: {
        description: "Light Drizzle",
        icon: "🌦"
    },

    53: {
        description: "Drizzle",
        icon: "🌦"
    },

    55: {
        description: "Heavy Drizzle",
        icon: "🌧"
    },

    61: {
        description: "Light Rain",
        icon: "🌧"
    },

    63: {
        description: "Rain",
        icon: "🌧"
    },

    65: {
        description: "Heavy Rain",
        icon: "⛈"
    },

    71: {
        description: "Light Snow",
        icon: "🌨"
    },

    73: {
        description: "Snow",
        icon: "❄️"
    },

    75: {
        description: "Heavy Snow",
        icon: "❄️"
    },

    80: {
        description: "Rain Showers",
        icon: "🌦"
    },

    81: {
        description: "Rain Showers",
        icon: "🌧"
    },

    82: {
        description: "Heavy Rain Showers",
        icon: "⛈"
    },

    95: {
        description: "Thunderstorm",
        icon: "⛈"
    },

    96: {
        description: "Thunderstorm with Hail",
        icon: "⛈"
    },

    99: {
        description: "Thunderstorm with Hail",
        icon: "⛈"
    }

};


// 3. Get weather description.

function getWeatherInfo(code) {

    return weatherCodes[code] || {

        description: "Unknown Weather",

        icon: "🌡"

    };

}


// 4. Fetch JSON data.

async function getJSON(url) {

    const response = await fetch(url);


    if (!response.ok) {

        throw new Error(
            `HTTP Error: ${response.status}`
        );

    }


    const data = await response.json();


    if (data.error) {

        throw new Error(
            data.reason || "API request failed."
        );

    }


    return data;

}


// 5. Get weather information.

async function loadWeather(city) {

    statusMessage.textContent =
        "Loading weather information...";

    searchButton.disabled = true;

    weatherResult.hidden = true;


    try {


        // Step A: Find city coordinates.

        const geoParams = new URLSearchParams({

            name: city,

            count: "1",

            language: "en",

            format: "json"

        });


        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?${geoParams}`;


        const geoData =
            await getJSON(geoURL);


        // Check city.

        if (!geoData.results || geoData.results.length === 0) {

            throw new Error(
                "City not found. Please enter a valid city name."
            );

        }


        const place = geoData.results[0];


        // Step B: Build weather API URL.

        const weatherParams = new URLSearchParams({

            latitude: place.latitude,

            longitude: place.longitude,

            current:
                "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",

            daily:
                "weather_code,temperature_2m_max,temperature_2m_min",

            temperature_unit: "celsius",

            wind_speed_unit: "kmh",

            timezone: "auto",

            forecast_days: "3"

        });


        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?${weatherParams}`;


        // Step C: Get weather data.

        const weatherData =
            await getJSON(weatherURL);


        // Step D: Display weather.

        displayWeather(place, weatherData);


        statusMessage.textContent =
            "Weather information loaded successfully.";


    } catch (error) {


        console.error(
            "Weather Error:",
            error
        );


        statusMessage.textContent =
            error.message ||
            "Something went wrong. Please try again.";


    } finally {


        searchButton.disabled = false;

    }

}


// 6. Display current weather.

function displayWeather(place, data) {

    const current = data.current;


    const weatherInfo =
        getWeatherInfo(current.weather_code);


    cityName.textContent =
        `${place.name}, ${place.country}`;


    updatedAt.textContent =
        `Local time: ${current.time.replace("T", " ")}`;


    weatherIcon.textContent =
        weatherInfo.icon;


    temperature.textContent =
        `${current.temperature_2m.toFixed(1)}°C`;


    weatherDescription.textContent =
        weatherInfo.description;


    feelsLike.textContent =
        `${current.apparent_temperature.toFixed(1)}°C`;


    humidity.textContent =
        `${current.relative_humidity_2m}%`;


    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;


    displayForecast(data.daily);


    weatherResult.hidden = false;

}


// 7. Display three-day forecast.

function displayForecast(daily) {

    forecastContainer.replaceChildren();


    daily.time.forEach(function (date, index) {


        const weatherInfo =
            getWeatherInfo(daily.weather_code[index]);


        const card =
            document.createElement("article");


        card.className = "forecast-card";


        const dateElement =
            document.createElement("h3");


        const formattedDate =
            new Date(date + "T00:00:00");


        dateElement.textContent =
            formattedDate.toLocaleDateString(
                "en",
                {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                }
            );


        const iconElement =
            document.createElement("div");


        iconElement.className = "forecast-icon";

        iconElement.textContent =
            weatherInfo.icon;


        const descriptionElement =
            document.createElement("p");


        descriptionElement.textContent =
            weatherInfo.description;


        const maxTemperature =
            document.createElement("strong");


        maxTemperature.textContent =
            `Max: ${daily.temperature_2m_max[index]}°C`;


        const minTemperature =
            document.createElement("strong");


        minTemperature.textContent =
            `Min: ${daily.temperature_2m_min[index]}°C`;


        card.appendChild(dateElement);

        card.appendChild(iconElement);

        card.appendChild(descriptionElement);

        card.appendChild(maxTemperature);

        card.appendChild(minTemperature);


        forecastContainer.appendChild(card);

    });

}


// 8. Handle search form.

searchForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const city =
            cityInput.value.trim();


        if (city.length < 2) {

            statusMessage.textContent =
                "Please enter at least two characters.";

            return;

        }


        loadWeather(city);

    }
);


// 9. Load default city.

loadWeather("Kabul");