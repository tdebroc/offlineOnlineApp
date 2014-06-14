package com.tdebroc.utilities;

import java.util.Arrays;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class ChangesEntityManager {
  
  /**
   * Record the change in the table of Changes.
   * @param entityJson {JsonObject}
   * @param changeType {String} The type of the change (delete | update | insert)
   * @return {Long} Current version of database.
   */
  public static Long recordChange(JsonObject entityJson, String changeType) {
    return recordChange(entityJson, changeType,
        entityJson.get(EntityConstant.ENTITY_KIND_PROPERTY_NAME).getAsString());
  }
  
  
  /**
   * Record the change in the table of Changes.
   * @param entityJson {JsonObject}
   * @param changeType {String} The type of the change (delete | update | insert)
   * @return {Long} Current version of database.
   */
  public static long recordChange(JsonObject entityJson, String changeType,
      String entityKind) {
    Date date = new Date();
    long timeStampDBVersion = date.getTime();
    Entity entityChange = new Entity("Changes");
    entityChange.setProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME, 
        timeStampDBVersion);
    entityChange.setProperty("entityJson", entityJson.toString());
    entityChange.setProperty("changeType", changeType);
    entityChange.setProperty("entityKind", entityKind);
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(entityChange);
    return timeStampDBVersion;
  }
  
  
  /**
   * @param entityName {String}
   * @return {Long}
   */
  public static long getLastTimestamp(String entityName) {
    Query lastChangeQuery = new Query("Changes")
    .setFilter(new FilterPredicate("entityKind",
        Query.FilterOperator.EQUAL,
        entityName))
    .addSort(EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery pqChanges = datastore.prepare(lastChangeQuery);
    List<Entity> changesEntities =
       pqChanges.asList(FetchOptions.Builder.withLimit(1));
    
    long timestamp = -1;
    if (changesEntities.size() > 0) {
     timestamp = (long) changesEntities.get(0).getProperty(
         EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME);
    }
    return timestamp;
  }
  
  
  /**
   * 
   * @param entityKind {String} The entityKind from which we want last changes.
   * @param timestamp {} The version from which we want changes to start being
   *     loaded.
   * @return {JsonArray} an Iterator on entities changes.
   */
  public static JsonArray getLastChanges(String entityKind, long timestamp) {
    Filter timeStampFilter = new FilterPredicate(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        FilterOperator.GREATER_THAN,
        timestamp);
    Filter entityKindFilter = new FilterPredicate(
        "entityKind",
        FilterOperator.EQUAL,
        entityKind);
    
    List<Filter> filters =
        Arrays.<Filter>asList(timeStampFilter, entityKindFilter);
    
    Query q = new Query("Changes").
        setFilter(new CompositeFilter(CompositeFilterOperator.AND, filters))
        .addSort(EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
            SortDirection.ASCENDING);
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery pq = datastore.prepare(q);

    Iterable<Entity> lastChanges = pq.asIterable();
    JsonArray allChangesEntities = new JsonArray();
    for (Entity result : lastChanges) {
      allChangesEntities.add(JsonUtilities.entityToJson(result));
    }
    
    return allChangesEntities;
  }


  /**
   * Removes an entity from the datastore.
   */
  public static long removeEntity(String entityKey, String entityKind) {
    Key key = KeyFactory.stringToKey(entityKey);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    JsonObject jsonEntity = new JsonObject();
    jsonEntity.addProperty(EntityConstant.ENTITY_KEY_PROPERTY_NAME, entityKey);
    datastore.delete(key);
    return ChangesEntityManager.recordChange(jsonEntity, "delete", entityKind);
  }

  
  /**
   * Inserts an entity in the datastore.
   * @param entityJson The jsonObject containing properties for new entity to
   *     insert.
   */
  public static JsonObject insertEntityFromJson(JsonObject entityJson) {
    String tempEntityKey =
        entityJson.get(EntityConstant.ENTITY_KEY_PROPERTY_NAME).getAsString();
    String entityKind =
        entityJson.get(EntityConstant.ENTITY_KIND_PROPERTY_NAME).getAsString();
    
    Entity insertedEntity = new Entity(entityKind);
    Set<String> invisiblesKeys = JsonUtilities.getInvisibleKeys();
    
    for (Map.Entry<String,JsonElement> entry : entityJson.entrySet()) {
      String propertyName = entry.getKey();
      if (!invisiblesKeys.contains(propertyName)) {
        insertedEntity.setProperty(propertyName, entry.getValue().getAsString());
      }
    }
    
    long timeStampDBVersion = insertEntity(insertedEntity);
    
    JsonObject response = new JsonObject();
    response.addProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        timeStampDBVersion);
    JsonObject tempKeyToUpdate = new JsonObject();
    tempKeyToUpdate.addProperty("temporaryKey", tempEntityKey);
    String newKey = KeyFactory.keyToString(insertedEntity.getKey());
    tempKeyToUpdate.addProperty("newKey", newKey);
    response.add("tempKeyToUpdate", tempKeyToUpdate);
    
    return response;
  }
  
  
  /**
   * Inserts an entity in from the datastore.
   * @param entity The entity to insert.
   */
  public static long insertEntity(Entity entity) {
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(entity);
    long timeStamp = recordChange(JsonUtilities.entityToJson(entity),
        "insert", entity.getKind());
    return timeStamp;
  }
  
  
  /**
   * Updates a datastore entity from it's JSON.
   * @param entityJson
   * @return {Boolean} Whether the update had worked or not.
   */
  public static long updateEntityFromJson(JsonObject entityJson) {
    String keyString = entityJson.get(EntityConstant.ENTITY_KEY_PROPERTY_NAME).getAsString();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Key key = KeyFactory.stringToKey(keyString);
    try {
      Entity entity = datastore.get(key);
      Set<String> invisiblesKeys = JsonUtilities.getInvisibleKeys();
      for (Map.Entry<String,JsonElement> entry : entityJson.entrySet()) {
        String propertyName = entry.getKey();
        if (!invisiblesKeys.contains(propertyName)) {
          entity.setProperty(propertyName, entry.getValue().getAsString());
        }
      }
      datastore.put(entity);

      return ChangesEntityManager.recordChange(entityJson, "update");
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      return -1;
    }
  }
  
  
  /**
   * Updates several datastore entities from a JSON array containing them.
   * @param entitiesJsonArray {JsonArray}
   * @return {Boolean} Whether the update had worked or not.
   */
  public static Long updateEntitiesFromJson(JsonArray entitiesJsonArray) {
    Iterator<JsonElement> entititiesIterator = entitiesJsonArray.iterator();
    long timeStamp = -1;
    while (entititiesIterator.hasNext()) {
      JsonElement jsonElement = entititiesIterator.next();
      timeStamp = updateEntityFromJson(jsonElement.getAsJsonObject());
    }
    return timeStamp;
  }
  
  
  /**
   * Pushes changes to server.
   * @return
   */
  public static JsonObject pushChangesJson(JsonArray changes) {
    long timeStampDBVersion = -1;
    JsonObject response = new JsonObject();
    response.add("tempKeyToUpdateArray", new JsonArray());
    for (JsonElement change : changes) {
      JsonObject changeObject = change.getAsJsonObject();
      switch (changeObject.get("changeType").getAsString()) {
        case "update": {
          timeStampDBVersion =
              updateEntityFromJson(
                  changeObject.get("entityJson").getAsJsonObject());
          break;
        }
        case "delete" : {
          timeStampDBVersion =
              updateEntityFromJson(
                  changeObject.get("entityJson").getAsJsonObject());
          break;
        }
        case "insert" : {
          JsonObject responseInsert =
              insertEntityFromJson(
                  changeObject.get("entityJson").getAsJsonObject());
          timeStampDBVersion =
              responseInsert.get(
                  EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME)
              .getAsLong();
          response.get("tempKeyToUpdateArray").getAsJsonArray().
              add(responseInsert.get("tempKeyToUpdate"));
          break;
        }
        default : {
          System.out.println("Unknown changeType : " + 
              changeObject.get("changeType").getAsString());          
        };
      }
    }
    response.addProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        timeStampDBVersion);
    return response;
  }
  
  
  

}
