import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.tdebroc.utilities.JsonUtilities;
import com.tdebroc.utilities.NameGenerator;

public class GenerateRandomEntityServlet extends HttpServlet {

  private static final long serialVersionUID = 1L;

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
    String entityName = req.getParameter("entityName");

    Entity newRandomEntity = generateRandomEntity(entityName);
    resp.setContentType("text/plain");
    resp.getWriter().println(JsonUtilities.entityToJsonString(newRandomEntity));
  }


  /**
   * Generates a random entity for a specified entity kind.
   */
  public static Entity generateRandomEntity(String entityKind) {
    Entity newRandomEntity = new Entity(entityKind);

    Filter entityNameFilter = new FilterPredicate("EntityName",
        FilterOperator.EQUAL, entityKind);

    Query q = new Query("EntityProperty").setFilter(entityNameFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery pq = datastore.prepare(q);

    for (Entity entityProperty : pq.asIterable()) {
      Object value;
      String type = (String) entityProperty.getProperty("type");
      if (type.toLowerCase().equals("string")) {
        value = (new NameGenerator()).getName();
      } else if (type.equals("Number")) {
        long min = (long) entityProperty.getProperty("minValue");
        long max = (long) entityProperty.getProperty("maxValue");
        value = Math.round(Math.random() * (max - min) + min);
      } else if (type.equals("Date")) {
        value = (new Date());
      } else {
        value = "undefinedType";
      }
      newRandomEntity.setProperty(
          (String) entityProperty.getProperty("propertyName"), value);
    }

    datastore.put(newRandomEntity);
    return newRandomEntity;
  }
}
