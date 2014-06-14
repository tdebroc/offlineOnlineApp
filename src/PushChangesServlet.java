import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.tdebroc.utilities.ChangesEntityManager;

public class PushChangesServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    String changesJsonString = req.getParameter("changes");
    
    JsonParser jsonParser = new JsonParser();
    JsonElement changesJson = (JsonElement) jsonParser.parse(changesJsonString);

    if (!changesJson.isJsonArray()) {
      resp.getWriter().println("Json should be an array");
      return;
    }

    JsonArray entitiesJsonArray = changesJson.getAsJsonArray();
    JsonObject response =
        ChangesEntityManager.pushChangesJson(entitiesJsonArray);

    resp.setContentType("application/json");
    resp.getWriter().println(response);
  }
}
