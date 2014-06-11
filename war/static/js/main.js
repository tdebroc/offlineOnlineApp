$(document).ready(loaded);


xhr = new XMLHttpRequest();
/**
 * Called when DOM has been loaded.
 */
function loaded() {
  // as a global variable for debug then switch back to local one.
  window.dataBaseManager = new DataBaseManager(MODEL_NAME);
  dataBaseManager.loadDatas();
  $('#launchFullSynch').click(function() {
    dataBaseManager.reloadDatas();
  });
  var entityKindSwitcher = EntityKindSwitcher(dataBaseManager);
  var ecm = new EntityCreationManager();
  ecm.init();
}


// =============================================================================
// Utilities
// =============================================================================
/**
 * Creates a closure for a callback with a specific scopes and specific
 *     arguments.
 * @param {Object} Scope inside which the function should to be called.
 * @param {Array<Object>} Array of param.
 */
Function.prototype.bindWithParams = function (scope, params) {
  var theFunction = this;
  return (function(theFunction, scope, params) {
    return function() {
      theFunction.apply(scope, params);
    }
  }) (theFunction, scope, params)
}

