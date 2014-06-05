import java.io.IOException;

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
import com.tdebroc.utilities.JsonUtilities;

public class GetEntitiesServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
	    String entityName = req.getParameter("EntityName");
	    
	    Query q = new Query(entityName);
	    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	    PreparedQuery pq = datastore.prepare(q);  
	    
	    JsonArray allEntities = new JsonArray();
	    
	    for (Entity result : pq.asIterable()) {
	      allEntities.add(JsonUtilities.entityToJson(result));
	    }
	    
	    resp.setContentType("text/plain");
        resp.getWriter().println(allEntities);
  }
}
