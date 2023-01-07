const SEARCH_FORM = document.querySelector("#search-form");
const SEARCH_FORM_ENTRY = SEARCH_FORM.querySelector("#search-form-entry");
const SEARCH_FORM_SUBMIT = SEARCH_FORM.querySelector("#search-form-submit");

const MAX_HISTORY_LENGTH = 10;

const API = (latitude, longitude, count=6, key="0369d7a1c84205562665deb9dec64eea") => `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${key}&cnt=${count}`;
const GEO_API = (city, limit=1, key="0369d7a1c84205562665deb9dec64eea") => `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${key}`;

const wipeHistory = () => {
	localStorage.removeItem("history");
};

const getCityHistory = () => {
	const history = localStorage.getItem("history");
	return history === null ? [] : JSON.parse(history);

};

const addCityToHistory = city => {
	const history_queue = getCityHistory();
	history_queue.unshift(city);
	console.log(history_queue);
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
	
	addCityToHistory(city);
	
	destroyHistoryButtons();
	generateHistoryButtons();

	event.preventDefault();
	SEARCH_FORM.reset();
});

const doFetch = (api, callback) => {
	fetch(api).then(response => response.json()).then(callback);
};

doFetch(GEO_API("London"), json => {
	console.log(json);
	const city = json[0];
	doFetch(API(city.lat, city.lon), json => {
		console.log(json);
	});
});
