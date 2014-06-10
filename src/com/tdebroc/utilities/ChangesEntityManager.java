package com.tdebroc.utilities;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
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
   * Pushes changes to server.
   * @return
   */
  public static Long pushChangesJson(JsonArray changes) {
    long timeStampDBVersion = -1;
    for (JsonElement change : changes) {
      JsonObject changeObject = change.getAsJsonObject();
      if (changeObject.get("changeType").getAsString().equals("update")) {
        timeStampDBVersion =
            JsonUtilities.updateEntityFromJson(
                changeObject.get("entityJson").getAsJsonObject());
      } else if (changeObject.get("changeType").equals("delete")) {
        timeStampDBVersion =
            JsonUtilities.updateEntityFromJson(
                changeObject.get("entityJson").getAsJsonObject());
      }
    }
    return timeStampDBVersion;
  }
  

}
