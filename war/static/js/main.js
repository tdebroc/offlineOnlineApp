$(document).ready(loaded);


/**
 * Called when DOM has been loaded.
 */
function loaded() {
  // TODO : It's as a global variable for debug then switch back to local one.
  window.dataBaseManager = new DataBaseManager(MODEL_NAME);
  dataBaseManager.loadDatas();
  $('#launchFullSynch').click(function() {
    dataBaseManager.reloadDatas();
  });
  var entityKindSwitcher = new EntityKindSwitcher(dataBaseManager);
  var ecm = new EntityCreationManager(dataBaseManager,entityKindSwitcher);
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

