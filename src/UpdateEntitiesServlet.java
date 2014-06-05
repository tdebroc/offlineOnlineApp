import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.tdebroc.utilities.JsonUtilities;

public class UpdateEntitiesServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
      resp.setContentType("text/plain");
      String entityJsonString = req.getParameter("entitiesJson");
      
      JsonParser jsonParser = new JsonParser();
      JsonElement entitiesJson = (JsonElement) jsonParser.parse(entityJsonString);
      if (!entitiesJson.isJsonArray()) {
        resp.getWriter().println("Json should be an array");
        return;
      }
      JsonArray entitiesJsonArray = entitiesJson.getAsJsonArray();
      boolean hasUpdated = JsonUtilities.updateEntitiesFromJson(entitiesJsonArray);
      
      resp.getWriter().println(hasUpdated ? "Entities Updated"
          : "Error While updating");
  }
}
