
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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

    long timeStampDBVersion =
        ChangesEntityManager.removeEntity(entityKey, entityKind);
    
    JsonObject response = new JsonObject();
    response.addProperty(
        EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME,
        timeStampDBVersion);
    resp.setContentType("application/json");
    resp.getWriter().println(response);
  }
}
