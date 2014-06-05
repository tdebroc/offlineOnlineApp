import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.tdebroc.utilities.JsonUtilities;
public class UpdateEntityServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
      String entityJsonString = req.getParameter("entityJson");
      
      JsonParser jsonParser = new JsonParser();
      JsonObject entityJson = (JsonObject) jsonParser.parse(entityJsonString);
      boolean hasUpdated = JsonUtilities.updateEntityFromJson(entityJson);
      
      resp.setContentType("text/plain");
      resp.getWriter().println(hasUpdated ? "Entity Updated"
          : "Error While updating");
  }
}
