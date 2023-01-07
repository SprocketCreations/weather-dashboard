const SEARCH_FORM = document.querySelector("#search-form");
const SEARCH_FORM_ENTRY = SEARCH_FORM.querySelector("#search-form-entry");
const SEARCH_FORM_SUBMIT = SEARCH_FORM.querySelector("#search-form-submit");

const MAX_HISTORY_LENGTH = 10;

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