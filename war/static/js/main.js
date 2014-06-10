$(document).ready(loaded);


xhr = new XMLHttpRequest();
/**
 * Called when DOM has been loaded.
 */
function loaded() {
  window.dataBaseManager = new DataBaseManager(MODEL_NAME);
  dataBaseManager.loadDatas();
  $('#launchFullSynch').click(function() {
    dataBaseManager.reloadDatas();
  });
  ecm = new entityCreationManager();
  ecm.init();
}	
  
