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


public class DeleteAllEntitiesServlet extends HttpServlet {
  /**
   * 
   */
  private static final long serialVersionUID = 1L;

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    String entityKind = req.getParameter("entityKind");
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query q = new Query(entityKind);
    PreparedQuery pq = datastore.prepare(q);  
    
    
    for (Entity result : pq.asIterable()) {
      datastore.delete(result.getKey());
    }
    resp.setContentType("text/plain");
      resp.getWriter().println("Entities Deleted");
  }
}
