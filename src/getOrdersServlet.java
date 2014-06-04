import java.io.IOException;
import java.util.Date;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.tdebroc.utilities.NameGenerator;

public class getOrdersServlet extends HttpServlet {
  
  private static final long serialVersionUID = 1L;
  private int minPrice = 500;
  private int maxPrice = 10000;
  private int maxProductCount = 10;
  
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws IOException, ServletException {

	    Entity order = new Entity("Order");
	    Date date = new Date();
	    order.setProperty("date", date);
	    order.setProperty("price", Math.round(Math.random() * (maxPrice - minPrice) + minPrice));
	    order.setProperty("client", (new NameGenerator()).getName());
	    order.setProperty("productCount", Math.round(Math.random() * maxProductCount + 1));

	    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
	    datastore.put(order);
	    
	    ServletContext sc = getServletContext();
	    RequestDispatcher rd = sc.getRequestDispatcher("/getOrders.jsp");
	    rd.forward(req, resp);
  }
}
