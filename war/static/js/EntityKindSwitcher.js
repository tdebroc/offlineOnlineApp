define([ 'jquery', 'DBManager' ], function($, dbManager) {
	/**
	 * Class handling the switch of entity kind for the table
	 */
	function EntityKindSwitcher(dbManager) {
		this.dbManager = dbManager;

		/**
		 * Initializes entity kind switcher.
		 */
		this.init = function() {
			$('#entityKindSwitcher').on('change', this.switchEntityKind.bind(this));
			this.fillEntityKindSelect();
		}

		/**
		 * Switches Entity Kind for table.
		 * 
		 * @param {Event}
		 *          Event dispatched.
		 */
		this.switchEntityKind = function(e) {
			MODEL_NAME = $(e.currentTarget).val();
			this.dbManager.loadDatas();
		}

		/**
		 * Callback to generate the select fields for already existing entities
		 * 
		 * @param {JSON
		 *          Array} : contains the Entities with their name
		 */
		this.callbackSuccessCreateRandomEntity = function(data) {
			$(".entityKindSelect").append($("<option value=''>--</option>"));
			$.each(data.entities, function(i, e) {
				entityName = e.EntityName;
				var opt = $("<option></option>");
				opt.attr("value", entityName);
				opt.html(entityName);
				$(".entityKindSelect").append(opt);
			});
			this.dbManager.loadDatas();
		}
		/**
		 * Ajax call to populate select fields to generate a Random Entity whose
		 * properties already exist in EntityProperty
		 */
		this.fillEntityKindSelect = function() {
			$(".entityKindSelect").html("");
			$.get("getAllEntityNames", this.callbackSuccessCreateRandomEntity
					.bind(this));
		}
		this.init();
	}

	return EntityKindSwitcher;
});
