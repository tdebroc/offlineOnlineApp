define([ 'jquery', 'DBManager', 'Form', 'bootstrap' ], 
  function($, dbManager, Form) {

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
		var propertiesNotDisplayed = [ this.entityKindPropertyName,
				this.entityKeyPropertyName ];
		/* {String} Class for update button . */
		var updateButtonClass = "updateButton";
		/* {String} Class for remove button . */
		var removeButtonClass = "deleteButton";
		/* {Array[String]} Array with all header for the table. */
		this.headKeys;
		/* {DBManager} DBManager handling datas with the form. */
		this.dbManager;

		/**
		 * Initializes the table and displays it.
		 * 
		 * @param parentSelector
		 *          {$}
		 * @param datas
		 *          {JSON}
		 */
		this.init = function(parentSelector, datas) {
			this.tableEl = $('<table></table>');
			this.tableEl
					.addClass("table table-striped table-bordered table-condensed table-curved");
			this.modelName = datas[0][this.entityKindPropertyName];
			var caption = $('<caption></caption>');
			caption.html("<h2>" + this.modelName + "s (" + datas.length
					+ " elements)</h2>")
			this.tableEl.append(caption);

			var headLine = $('<tr></tr>');
			var headKeys = getHeadKeyFromDatas(datas);
			this.headKeys = headKeys;
			for (var i = 0; i < headKeys.length; i++) {
				headLine.append("<th>" + headKeys[i] + "</th>")
				headLine.attr('data-Headkey', headKeys[i]);
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
			this.tableEl.on("click", "." + updateButtonClass,
					this.handleClickUpdate.bind(this));
			this.tableEl.on("click", "." + removeButtonClass,
					this.handleClickRemove.bind(this));
			$(document).on("click", "#generateEntityModal .btn-primary",
					this.handleConfirmGenerateRandom.bind(this));
			$(document).on("click", "#insertNewEntity",
					this.handleInsertNewEntity.bind(this));
		}

		/**
		 * Handles click on remove
		 */
		this.handleClickRemove = function(e) {
			var tableLine = $(e.currentTarget).closest('tr');
			var tdElements = tableLine.find('td');
			var key = tableLine.attr('data-key');
			var input = $('<input/>');
			input.attr('type', 'hidden');
			input.val(key);
			input.attr('name', 'key');
			$("#removeModal .modal-body").html("The entity has key : " + key);
			$("#removeModal .modal-body").append(input);
			$("#removeModal").modal();

			$("#removeModal .btn-primary").click(
					this.removeButtonCallback.bind(this));
		}

		/**
		 * Callback for a click on the confirmation remove button.
		 */
		this.removeButtonCallback = function() {
			var key = $("#removeModal .modal-body input[name='key']").val();
			console.log("delete entity with key " + key);
			$('#removeModal').modal('hide');
			this.dbManager.removeEntity(key);
		}

		/**
		 * Handles confirm click on insert new entity.
		 */
		this.handleConfirmGenerateRandom = function() {
			var modelName = $('#addRandom').val();
			this.dbManager.generateRandomEntity(modelName);
		}

		/**
		 * Handles click on update button.
		 */
		this.handleClickUpdate = function(e) {
			var tableLine = $(e.currentTarget).closest('tr');
			var tdElements = tableLine.find('td');
			var key = tableLine.attr('data-key');
			var form = new Form(this.dbManager);
			var dataLine = [];
			for (var i = 0; i < tdElements.length; i++) {
				dataLine.push(tdElements[i].innerHTML);
			}
			form.buildForm(this.headKeys, MODEL_NAME, key, dataLine);
			form.bindUpdateClickButton("#updateModal .saveChange");

			$("#updateModal .modal-body").html(
					"Let's update entity with key " + key);
			$("#updateModal .modal-body").append(form.form);
			$("#updateModal").modal();
		}

		/**
		 * Gets keys for the head of the table.
		 * 
		 * @param datas
		 *          {JSON}
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
			var updateButton = $('<img/>');
			updateButton.addClass(updateButtonClass);
			updateButton.addClass('actionButton');
			updateButton.attr('src', 'static/images/bluePenEdit.jpeg');
			var buttonSeparator = $('<span>&nbsp; - &nbsp; </span>');

			var deleteButton = $('<img/>');
			deleteButton.addClass(removeButtonClass);
			deleteButton.addClass('actionButton');
			deleteButton.attr('src', 'static/images/removeButton.png');

			var buttons = $('<div></div>');
			buttons.append(updateButton);
			buttons.append(buttonSeparator);
			buttons.append(deleteButton);
			return buttons.html();
		}

		/**
		 * Handles click on insert new Entity button.
		 */
		this.handleInsertNewEntity = function() {
			var form = new Form();
			form.buildForm(this.headKeys, MODEL_NAME, "TEMP"
					+ this.dbManager.getUniqueTemporaryKeyIndex(MODEL_NAME));
			$("#insertNewEntityModel .modal-body").html(
					"Let's insert new entity of " + "kind : " + MODEL_NAME);
			$("#insertNewEntityModel .modal-body").append(form.form);
			$("#insertNewEntityModel").modal();
			$("#insertNewEntityModel .insertEntity").unbind();
			$("#insertNewEntityModel .insertEntity").on("click",
					this.clickInsertNewEntity.bindWithParams(this, [ form ]));
		}

		/**
		 * Handles click on insert a new entity button.
		 * 
		 * @parma {Form} form The form Oject.
		 */
		this.clickInsertNewEntity = function(form) {
			var serializedForm = form.serializeForm();
			console.log("insert this new entity "
					+ JSON.stringify(serializedForm));
			this.dbManager.insertEntity(serializedForm);
		}

	}
	return Table;
});
