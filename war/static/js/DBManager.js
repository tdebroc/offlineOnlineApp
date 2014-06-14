
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


//=============================================================================
// Synchronization Management.
//=============================================================================    
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
    var allUpdateChanges = [];
    var allRemoveChanges = [];
    var allInsertChanges = [];
    for (var i = 0; i < changesDatas.length; i++) {
      var change = changesDatas[i];
      if (change['changeType'] == "update") {
        allUpdateChanges.push(
            JSON.parse(change["entityJson"]));
      } else if (change['changeType'] == "delete") {
        allRemoveChanges.push(
            JSON.parse(change["entityJson"]));
      } else if (change['changeType'] == "insert") {
        allInsertChanges.push(
            JSON.parse(change["entityJson"]));
      }
      this.setTimeStampDBVersion(MODEL_NAME,
          change[ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME])
    }
    // TODO: Merge 3 following methods for better perfs.
    this.updateLocalDBWithArray(allUpdateChanges);
    this.applyRemoveChangesLocalDBWithArray(allRemoveChanges);
    this.insertEntityArrayLocalDB(allInsertChanges);
  }
  
  
  /**
   * Handles failure on is online request.
   */
  this.checkSynchronizationFailure = function() {
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
  this.addUpdateToOfflineWaitingList = function(jsonEntity) {
    var isAnInsertedEntity =
        this.verifyIfInsertedEntity(jsonEntity);
    if (isAnInsertedEntity) {
      return;
    }
    var modelName = jsonEntity[ENTITY_KIND_PROPERTY_NAME];
    var offlineWaitingList = this.getOfflineWaitingList(modelName);
    var change = {};
    change['changeType'] = "update";
    change['entityJson'] = jsonEntity;
    change[ENTITY_KIND_PROPERTY_NAME] = modelName;
    offlineWaitingList.push(change);
    this.setOfflineWaitingList(modelName, offlineWaitingList);
    this.updateSynchLogo();
  }


  /**
   * Verifies if the entity has been inserted in waiting list.
   * @param {JSON} jsonEntity
   */
  this.verifyIfInsertedEntity = function(jsonEntity) {
    var modelName = jsonEntity[ENTITY_KIND_PROPERTY_NAME];
    var offlineWaitingList = this.getOfflineWaitingList(modelName);
    var wasInserted = false;
    for (var i = 0; i < offlineWaitingList.length; i++) {
      if (offlineWaitingList[i]['entityJson'][ENTITY_KEY_PROPERTY_NAME] ==
          jsonEntity[ENTITY_KEY_PROPERTY_NAME]) {
        offlineWaitingList[i]['entityJson'] = jsonEntity;
        wasInserted = true;
      }
    }
    this.setOfflineWaitingList(modelName, offlineWaitingList);
    return wasInserted;
  }


  /**
   * @param {String} modelName
   * @return {String} jsonChanges
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
   * @param {String} modelName
   * @return {JSON} jsonChanges
   */
  this.setOfflineWaitingList = function(modelName, jsonChanges) {
    localStorage["offlineWaitingList" + modelName] =
        JSON.stringify(jsonChanges);
  }
  
  
  /**
   * Updates status of synch logo.
   */
  this.updateSynchLogo = function() {
    var offlineWaitingList = this.getOfflineWaitingList(MODEL_NAME);
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
    var offlineWaitingList =
        this.getOfflineWaitingList(MODEL_NAME);
    if (!offlineWaitingList || offlineWaitingList.length == 0) {
      return;
    }
    // TODO Should be a POST, verify everywhere else!!!
    $.get("pushChanges?changes=" + JSON.stringify(offlineWaitingList))
        .done(this.callbackWaitingListSynchronization.bind(this))
        .fail(function(data) {console.log(data)});
  }
  
  
  /**
   * Launches a synchronization while retrieving the network.
   * @param {JSON} data Answer from update Entities callback.
   */
  this.callbackWaitingListSynchronization = function(data) {
    this.setTimeStampDBVersion(data['timeStampDBVersion']);
    this.updateTemporaryKeyArray(data['tempKeyToUpdateArray'])
    this.setOfflineWaitingList(MODEL_NAME, []);
    this.updateSynchLogo();
    console.log("offlineWaitingList updateEntities Done");
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
  
  
  
//=============================================================================
// Update Management.  
//=============================================================================  
  /**
   * Updates Entity from a JSON.
   * @param {JSON} jsonEntity
   */
  this.updateEntity = function(jsonEntity) {
    $.ajax({
      'url' : "updateEntity?entityJson=" + JSON.stringify(jsonEntity)
    })
    .done(this.successUpdateEntity.bind(this))
    .fail(this.failUpdateEntity.bindWithParams(this, [jsonEntity])
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
    console.log("addUpdateToOfflineWaitingList" + jsonEntity);
    this.addUpdateToOfflineWaitingList(jsonEntity);
    this.changeOnlineStatus(false);
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
    if (jsonEntities.length == 0) {
      return;
    }
    var modelName = jsonEntities[0][ENTITY_KIND_PROPERTY_NAME];
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    // TODO: Improves perfs here by an hashmap containing lines to udpate.
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
  

//=============================================================================
// Random Generation Management.
//=============================================================================
  /**
   * Generates a random entity in backend and launches full synch.
   */
  this.generateRandomEntity = function() {
    $.get('/generateRandomEntity?entityName=' + MODEL_NAME)
        .done(this.successGenerateRandomEntity.bind(this))
        .fail(this.failGenerateRandomEntity.bind(this));
  }
  

  /**
   * Callback for a success when generating a new random entity.
   */
  this.successGenerateRandomEntity = function() {
    this.reloadDatas();
  }
  
  
  /**
   * Callback for a failure when generating a new random entity.
   */
  this.failGenerateRandomEntity = function() {
    alert("To generate a random entity, you need to be online.");
  }

  
//=============================================================================
// Insert Management.  
//=============================================================================
  /**
   * @param modelName {String}
   */
  this.getUniqueTemporaryKeyIndex = function(modelName) {
    var temporaryKeyIndex = localStorage["temporaryKeyIndex-" + modelName];
    temporaryKeyIndex = temporaryKeyIndex ? temporaryKeyIndex : 0;
    localStorage["temporaryKeyIndex-" + modelName] =
        parseInt(temporaryKeyIndex) + 1;
    return temporaryKeyIndex;
  }

  
  /**
   * @param modelName {String}
   * @param modelName {Number} The new Value of temporary Key;
   */
  this.setUniqueTemporaryKeyIndex = function(modelName, value) {
    localStorage["temporaryKeyIndex-" + modelName] = value;
  }
  
  
  /**
   * Inserts new Entity.
   * @param {JSON} jsonEntity
   */
  this.insertEntity = function(jsonEntity) {
    this.insertOneEntityInLocalDB(jsonEntity);
    $.get("/insertEntity?jsonEntity=" + JSON.stringify(jsonEntity))
        .done(this.successInsertEntity.bind(this))
        .fail(this.failInsertEntity.bindWithParams(this, [jsonEntity]));
  }
  
  
  /**
   * @param {JSON} jsonEntity Answer from update Entities callback.
   */
  this.insertOneEntityInLocalDB = function(jsonEntity) {
    var allInsertArray = [jsonEntity];
    this.insertEntityArrayLocalDB(allInsertArray);
  }
  
  
  /**
   * Updates localStorage from entity
   * @param {JsonArray} jsonEntities
   */
  this.insertEntityArrayLocalDB = function(jsonEntitiesArray) {
    if (jsonEntitiesArray.length == 0) {
      return;
    }
    var modelName = jsonEntitiesArray[0][ENTITY_KIND_PROPERTY_NAME];
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    jsonEntitiesArray = this.removeExistingEntities(entities, jsonEntitiesArray);
    for (var i = 0; i < jsonEntitiesArray.length; i++) {
        entities.push(jsonEntitiesArray[i]);
    }
    this.buildTableFromJson(entities);
    this.storeDatas(modelName, entities);
  }

  
  /**
   * When inserting new entity in local DB, we don't want to to insert
   *     duplicates. So we remove already existing entities if there is some.
   */
  this.removeExistingEntities = function(entities, jsonEntitiesArray) {
    var keysToadd = {};
    for (var i = 0; i < jsonEntitiesArray.length; i++) {
      var key = jsonEntitiesArray[i][ENTITY_KEY_PROPERTY_NAME];
      keysToadd[key] = jsonEntitiesArray[i];
    }
    for (var i = 0; i < entities.length; i++) {
      if (keysToadd[entities[i][ENTITY_KEY_PROPERTY_NAME]]) {
        delete keysToadd[entities[i][ENTITY_KEY_PROPERTY_NAME]];
      }
    }
    var jsonKeys = Object.keys(keysToadd)
    jsonEntitiesArrayFiltered = [];
    for (var i = 0; i < jsonKeys.length; i++) {
      jsonEntitiesArrayFiltered.push(keysToadd[jsonKeys[i]]);
    }
    return jsonEntitiesArrayFiltered;
  }
  
  
  /**
   * Success callback after inserting a new Entity.
   */
  this.successInsertEntity = function(data) {
    this.setTimeStampDBVersion(data['timeStampDBVersion']);
    this.updateTemporaryKeyArray([data["tempKeyToUpdate"]]);
    console.log("success insert");
  }


  /**
   * Updates temporary keys with real keys after inserting new Entity in the
   *     datastore.
   */
  this.updateTemporaryKeyArray = function(keyToUpdateArray) {
    var modelName = MODEL_NAME;
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    for (var j = 0; j < keyToUpdateArray.length; j++) {
      var keyToUpdate = keyToUpdateArray[j];
      for (var i = 0, updated = false; i < entities.length && !updated; i++) {
        var jsonEntity = entities[i];
        var entityKey = jsonEntity[ENTITY_KEY_PROPERTY_NAME];
        if (keyToUpdate["temporaryKey"] == entityKey) {
          jsonEntity[ENTITY_KEY_PROPERTY_NAME] = keyToUpdate["newKey"];
          updated = true;
        }
      }
    }
    this.buildTableFromJson(entities);
    this.storeDatas(modelName, entities);    
  }


  /**
   * Fail callback after inserting a new Entity.
   * @param jsonEntity {JSON} the entity added.
   */
  this.failInsertEntity = function(jsonEntity) {
    this.addInsertToOfflineWaitingList(jsonEntity);
    this.changeOnlineStatus(false);
    console.log(jsonEntity);
  }
  
  
  /**
   * Adds an inserted entity to the offline waiting list.
   * @param jsonEntity {JSON} the entity added.
   */
  this.addInsertToOfflineWaitingList = function(jsonEntity) {
    var modelName = jsonEntity[ENTITY_KIND_PROPERTY_NAME];
    var offlineWaitingList = this.getOfflineWaitingList(modelName);
    var change = {};
    change['changeType'] = "insert";
    change['entityJson'] = jsonEntity;
    change[ENTITY_KIND_PROPERTY_NAME] = modelName;
    offlineWaitingList.push(change);
    this.setOfflineWaitingList(modelName, offlineWaitingList);
    this.updateSynchLogo();
  }
  

// =============================================================================
// Remove Management.  
// =============================================================================
  /**
   * Removes an entity.
   * @param key {String}
   */
  this.removeEntity = function(key) {
    $.ajax({'url' : "removeEntity?entityKey=" + key +
        "&entityKind=" + MODEL_NAME})
      .done(this.removeEntitySuccess.bind(this))
      .fail(this.removeEntityFailure.bindWithParams(this, [key, MODEL_NAME]));
    this.removeEntityFromLocalDB(key);
  }


  /**
   * Removes an entity from the local DB.
   */
  this.removeEntityFromLocalDB = function(key) {
    var jsonEntity = {};
    jsonEntity[ENTITY_KEY_PROPERTY_NAME] = key;
    var removeChanges = [jsonEntity];
    this.applyRemoveChangesLocalDBWithArray(removeChanges);
  }


  /**
   * Applies removes changes on local DB.
   */
  this.applyRemoveChangesLocalDBWithArray = function(removeChangeArray) {
    if (removeChangeArray.length == 0) {
      return;
    }
    var modelName = MODEL_NAME;
    var entities = this.getJSONEntitiesFromLocalStorage(modelName);
    for (var j = 0; j < removeChangeArray.length; j++) {
      var removeChange = removeChangeArray[j];
      for (var i = 0, removed = false; i < entities.length && !removed; i++) {
        var jsonEntity = entities[i];
        var entityKey = jsonEntity[ENTITY_KEY_PROPERTY_NAME];
        if (removeChange[ENTITY_KEY_PROPERTY_NAME] == entityKey) {
          entities.splice(i, 1);
          removed = true;
        }
      }
    }
    this.buildTableFromJson(entities);
    this.storeDatas(modelName, entities);
  }


  /**
   * Callback for a Success when removing an entity from the datastore.
   * @param {JSON} Response from the service.
   */
  this.removeEntitySuccess = function(data) {
    this.setTimeStampDBVersion(data['timeStampDBVersion']);
    console.log("remove entity is a success");
  }
  
  
  /**
   * Callback for a failure after the remove entity call.
   * @param {String} key The key of the entity we want to remove.
   * @param {String} modelName Name of the model from which we want to remove
   *     the entity.
   */
  this.removeEntityFailure = function(key, modelName) {
    console.log("addRemoveToOfflineWaitingList entity : " + key);
    this.addRemoveToOfflineWaitingList(key, modelName);
    this.changeOnlineStatus(false);
  }
  
  
  /**
   * @param {String} key The key of the entity we want to remove.
   * @param {String} modelName Name of the model from which we want to remove
   *     the entity.
   */
  this.addRemoveToOfflineWaitingList = function(key, modelName) {
    var offlineWaitingList = this.getOfflineWaitingList(modelName);
    var jsonEntity = {};
    jsonEntity[ENTITY_KEY_PROPERTY_NAME] = key;
    var change = {};
    change['changeType'] = "delete";
    change['entityJson'] = jsonEntity;
    change[ENTITY_KIND_PROPERTY_NAME] = modelName;
    offlineWaitingList.push(change);
    this.setOfflineWaitingList(modelName, offlineWaitingList);
    this.updateSynchLogo();
  }


//=============================================================================
// All datas Management.  
//=============================================================================
  /**
   * @param dataJson {JSON}
   */
  this.buildTableFromJson = function(dataJson) {
    var table = new Table();
    table.dbManager = this;
    var tableSelector = "#tableContainer";
    if (dataJson.length == 0) {
      $(tableSelector).html("Table is empty. No entities.");
    } else {
      table.init(tableSelector, dataJson);
    }
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

  this.init();
}