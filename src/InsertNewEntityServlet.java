import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.tdebroc.utilities.ChangesEntityManager;

public class InsertNewEntityServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
 
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    String entityJsonString = req.getParameter("jsonEntity");
    
    JsonParser jsonParser = new JsonParser();
    JsonObject entityJson = (JsonObject) jsonParser.parse(entityJsonString);
    JsonObject response =
        ChangesEntityManager.insertEntityFromJson(entityJson);

    resp.setContentType("application/json");
    resp.getWriter().println(response != null ? response
        : "Error While updating");
  }
}
