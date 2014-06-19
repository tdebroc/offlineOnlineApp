define([ 'jquery', 'DBManager', 'EntityKindSwitcher' ], function($, dbManager,
		EntityKindSwitcher) {

	function EntityCreationManager(dbManager, entityKindSwitcher) {

		// {Number} Used to count the number of new properties.
		this.compteur = 0;
		// {DatabaseManager} Used to have a consistent local db when generating
		// Entities.
		this.dbManager = dbManager;
		// {EntityKindSwitcher} Used to have access to the function
		// fillEntityKindSelect.
		this.entityKindSwitcher = new EntityKindSwitcher(this.dbManager);

		this.init = function() {
			this.initForm();
			this.bindClickCreateNewEntityConfirm();
		}

		/**
		 * Binds click on the confirmation button to create new entity.
		 */
		this.bindClickCreateNewEntityConfirm = function() {
			$('#createNewEntityConfirm').click(this.createNewEntity.bind(this));
		}

		/**
		 * Call the service to create new entity.
		 */
		this.createNewEntity = function() {
			var params = "";
			var inputs = $('#add-new-entity input');
			for (var i = 0; i < inputs.length; i++) {
				params += inputs.eq(i).attr('name') + "=" + inputs.eq(i).val();
				params += i != inputs.length - 1 ? "&" : "";
			}
			$.get('/generateNewEntityServlet?' + params).done(
					this.createNewEntitySuccess.bind(this)).fail(
					this.createNewEntityFailure.bind(this))
		}

		/**
		 * Callback for a success while creating a new entity.
		 */
		this.createNewEntitySuccess = function(data) {
			$('#newEntityModalMessage').html(data);
			$('#newEntityModalMessage').css('color', 'green');
			this.initForm();
			this.entityKindSwitcher.fillEntityKindSelect();
		}

		/**
		 * Callback for a failure while creating a new entity.
		 */
		this.createNewEntityFailure = function() {
			$('#newEntityModalMessage').html("Error while creating entity");
			$('#newEntityModalMessage').css('color', 'red');
		}

		/**
		 * Initializes the form.
		 */
		this.initForm = function() {
			$("#add-new-entity").html("");
			this.compteur = 1;
			this.addEntityNameInput();
			this.addFieldForNewEntity();
		}

		/**
		 * Build more input to add params for new Entities.
		 * 
		 * @param{String} type : field to indicate the type of the input
		 * @param{String} name : name of the input field used in the servlet
		 * @param{String} opt_textToPrepend : text to prepend before input
		 * @param{String} opt_textToAppend : text to append after input
		 */
		var buildInput = function(type, name, opt_textToPrepend, opt_textToAppend) {
			var textPrepend = (opt_textToPrepend == undefined ? ""
					: opt_textToPrepend);
			var textAppend = (opt_textToAppend == undefined ? "" : opt_textToAppend);
			var input = $(textPrepend + '<input/>' + textAppend);
			input.attr('type', type);
			input.attr('name', name);
			input.addClass('form-control');
			return input;
		}

		/**
		 * Adds entity Name input.
		 */
		this.addEntityNameInput = function() {
			var input = buildInput("text", "entityName");
			$("#add-new-entity").append("<b> Entity Name : </b>").append(input);
		}

		/**
		 * Move the plus button to the new property field and add all the fields to
		 * add a param to the new Entity.
		 */
		this.addFieldForNewEntity = function() {
			var input = buildInput("text", "propertyName" + this.compteur);
			var input3 = buildInput("text", "type" + this.compteur);
			var input4 = buildInput("number", "minVal" + this.compteur);
			var input5 = buildInput("number", "maxVal" + this.compteur);
			var addPropertyButton = $("<div>Add Property</div>")
			addPropertyButton.attr('id', 'addPropertyField');
			addPropertyButton.addClass("btn btn-default")
			$("#addPropertyField").remove();
			$("#new").remove();
			$("#add-new-entity").append(
					"<span><strong>Property Name " + this.compteur
							+ " : </strong></span>").append(input).append(
					"<span>Type : </span>").append(input3).append(
					"<span> Minimum Value : </span>").append(input4).append(
					"<span>Maximum Value : </span>").append(input5).append(
					addPropertyButton);
			this.bindClickAddProperty();
			this.compteur++;
		}

		/**
		 * Bind the click on button to add more properties to a new Entity.
		 */
		this.bindClickAddProperty = function() {
			$("#addPropertyField").click(this.addFieldForNewEntity.bind(this));
		}
		this.init();
	}
	return EntityCreationManager;
});
