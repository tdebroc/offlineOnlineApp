

/**
 * Class to create the table.
 */
function Table() {
	/* {$} Table Element. */
	this.tableEl;
	/* {String} Name of the Model. */
	this.modelName;
	/* {String} Name of the property designing the Entity Kind. */
	this.entityKindPropertyName = ENTITY_KIND_PROPERTY_NAME;
	/* {String} Name of the property designing the Entity Key. */
	this.entityKeyPropertyName = ENTITY_KEY_PROPERTY_NAME;
	/* {Object} . */
	var propertiesNotDisplayed = [this.entityKindPropertyName, this.entityKeyPropertyName];
	/* {String} Class for update button . */
  var updateButtonClass = "updateButton";
  /* {Array[String]} Array with all header for the table. */
  this.headKeys;
  

  /**
	 * Initializes the table and displays it.
	 * @param parentSelector {$}
	 * @param datas {JSON}
	 */
	this.init = function(parentSelector, datas) {
		this.tableEl = $('<table></table>');
		this.tableEl.addClass("table table-striped table-bordered table-condensed");
		this.modelName = datas[0][this.entityKindPropertyName];
		var caption = $('<caption></caption>');
		caption.html("<h2>" + this.modelName + "s</h2>")
		this.tableEl.append(caption);
		
		var headLine = $('<tr></tr>');
		var headKeys = getHeadKeyFromDatas(datas);
		this.headKeys = headKeys;
		for (var i = 0; i < headKeys.length; i++) {
			headLine.append("<th>" + headKeys[i] + "</th>")
		}
		headLine.append("<th> Actions </th>")
		this.tableEl.append(headLine);
		
		for (var i = 0; i < datas.length; i++) {
			var line = datas[i];
			var lineEl = $('<tr></tr>');
			lineEl.attr('data-key', line[this.entityKeyPropertyName])
			for (var j = 0; j < headKeys.length; j++) {
				lineEl.append("<td>" + line[headKeys[j]] + "</td>")
			}
			lineEl.append("<td>" + getActionsButtons() + "</td>")
			this.tableEl.append(lineEl);
		}
		
		$(parentSelector).html(this.tableEl);
		
		this.initListeners();
	}
	
	
	/**
	 * Initializes listener on actions buttons.
	 */
	this.initListeners = function() {
	  this.tableEl.on( "click", "." + updateButtonClass,
	      this.handleClickUpdate.bind(this));
	}
	
	
	/**
	 * Handles click on update button.
	 */
	this.handleClickUpdate = function(e) {
	  var tableLine = $(e.currentTarget).closest('tr');
	  var tdElements = tableLine.find('td');
	  var key = tableLine.attr('data-key');
	  var form = new Form();
	  var dataLine = [];
	  for (var i = 0; i < tdElements.length; i++) {
	    dataLine.push(tdElements[i].innerHTML);
	  }
	  
	  
	  form.buildForm(this.headKeys, MODEL_NAME,
	      key, dataLine);
	  form.bindUpdateClickButton("#updateModal .saveChange");
	  
	  $("#updateModal .modal-body").html("Let's update entity with key " + key);
	  $("#updateModal .modal-body").append(form.form);
	  $("#updateModal").modal();
	}
	
	
	/**
	 * Gets keys for the head of the table.
	 * @param datas {JSON}
	 */
	function getHeadKeyFromDatas(datas) {
		var headsKey = Object.keys(datas[0]);
		for (var i = 0; i < propertiesNotDisplayed.length; i++) {
			var index = headsKey.indexOf(propertiesNotDisplayed[i]);
			if (index > -1) {
				headsKey.splice(index, 1);
			}
		}
		return headsKey;
	}
	
	
	/**
	 * Gets buttons of actions for datas: modify, delete, .
	 */
	function getActionsButtons() {
	  var updateButton = $('<span>&#x270E;</span>');
	  updateButton.addClass(updateButtonClass);
	  
	  var buttonSeparator = $('<span>&nbsp; - &nbsp; </span>');
	  
	  var deleteButton = $('<span>X</span>');
	  deleteButton.addClass('deleteButton');
    
	  var buttons = $('<div></div>');
	  buttons.append(updateButton);
	  buttons.append(buttonSeparator);
	  buttons.append(deleteButton);
		return buttons.html();
	}
	
}



