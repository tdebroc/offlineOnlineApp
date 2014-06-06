
/**
 * Class managing AJAX synchronization.
 */
var DATABASE_MANAGER = new (function() {
  /* {Boolean} Whether user is online. */  
  this.isOnline = false;
  /* {Boolean} Whether database Manager should check if online. */  
  this.shouldCheckOnline = false;
  /* {Number} checkOnlineDelay. */
  var checkOnlineDelay = 2000;
  
  /**
   * Initializes Database Manager.
   */
  this.init = function() {
    this.checkOnline();
  }
  
  
  /**
   * Checks online status.
   */
  this.checkOnline = function() {
    $.ajax({'url' : "checkOnline"})
        .done(this.successIsOnline.bind(this))
        .fail(this.failIsOnline.bind(this));
    setTimeout(this.checkOnline.bind(this), checkOnlineDelay);
  }
  
  
  /**
   * Handles success on is online request.
   */
  this.successIsOnline = function() {
    this.shouldCheckOnline = false;
    this.changeOnlineStatus(true);
    this.launchOfflineWaitingListSynchronization();
  }
  
  
  /**
   * Handles failure on is online request.
   */
  this.failIsOnline = function() {
    this.changeOnlineStatus(false);
  }

  
  /**
   * Updates Entity from a JSON.
   * @param {JSON} jsonEntity
   */
  this.updateEntity = function(jsonEntity) {
    $.ajax({
      'url' : "updateEntity?entityJson=" + JSON.stringify(jsonEntity)
    })
    .done(this.successUpdateEntity.bind(this))
    .fail(
      (function(scope, firstParam) {
        return function() {
          scope.failUpdateEntity(firstParam)
        }
      }) (this, jsonEntity)
    );
    this.updateLocalStorageModel(jsonEntity);
  }
  
  
  /**
   * Callback for the update entity ajax call.
   */
  this.successUpdateEntity = function() {
    console.log("update entity is a success");
  }
  
  
  /**
   * Callback for the update entity ajax call.
   */
  this.failUpdateEntity = function(jsonEntity) {
    console.log("addToOfflineWaitingList" + jsonEntity);
    this.addToOfflineWaitingList(jsonEntity);
    this.changeOnlineStatus(false);
  }
  
  
  /**
   * Called when the user got offline.
   */
  this.changeOnlineStatus = function(isOnline) {
    if (isOnline) {
      $('#onLineStatus').css('background-color', 'green');
      $('#onLineStatus').text("online");
      this.shouldCheckOnline = false;
    } else {
      $('#onLineStatus').css('background-color', 'red');
      $('#onLineStatus').text("offline");
      this.shouldCheckOnline = true;
    }
  }
  
  
  
  /**
   * @param {JSON} jsonEntity
   */
  this.addToOfflineWaitingList = function(jsonEntity) {
    var modelName = jsonEntity[ENTITY_KIND_PROPERTY_NAME];
    var offlineWaitingList = this.getOfflineWaitingList(modelName);
    offlineWaitingList.push(jsonEntity);
    localStorage["offlineWaitingList" + modelName] =
        JSON.stringify(offlineWaitingList);
    this.updateSynchLogo();
  }
  
  
  /**
   * @param {JSON} jsonEntity
   * @return {String} jsonEntity
   */
  this.getOfflineWaitingList = function(modelName) {
    var offlineWaitingList = localStorage["offlineWaitingList" + modelName];
    if (offlineWaitingList) {
      return JSON.parse(offlineWaitingList);
    } else {
      return [];
    }
  }
  
  /**
   * Updates status of synch logo.
   */
  this.updateSynchLogo = function() {
    var offlineWaitingList = localStorage["offlineWaitingList" + MODEL_NAME];
    if (!offlineWaitingList || offlineWaitingList.length == 0) {
      $('#synchronizedLogo').css('background-color', 'green');
      $('#synchronizedLogo').html("Synchronized online");
    } else {
      $('#synchronizedLogo').css('background-color', 'red');
      $('#synchronizedLogo').html("Not Synchronized");
    }
  }
  
  
  /**
   * Launches a synchronization while retrieving the network.
   */
  this.launchOfflineWaitingListSynchronization = function() {
    // TODO() : parses all local Storage key to look all offlineWainting list. 
    var offlineWaitingList = localStorage["offlineWaitingList" + MODEL_NAME];
    if (!offlineWaitingList || offlineWaitingList.length == 0) {
      return;
    }
    // TODO Should be a POST, verify everywhere else!!!
    $.get("updateEntities?entitiesJson=" + offlineWaitingList,
        this.callbackWaitingListSynchronization.bind(this));
  }
  
  
  /**
   * Launches a synchronization while retrieving the network.
   */
  this.callbackWaitingListSynchronization = function() {
    console.log("offlineWaitingList updateEntities Done");
    localStorage["offlineWaitingList" + MODEL_NAME] = [];
    this.updateSynchLogo();
  }
  
  
  /**
   * Updates localStorage from entity
   * @param {JSON} jsonEntity
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
      this.changeOnlineStatus(true);
    } else {
      $.ajax({
        url: "getEntities?EntityName=" + MODEL_NAME,
      })
      .done(this.buildTableFromJsonString.bind(this))
    }
    this.updateSynchLogo();
  }

  this.init();
})