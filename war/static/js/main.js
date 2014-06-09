$(document).ready(loaded);
/**
 * Called when DOM has been loaded.
 */
function loaded() {
  window.dataBaseManager = new DataBaseManager(MODEL_NAME);
  dataBaseManager.loadDatas();
  $('#launchFullSynch').click(function() {
    dataBaseManager.reloadDatas();
  })
}

