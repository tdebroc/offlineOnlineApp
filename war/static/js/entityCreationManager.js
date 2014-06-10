function entityCreationManager() {

//{boolean} used to stop never ending loop of ajax call
this.ajaxStop = false;
//{Number} used to count the number of new properties
this.compteur;


this.init = function() {
	this.compteur = 1;
	this.addFieldButton();
	this.addSelectFieldFromServlet();
}

/**
 * Build more input to add params for new Entities
 * @param{String} type : field to indicate the type of the input
 * @param{String} name : name of the input field used in the servlet
 * @param{String} opt_textToPrepend : text to prepend before input
 * @param{String} opt_textToAppend : text to append after input
 */
buildInput = function(type, name, opt_textToPrepend, opt_textToAppend){
	var textPrepend = (opt_textToPrepend == undefined ? "": opt_textToPrepend);
	var textAppend = (opt_textToAppend == undefined ? "": opt_textToAppend);
	var input = $(textPrepend + '<input/>' + textAppend);
	input.attr('type', type);
	input.attr('name', name);
	input.addClass('form-control');
	return input;
}

/**
 * move the plus button to the new property field and add all the fields
 * to add a param to the new Entity
 */
this.addFieldForNewEntity = function() {
	 this.compteur++;
	 var input = buildInput("text", "propertyName " + this.compteur);
	 var input3 = buildInput("text", "type" + this.compteur);
	 var input4 = buildInput("number", "minVal" + this.compteur);
	 var input5 = buildInput("number", "maxVal" + this.compteur);
	 var button = $("#addPropertyField").clone();
	 var button2 = $("#new").clone();
	 $("#addPropertyField").remove();
	 $("#new").remove();
	 $("#add-new-entity").append("<strong>Property Name"+ this.compteur +" : </strong>");
	 $("#add-new-entity").append(input);
	 $("#add-new-entity").append(" Type : ");
	 $("#add-new-entity").append(input3);
	 $("#add-new-entity").append(" Minimum Value : ");
	 $("#add-new-entity").append(input4);
	 $("#add-new-entity").append(" Maximum Value : ");
	 $("#add-new-entity").append(input5);
	 $("#add-new-entity").append(button);
	 $("#add-new-entity").append(button2);
	 this.addFieldButton();
	 
}

/**
 * bind plus button
 */
this.addFieldButton = function() {
	  $("#addPropertyField").click(this.addFieldForNewEntity.bind(this));
}

/**
 * function that returns a list with unique elements and remove "" element
 */

function unique (list) {
	var result = [];
	$.each(list,function(i,e){
		if($.inArray(e,result) == -1 && e != ""){
			result.push(e);
		}
	});
	return result;
}
/**
* Ajax call to populate select fields to generate a Random Entity whose properties
* already exist in EntityProperty
*/

this.addSelectFieldFromServlet = function(){
	var jsonArray = [];
	var entityArray = [];
	var req = $.get("getEntities", {EntityName : "EntityProperty"}, function(data){
		jsonArray = data;
	}).done(function(){$.each(jsonArray.entities, function() {
		entityArray.push(this.EntityName); 
		});
	
	});
	
	$(document).ajaxStop(function() {
		if(this.ajaxStop){
			return;
		}
		else{
		entityArray = unique(entityArray);
		console.log(entityArray)
		$.each(entityArray,function() {
			var opt = $("<option></option>");
			opt.attr("value",this);
			opt.html(this);
			$("#addRandom").append(opt);
		});
		this.ajaxStop = true;
		}	
		
	});
	}
}
	