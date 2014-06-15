package com.tdebroc.utilities;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

public class JsonUtilities {
  
	/* Set containing all keys invisible for user. */
	private static Set<String> invisibleKeys;

	
	/**
   * @return Set<String> Set containing all invisible keys.
	 */
	public static Set<String> getInvisibleKeys() {
	  if (invisibleKeys == null) {
	    invisibleKeys = new HashSet<String>();
	    invisibleKeys.add(EntityConstant.ENTITY_KEY_PROPERTY_NAME);
	    invisibleKeys.add(EntityConstant.ENTITY_KIND_PROPERTY_NAME);
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
		jsonObject.addProperty(EntityConstant.ENTITY_KIND_PROPERTY_NAME, entity.getKind());
		jsonObject.addProperty("key", KeyFactory.keyToString(entity.getKey()));
		
		Iterator<String> iterator = properties.keySet().iterator();
		while (iterator.hasNext()) {
			String key = iterator.next();
			jsonObject.addProperty(key, properties.get(key).toString());
		}
		return jsonObject;
	}
	
	 /**
		 * Parses the Query, and return a Json array with each different
		 * EntityName only once.
		 * 
		 * @param {PreparedQuery} Elements containing rows to convert into a JsonArray
		 * @return {JSONArray} Contains the Json to return
		 */
		public static JsonArray returnJsonArrayFromQuery(PreparedQuery pq) {
			JsonArray allEntities = new JsonArray();
			for (Entity result : pq.asIterable()) {
					allEntities.add(JsonUtilities.entityToJson(result));
				}
			return allEntities;
		}
}