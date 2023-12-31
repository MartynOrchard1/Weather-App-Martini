const apiKey = "c47d5955ac75a3b8ba4e2fdd705a0fe5"; // Api key from openweatherapi.org
let map = null;
let output;

function fetchCurrentWeatherData() {
  let location = document.getElementById("locationSelector").value; 

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      // Get the latitude and longitude from the API response
      latitude = data.coord.lat;
      longitude = data.coord.lon;

      // Call renderMap function to display the map for the provided coordinates
      renderMap(latitude, longitude);

      // Call the updateWeatherImage function with the weather description
      updateWeatherImage(data.weather[0].description);

      // Now that we have latitude and longitude, fetch weather forecast
      fetchWeatherForecastData();

      updateWeatherAndMap(data);
    })
    .catch((error) => {
      console.error("Error fetching current weather data", error); // Error Message
    });
}

function fetchWeatherForecastData() {
  let location = document.getElementById("locationSelector").value; // Get the location from the location selector

  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}` // Fetch the weather forecast data
  )
    .then((response) => response.json()) 
    .then((data) => {
      let noonForecasts = data.list.filter((item) => {
        let date = new Date(item.dt * 1000);
        return date.getUTCHours() === 12; // Filter the forecasts to only include noon forecasts
      });

      let output = ""; // Initialize the output

      // Days Array
      let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      for (let i = 0; i < noonForecasts.length && i < 5; i++) {
        // Loop through the noon forecasts
        let date = new Date(noonForecasts[i].dt * 1000);
        let dayName = days[date.getUTCDay()];
        let weatherIcon = noonForecasts[i].weather[0].icon;

        // Open a new weather card div for each forecast
        output += '<div class="weather-card">';
        output += '<div class="day-weather">'; // Open a new div for weather icon

        // Display the day name
        output += `<h4>${dayName} Noon</h4>`;

        // Display the weather icon
        const weatherIconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;
        output += `<img src="${weatherIconUrl}" alt="weather icon" class="weather-icon">`;

        output += "</div>"; // Close the day-weather div

        let tempCelsius = (noonForecasts[i].main.temp - 273.15).toFixed(2); // Convert from Kelvin to Celsius
        output += `${tempCelsius} °C <br>`; // Temperature
        output += `${noonForecasts[i].weather[0].description} <br>`; // Description

        // output += `${noonForecasts[i].wind.speed} m/s`; Wind Speed !! If you want wind speed to display un-comment this line !!

        // Close the weather card div
        output += "</div>";
      }

      document.getElementById("forecast").innerHTML = output; // Creates Forecasts cards
    })
    .catch((error) => {
      console.error("Error fetching weather forecast data", error);
    });
}

function updateWeatherImage(description) {

  let imageElement = document.getElementById("weatherImage");
   
  // Update the weather image based on the weather description
  if (description.includes("rain")) {
    imageElement.src = "./images/weather/rain.jpg";
  } else if (description.includes("clear")) {
    imageElement.src = "./images/weather/sun.jpg";
  } else if (description.includes("cloud")) {
    imageElement.src = "./images/weather/cloud.jpg";
  } // More conditions for snow etc can be added below
}

function updateWeatherAndMap(data) {
  const currentlyList = document.getElementById("weatherdata");

  // Update current weather information
  const temperatureCelsius = (data.main.temp - 273.15).toFixed(2); // Convert from kelvin to celsius

  // Update Currently List to real time weather data in chosen city
  currentlyList.innerHTML = ` 
        <ul>
            <li>Country: ${data.sys.country}</li>
            <li>City: ${data.name}</li>
            <li>Temperature: ${temperatureCelsius} °C</li>
            <li>Description: ${data.weather[0].description}</li>
            <li>Wind Speed: ${data.wind.speed} m/s</li>
        </ul>
    `;

  // Initialize or update the map
  if (!map) {
    map = L.map("map").setView([data.coord.lat, data.coord.lon], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
  } else {
    map.setView([data.coord.lat, data.coord.lon], 14);
  }
}

function renderMap(latitude, longitude) {
  const mapContainer = document.getElementById("map");

  // remove previous map instance if it exists
  if (map !== null) {
    map.remove();
  }

  // create a new map instance
  map = L.map(mapContainer).setView([latitude, longitude], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 1,
  }).addTo(map);

  L.marker([latitude, longitude]).addTo(map);
}

function fetchWeatherData() {
  fetchCurrentWeatherData();
  fetchWeatherForecastData();
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the page with weather data for the default city (Palmerston North)
  fetchWeatherData();

  // Add an event listener for the location selector change
  const locationSelector = document.getElementById("locationSelector");
  locationSelector.addEventListener("change", function () {
    // Call fetchWeatherData() to update the data when a new city is selected
    fetchWeatherData();
  });
});
