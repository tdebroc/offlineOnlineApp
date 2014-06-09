$(document).ready(loaded);

xhr = new XMLHttpRequest();
var compteur = 0;
/**
 * Called when DOM has been loaded.
 */
function loaded() {
  DATABASE_MANAGER.loadDatas();
  addFieldButton();
}

/**
 * move the plus button to the new property field
 */
var addFieldForNewEntity = function() {
	compteur++;
	 var input = buildInput("text", "propertyName" + compteur);
	 var input3 = buildInput("text", "type" + compteur);
	 var input4 = buildInput("text", "minVal" + compteur);
	 var input5 = buildInput("text", "maxVal" + compteur);
	 var button = $(".addPropertyField").clone();
	 var button2 = $("#new").clone();
	 $(".addPropertyField").remove();
	 $("#new").remove();
	 $("#add-new-entity").append("Property Name : ");
	 $("#add-new-entity").append(input);
	 $("#add-new-entity").append(" Type : ");
	 $("#add-new-entity").append(input3);
	 $("#add-new-entity").append(" Minimum Value : ");
	 $("#add-new-entity").append(input4);
	 $("#add-new-entity").append(" Maximum Value : ");
	 $("#add-new-entity").append(input5);
	 $("#add-new-entity").append(button);
	 $("#add-new-entity").append(button2);
	 addFieldButton();
	 
}

/**
 * bind plus button
 */
var addFieldButton = function() {
	  $(".addPropertyField").click(addFieldForNewEntity);
}

var buildInput = function(type, name, textToPrepend, textToAppend){
	var textPrepend = (textToPrepend == undefined ? "": textToPrepend);
	var textAppend = (textToAppend == undefined ? "": textToAppend);
	var input = $(textPrepend + '<input/>' + textAppend);
	input.attr('type', type);
	input.attr('name', name);
	input.addClass('form-control');
	return input;
}