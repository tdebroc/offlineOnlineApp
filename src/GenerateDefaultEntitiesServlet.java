import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

public class GenerateDefaultEntitiesServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
  
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {
	    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	    
	    Entity entityProperty = new Entity("EntityProperty");
	    entityProperty.setProperty("EntityName", "Order");
	    entityProperty.setProperty("propertyName", "date");
	    entityProperty.setProperty("type", "Date");
	    datastore.put(entityProperty);
	    
	    entityProperty = new Entity("EntityProperty");
	    entityProperty.setProperty("EntityName", "Order");
	    entityProperty.setProperty("propertyName", "date");
	    entityProperty.setProperty("type", "Date");
	    datastore.put(entityProperty);
	    
	    entityProperty = new Entity("EntityProperty");
	    entityProperty.setProperty("EntityName", "Order");
	    entityProperty.setProperty("propertyName", "price");
	    entityProperty.setProperty("type", "Number");
	    entityProperty.setProperty("maxValue", 10000);
	    entityProperty.setProperty("minValue", 500);
	    datastore.put(entityProperty);
	    
	    entityProperty = new Entity("EntityProperty");
	    entityProperty.setProperty("EntityName", "Order");
	    entityProperty.setProperty("propertyName", "client");
	    entityProperty.setProperty("type", "String");
	    datastore.put(entityProperty);
	    
	    entityProperty = new Entity("EntityProperty");
	    entityProperty.setProperty("EntityName", "Order");
	    entityProperty.setProperty("propertyName", "productCount");
	    entityProperty.setProperty("type", "Number");
	    entityProperty.setProperty("maxValue", 10);
	    entityProperty.setProperty("minValue", 1);
	    datastore.put(entityProperty);	    
	    
	    resp.setContentType("text/plain");
        resp.getWriter().println("Default entities Generated");
  }
}
