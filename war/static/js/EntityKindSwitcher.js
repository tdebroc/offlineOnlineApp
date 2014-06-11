
/**
 * Class handling the switch of entity kind for the table
 */
function EntityKindSwitcher(dbManager) {
  this.dbManager = dbManager;
  
  /**
   * Initializes entity kind switcher.
   */
  this.init = function() {
	this.fillEntityKindSelect();
    $('#entityKindSwitcher').on('change',
        this.switchEntityKind.bind(this));
  }

  
  /**
   * Switches Entity Kind for table.
   * @param {Event} Event dispatched.
   */
  this.switchEntityKind = function(e) {
    MODEL_NAME = $(e.currentTarget).val();
    this.dbManager.loadDatas();
  }
  
  /**
  * Ajax call to populate select fields to generate a Random Entity whose properties
  * already exist in EntityProperty
  */
  this.fillEntityKindSelect = function(){
    $(".entityKindSelect").html("");
  	var jsonArray = [];
  	var entityArray = [];
  	var req = $.get("getEntities", {EntityName : "EntityProperty"}, function(data){
  		jsonArray = data;
  	}).done(function(){
  	  $.each(jsonArray.entities, function(i,e) {
  		  entityName = e.EntityName;
  		  if($.inArray(entityName,entityArray) == -1 && e != ""){
  			  entityArray.push(entityName); 
  			  var opt = $("<option></option>");
  			  opt.attr("value",entityName);
  			  opt.html(entityName);
  			  $(".entityKindSelect").append(opt);
  			}
    		
  		});
  	  });
    }
  
  this.init();
}