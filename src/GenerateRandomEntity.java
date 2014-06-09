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
import com.tdebroc.utilities.NameGenerator;


public class GenerateRandomEntity extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private DatastoreService datastore;
	private Entity newRandomEntity;
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		datastore = DatastoreServiceFactory.getDatastoreService();
		retrievePropertiesFromEntityKind(req.getParameter("entityName"));
		
	}
	
	public void retrievePropertiesFromEntityKind(String entityName){
		Query q = new Query("EntityProperty").addFilter("EntityName", Query.FilterOperator.EQUAL, entityName);
		PreparedQuery pq = datastore.prepare(q);
		newRandomEntity = new Entity(entityName);
		String propertyName, type;
		Long minValue, maxValue;
		String value = "";
		for(Entity res : pq.asIterable()){
			propertyName = (String) res.getProperty("propertyName");
			type = (String) res.getProperty("type");
			if (type.equals("String")){
				value = new NameGenerator().getName();
			}
			else if (type.equals("Date")){
				value = String.valueOf(new Date());
			}
			if (type.equals("Number")){
				minValue = (Long) res.getProperty("minValue") ;
				maxValue = (Long) res.getProperty("maxValue");
				if (minValue!=null && maxValue!= null){
					value =  String.valueOf(Math.round(Math.random()*(maxValue - minValue) + minValue));
				}
			}
			newRandomEntity.setProperty(propertyName, value);
		}
	
		datastore.put(newRandomEntity);
		
	}
	
}
