import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.tdebroc.utilities.ChangesEntityManager;
import com.tdebroc.utilities.EntityConstant;
import com.tdebroc.utilities.JsonUtilities;


public class GetAllEntityNamesServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
		      throws IOException, ServletException {
		Query q = new Query("EntityProperty");
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		PreparedQuery pq = datastore.prepare(q);  
		JsonArray allEntities = returnUniqueArray(pq);
	   
	    long timestamp = ChangesEntityManager.getLastTimestamp("EntityProperty");
	    JsonObject response = new JsonObject();
	    response.addProperty(
	        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME, timestamp);
	    response.add("entities", allEntities);
	       
	    resp.setContentType("application/json");
	    resp.getWriter().println(response);
	}
	
	public static JsonArray returnUniqueArray(PreparedQuery pq){
		JsonArray allEntities = new JsonArray();
	    Set<String> allUniqueEntities = new HashSet<String>();
		 for (Entity result : pq.asIterable()) {
		     if( allUniqueEntities.add((String) result.getProperty("EntityName"))){
		    	 allEntities.add(JsonUtilities.entityToJson(result));
		     }
		    }
		 return allEntities;
	}

}
