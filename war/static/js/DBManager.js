
/**
 * Class managing AJAX synchronization.
 */
function DataBaseManager(modelName) {
  /* {Boolean} Whether user is online. */  
  this.isOnline = false;
  /* {Boolean} Whether database Manager should check if online. */  
  this.shouldCheckOnline = false;
  /* {Number} checkOnlineDelay. */
  var checkOnlineDelay = 2000;
  /* {String} Name of the entity kind currently managed. */
  this.modelName = modelName;
  
  /**
   * Initializes Database Manager.
   */
  this.init = function() {
    this.checkSynchronization();
  }
  
  
  /**
   * Checks online status.
   */
  this.checkSynchronization = function() {
    $.ajax({'url' : "checkSynchronization?timestamp="
        + this.getTimeStampDBVersion(MODEL_NAME) + "&"
        + "entityKind=" + MODEL_NAME})
        .done(this.checkSynchronizationSuccess.bind(this))
        .fail(this.checkSynchronizationFailure.bind(this));
    setTimeout(this.checkSynchronization.bind(this), checkOnlineDelay);
  }
  
  
  /**
   * Handles success on is online request.
   */
  this.checkSynchronizationSuccess = function(changesDatas) {
    this.shouldCheckOnline = false;
    this.changeOnlineStatus(true);
    this.synchronizeLocalDatabase(changesDatas);
    this.launchOfflineWaitingListSynchronization();
  }
  
  /**
   * @param {JsonArray} 
   */
  this.synchronizeLocalDatabase = function(changesDatas) {
    if (changesDatas.length == 0) {
      return;
    }
    var allChanges = [];
    for (var i = 0; i < changesDatas.length; i++) {
      var change = changesDatas[i];
      allChanges.push(
          JSON.parse(change["entityJson"]));
      this.setTimeStampDBVersion(MODEL_NAME,
          change[ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME])
    }
    this.updateLocalDBWithArray(allChanges);
  }
  
  
  /**
   * Handles failure on is online request.
   */
  this.checkSynchronizationFailure = function() {
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
    this.updateLocalDBWithOneEntity(jsonEntity);
  }
  
  
  /**
   * Callback for the update entity ajax call.
   * @param {JSON} data Answer from the updateEntity service.
   */
  this.successUpdateEntity = function(data) {
    this.setTimeStampDBVersion(data['timeStampDBVersion']);
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
   * @param {JSON} data Answer from update Entities callback.
   */
  this.callbackWaitingListSynchronization = function(data) {
    this.setTimeStampDBVersion(data['timeStampDBVersion']);
    console.log("offlineWaitingList updateEntities Done");
    localStorage["offlineWaitingList" + MODEL_NAME] = [];
    this.updateSynchLogo();
  }
  
  
  /**
   * @param {JSON} jsonEntity Answer from update Entities callback.
   */
  this.updateLocalDBWithOneEntity = function(jsonEntity) {
    var allChangesArray = [jsonEntity];
    this.updateLocalDBWithArray(allChangesArray);
  }
  
  
  /**
   * Updates localStorage from entity
   * @param {JsonArray} jsonEntities
   */
  this.updateLocalDBWithArray = function(jsonEntities) {
    var modelName = jsonEntities[0][ENTITY_KIND_PROPERTY_NAME];
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    for (var i = 0; i < jsonEntities.length; i++) {
      var jsonEntity = jsonEntities[i];
      var entityKey = jsonEntity[ENTITY_KEY_PROPERTY_NAME];
      for (var i = 0; i < entities.length; i++) {
        if (entities[i][ENTITY_KEY_PROPERTY_NAME] == entityKey) {
          entities[i] = jsonEntity;
        }
      }
    }
    this.buildTableFromJson(entities);
    this.storeDatas(modelName, entities);
  }


  /**
   * @param dataJson {JSON}
   */
  this.buildTableFromJson = function(dataJson) {
    var table = new Table();
    table.init("#content", dataJson);
    this.storeDatas(MODEL_NAME, dataJson);
  }


  /**
   * @param modelName {JSON}
   */
  this.storeDatas = function(modelName, dataJson) {
    localStorage["allDatas" + modelName] = JSON.stringify(dataJson);
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
    if (allDatas) {
      this.buildTableFromJson($.parseJSON(allDatas));
      this.changeOnlineStatus(true);
    } else {
      $.ajax({
        url: "getEntities?EntityName=" + MODEL_NAME,
      })
      .done(this.callbackGetAllDatas.bind(this))
    }
    this.updateSynchLogo();
  }


  /**
   * Reloads all Datas.
   */
  this.reloadDatas = function() {
    localStorage.clear();
    this.loadDatas();
  }
  
  
  /**
   * @param {JSON} result from the service to get all Datas.
   */
  this.callbackGetAllDatas = function(data) {
    this.setTimeStampDBVersion(MODEL_NAME, data['timestampDBVersion']);
    this.buildTableFromJson(data['entities']);
  }
  
  
  /**
   * @param  {String} entityKind The entity kind from which we want the db
   *     version.
   * @return {Number} the timestamp designing the DB Version.
   */
  this.getTimeStampDBVersion = function(entityKind) {
    var timestamp = localStorage.getItem("TimestampDBVersion-" + entityKind)
    return timestamp ? timestamp : -1;
  }
  
  
  /**
   * @param  {String} entityKind The entity kind from which we want to set
   * the db version.
   * @param  {Numbre} the timestamp designing the DB Version
   */
  this.setTimeStampDBVersion = function(entityKind, timestampValue) {
    localStorage.setItem("TimestampDBVersion-" + entityKind, timestampValue)
  }
  
  
  this.init();
}