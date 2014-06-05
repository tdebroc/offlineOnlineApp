package com.tdebroc.utilities;

import java.util.Iterator;
import java.util.Map;

import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.JsonObject;

public class Utilities {
	public final static String ENTITY_KIND_PROPERTY_NAME = "EntityKind";
  
	public static String entityToJsonString(Entity entity) {
		return entityToJson(entity).toString();
	}

	
	public static JsonObject entityToJson(Entity entity) {
		Map<String, Object> properties = entity.getProperties();
		
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("EntityKind", entity.getKind());
		jsonObject.addProperty("key", KeyFactory.keyToString(entity.getKey()));
		
		Iterator<String> iterator = properties.keySet().iterator();
		while (iterator.hasNext()) {
			String key = iterator.next();
			jsonObject.addProperty(key, properties.get(key).toString());
		}
		return jsonObject;
	}

}