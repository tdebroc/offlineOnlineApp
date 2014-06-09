package com.tdebroc.utilities;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class ChangesEntityManager {
  
  /**
   * Record the change in the table of Changes.
   * @param entityJson {JsonObject}
   * @return {Long} Current version of database.
   */
  public static Long recordChange(JsonObject entityJson, String changeType) {
    Date date = new Date();
    long timeStampDBVersion = date.getTime();
    Entity entityChange = new Entity("Changes");
    entityChange.setProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME, 
        timeStampDBVersion);
    entityChange.setProperty("entityJson", entityJson.toString());
    entityChange.setProperty("changeType", changeType);
    entityChange.setProperty("entityKind",
        entityJson.get(EntityConstant.ENTITY_KIND_PROPERTY_NAME).getAsString());
    
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
  
  

}
