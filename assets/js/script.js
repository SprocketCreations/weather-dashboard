const SEARCH_FORM = document.querySelector("#search-form");
const SEARCH_FORM_ENTRY = SEARCH_FORM.querySelector("#search-form-entry");
const SEARCH_FORM_SUBMIT = SEARCH_FORM.querySelector("#search-form-submit");
const CARDS_ROOT = document.querySelector("#cards");

const MAX_HISTORY_LENGTH = 10;
const WEATHER_CARDS = [];

const API = (latitude, longitude, key = "0369d7a1c84205562665deb9dec64eea") => `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&units=imperial`;
const GEO_API = (city, limit = 1, key = "0369d7a1c84205562665deb9dec64eea") => `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${key}`;

function WeatherCard(header, img, temp_span, wind_span, humidity_span) {
	this.header = header;
	this.img = img;
	this.temp_span = temp_span;
	this.wind_span = wind_span;
	this.humidity_span = humidity_span;

	this.updateCard = (date, icon, temperature, wind, humidity) => {
		this.header.textContent = date;
		this.img.src = icon;
		this.temp_span.textContent = temperature;
		this.wind_span.textContent = wind;
		this.humidity_span.textContent = humidity;
	};
}

const wipeHistory = () => {
	localStorage.removeItem("history");
};

const getCityHistory = () => {
	const history = localStorage.getItem("history");
	return history === null ? [] : JSON.parse(history);

};

const addCityToHistory = city => {
	const history_queue = getCityHistory();
	const index = history_queue.indexOf(city);
	if (index != -1) {
		history_queue.splice(index, 1);
	}
	history_queue.unshift(city);

	if (history_queue.length > MAX_HISTORY_LENGTH) {
		history_queue.pop();
	}
	localStorage.setItem("history", JSON.stringify(history_queue));
};

const destroyHistoryButtons = () => {
	const history_buttons = SEARCH_FORM.querySelectorAll("button");
	history_buttons.forEach(button => button.remove());
};

const generateHistoryButtons = () => {
	getCityHistory().forEach(city => {
		const button = document.createElement("button");
		button.type = "button";
		button.setAttribute("class", "btn btn-secondary");
		button.textContent = city;
		button.addEventListener("click", event => {
			event.preventDefault();
			SEARCH_FORM_ENTRY.value = city;
			SEARCH_FORM_SUBMIT.click();
		});
		SEARCH_FORM.appendChild(button);
	});
};

SEARCH_FORM.addEventListener("submit", event => {
	const city = SEARCH_FORM_ENTRY.value;

	findCity(city);

	event.preventDefault();
	SEARCH_FORM.reset();
});

const findCity = city => {
	doFetch(GEO_API(city), json => {
		if (json.length === 0) {
			//city not found
		}
		else {
			const city = json[0];

			addCityToHistory(city.name);

			destroyHistoryButtons();
			generateHistoryButtons();

			getWeather(city.lat, city.lon, city.name);
		}

	});
}

const getWeather = (lat, lon, city) => {
	doFetch(API(lat, lon), json => {
		const weathers = filterWeatherData(json.list);

		CARDS_ROOT.classList.remove("invisible");

		for (let i = 0; i < 6; ++i) {
			const weather = weathers[i];
			const icon = `https://openweathermap.org/img/w/${weathers[i].weather[0].icon}.png`;
			const date = `${i === 0 ? `${city} (` : ""}${dayjs.unix(weather.dt).format("M/D/YYYY")}${i === 0 ? ")" : ""}`;
			const temperature = `${weather.main.temp}*F`;
			const wind = `${weather.wind.speed} MPH`;
			const humidity = `${weather.main.humidity}%`;

			WEATHER_CARDS[i].updateCard(date, icon, temperature, wind, humidity);
		}
	});
};

const doFetch = (api, callback) => {
	fetch(api).then(response => response.json()).then(callback);
};

const linkCards = () => {
	
	const cards = [];
	cards.push(CARDS_ROOT.querySelector(":scope > div"));
	cards.push(...CARDS_ROOT.querySelectorAll(":scope > div:not(:first-child) > div"));

	for (let i = 0; i < cards.length; ++i) {
		const header = cards[i].querySelector(`:scope ${i === 0 ? "h3" : "h5"}`)
		const spans = [...cards[i].querySelectorAll(":scope span")];
		const img = cards[i].querySelector(":scope img");
		WEATHER_CARDS.push(new WeatherCard(header, img, spans[0], spans[1], spans[2]));
	}
};

const filterWeatherData = weatherData => {
	const filteredWeatherData = [];
	weatherData.forEach(data => {
		const hour = dayjs.unix(data.dt).hour();
		if(hour === 13) {
			filteredWeatherData.push(data);
		}
	});
	if(dayjs().hour() < 13) {
		filteredWeatherData.push(weatherData[weatherData.length - 1]);
	}
	else {
		filteredWeatherData.unshift(weatherData[0]);
	}
	return filteredWeatherData;
};


linkCards();
generateHistoryButtons();