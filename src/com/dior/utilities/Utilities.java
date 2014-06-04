package com.dior.utilities;

import java.util.Iterator;
import java.util.Map;

import com.google.appengine.api.datastore.Entity;
import com.google.gson.JsonObject;

public class Utilities {
	
	public static String entityToJson(Entity entity) {
		Map<String, Object> properties = entity.getProperties();
		
		JsonObject jsonObject = new JsonObject();
		jsonObject.addProperty("property", entity.getKind());
		
		Iterator<String> iterator = properties.keySet().iterator();
		while (iterator.hasNext()) {
			String key = iterator.next();
			jsonObject.addProperty(key, properties.get(key).toString());
		}
		
		return jsonObject.toString();
	}

}