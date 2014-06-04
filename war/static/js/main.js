

/**
 * Builds the table on the DOM.
 * @param dataJsonString {String}
 */
function buildTable(dataJsonString) {
	var jsonDatas = JSON.parse(dataJsonString);
	var table = new Table();
	table.init("#content", jsonDatas);
	localStorage["allDatas" + MODEL_NAME] = dataJsonString;
}


/**
 * Loads all datas.
 */
function loadDatas() {
	var allDatas = localStorage["allDatas" + MODEL_NAME];
	allDatas = undefined;
	if (allDatas) {
		buildTable(allDatas);
	} else {
		$.get("getEntities?EntityName=" + MODEL_NAME, buildTable);
	}
}


$(document).ready(loaded);

/**
 * Called when DOM has been loaded.
 */
function loaded() {
	loadDatas();
}

