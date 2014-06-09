
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.gson.JsonObject;
import com.tdebroc.utilities.ChangesEntityManager;
import com.tdebroc.utilities.EntityConstant;

public class RemoveEntityServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    resp.setContentType("text/plain");
    String entityKey = req.getParameter("entityKey");
    String entityKind = req.getParameter("entityKind");
    
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Key key = KeyFactory.stringToKey(entityKey);

    JsonObject jsonEntity = new JsonObject();
    jsonEntity.addProperty(EntityConstant.ENTITY_KEY_PROPERTY_NAME, entityKey);
    datastore.delete(key);
    long timeStampDBVersion = 
        ChangesEntityManager.recordChange(jsonEntity, "delete", entityKind);

    JsonObject response = new JsonObject();
    response.addProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        timeStampDBVersion);
    resp.setContentType("application/json");
    resp.getWriter().println(response);
  }
}
