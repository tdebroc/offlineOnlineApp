import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.tdebroc.utilities.ChangesEntityManager;

public class CheckSynchronizationServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    long timestamp = Long.parseLong(req.getParameter("timestamp"));
    String entityKind = req.getParameter("entityKind");
        
    JsonArray allEntities =
        ChangesEntityManager.getLastChanges(entityKind, timestamp);

    resp.setContentType("application/json");
    resp.getWriter().println(allEntities);
  }
}
