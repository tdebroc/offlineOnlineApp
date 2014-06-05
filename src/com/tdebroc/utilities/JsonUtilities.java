package com.tdebroc.utilities;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class JsonUtilities {
  /* Name of the property designing the kind of an entity. */
	public final static String ENTITY_KIND_PROPERTY_NAME = "EntityKind";
	/* Name of the property designing the key of an entity. */
	public final static String ENTITY_KEY_PROPERTY_NAME = "key";
	/* Set containing all keys invisible for user. */
	private static Set<String> invisibleKeys;

	
	/**
   * @return Set<String> Set containing all invisible keys.
	 */
	public static Set<String> getInvisibleKeys() {
	  if (invisibleKeys == null) {
	    invisibleKeys = new HashSet<String>();
	    invisibleKeys.add(ENTITY_KEY_PROPERTY_NAME);
	    invisibleKeys.add(ENTITY_KIND_PROPERTY_NAME);
	  }
	  return invisibleKeys;
	}
	
	/**
	 * @param entity The entity to convert as a JSON string.
	 * @return JSON encoded as a String.
	 */
	public static String entityToJsonString(Entity entity) {
		return entityToJson(entity).toString();
	}

	/**
	 * @param entity The datastore entity to convert.
	 * @return {String} The JSON Object representing the entity.
	 */
	public static JsonObject entityToJson(Entity entity) {
		Map<String, Object> properties = entity.getProperties();
		
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty(ENTITY_KIND_PROPERTY_NAME, entity.getKind());
		jsonObject.addProperty("key", KeyFactory.keyToString(entity.getKey()));
		
		Iterator<String> iterator = properties.keySet().iterator();
		while (iterator.hasNext()) {
			String key = iterator.next();
			jsonObject.addProperty(key, properties.get(key).toString());
		}
		return jsonObject;
	}

	/**
	 * Updates a datastore entity from it's JSON.
	 * @param entityJson
	 * @return {Boolean} Whether the update had worked or not.
	 */
	public static boolean  updateEntityFromJson(JsonObject entityJson) {
	  String keyString = entityJson.get(JsonUtilities.ENTITY_KEY_PROPERTY_NAME).getAsString();
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
      return true;
    } catch (EntityNotFoundException e) {
      e.printStackTrace();
      return false;
    }
	}

	
	/**
   * Updates several datastore entities from a JSON array containing them.
   * @param entitiesJsonArray {JsonArray}
   * @return {Boolean} Whether the update had worked or not.
   */
  public static boolean updateEntitiesFromJson(JsonArray entitiesJsonArray) {
    Iterator<JsonElement> entititiesIterator = entitiesJsonArray.iterator();
    
    while (entititiesIterator.hasNext()) {
      JsonElement jsonElement = entititiesIterator.next();
      updateEntityFromJson(jsonElement.getAsJsonObject());
    }
    return true;
  }
	
  
	
	
}