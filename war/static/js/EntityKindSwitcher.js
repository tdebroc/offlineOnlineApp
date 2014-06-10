
/**
 * Class handling the switch of entity kind for the table
 */
function EntityKindSwitcher(dbManager) {
  this.dbManager = dbManager;
  
  /**
   * Initializes entity kind switcher.
   */
  this.init = function() {
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
  
  this.init();
}