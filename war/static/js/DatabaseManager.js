
/**
 * Class managing AJAX synchronization.
 */
var DATABASE_MANAGER = new (function() {
  
  this.isOnline = true;
  
  /**
   * Updates Entity from a JSON.
   * @param {JSON} jsonEntity
   */
  this.updateEntity = function(jsonEntity) {
    if (this.isOnline) {
      $.get("updateEntity?entityJson=" + JSON.stringify(jsonEntity),
          this.callBackUpdateEntity.bind(this));      
    } else {
      
    }
    this.updateLocalStorageModel(jsonEntity);
  }
  
  
  /**
   * Callback for the update entity ajax call.
   */
  this.callBackUpdateEntity = function() {
    $('.cancelSaveChange').click();
  }
  
  /**
   * Updates localStorage from entity
   */
  this.updateLocalStorageModel = function(jsonEntity) {
    var modelName = jsonEntity[ENTITY_KIND_PROPERTY_NAME];
    var entityKey = jsonEntity[ENTITY_KEY_PROPERTY_NAME];
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    for (var i = 0; i < entities.length; i++) {
      if (entities[i][ENTITY_KEY_PROPERTY_NAME] == entityKey) {
        entities[i] = jsonEntity;
      }
    }
    var entitiesString = JSON.stringify(entities);
    this.buildTableFromJsonString(entitiesString);
    this.storeDatas(modelName, entitiesString);
  }
  
  
  /**
   * Builds the table on the DOM.
   * @param dataJso {JSON}
   */
  this.buildTable = function(dataJson) {
    var dataJsonString = JSON.stringify(dataJson);
    this.buildTableFromJsonString(dataJsonString);
  }


  /**
   * @param dataJsonString {String}
   */
  this.buildTableFromJsonString = function(dataJsonString) {
    var table = new Table();
    table.init("#content", $.parseJSON(dataJsonString));
    this.storeDatas(MODEL_NAME, dataJsonString);
  }


  /**
   * @param modelName {String}
   * @param dataJsonString {String}
   */
  this.storeDatas = function(modelName, dataJsonString) {
    localStorage["allDatas" + modelName] = dataJsonString;
  }

  
  /**
   * @param  {String} modelName The model we want.
   * @return {String} all datas as json string.
   */
  this.getStringEntititesFromLocalStorage = function(modelName) {
    return localStorage["allDatas" + MODEL_NAME];
  }
  
  
  /**
   * @param  {String} modelName The model we want.
   * @return {String} all entities as JSON.
   */
  this.getJSONEntitiesFromLocalStorage = function(modelName) {
    return $.parseJSON(this.getStringEntititesFromLocalStorage(modelName));
  }
  
  
  /**
   * Loads all Datas.
   */
  this.loadDatas = function() {
    var allDatas = this.getStringEntititesFromLocalStorage(MODEL_NAME);
    allDatas = undefined;
    if (allDatas) {
      this.buildTableFromJsonString(allDatas);
    } else {
      $.get("getEntities?EntityName=" + MODEL_NAME,
          this.buildTableFromJsonString.bind(this));
    }
  }
  
  
  
  
})