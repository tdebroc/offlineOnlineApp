import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.tdebroc.utilities.EntityConstant;
import com.tdebroc.utilities.JsonUtilities;
public class UpdateEntityServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
      String entityJsonString = req.getParameter("entityJson");
      
      JsonParser jsonParser = new JsonParser();
      JsonObject entityJson = (JsonObject) jsonParser.parse(entityJsonString);
      long timeStampDBVersion = JsonUtilities.updateEntityFromJson(entityJson);

      JsonObject response = new JsonObject();
      response.addProperty(
          EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME, timeStampDBVersion);
      resp.setContentType("application/json");
      resp.getWriter().println(timeStampDBVersion != -1 ? response
          : "Error While updating");
  }
}
