import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

public class GetEntityServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
	    String entityKey = req.getParameter("EntityKey");
	    entityKey = entityKey.replaceAll("=", "");
	    Key key = KeyFactory.stringToKey(entityKey);
	    
	    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	    Entity entity;
	    resp.setContentType("text/plain");
		try {
			entity = datastore.get(key); 
	        resp.getWriter().println(entity);
		} catch (EntityNotFoundException e) {
			resp.getWriter().println("Error while fecthing key !");
			e.printStackTrace();
		}
	    
	   
  }
}
