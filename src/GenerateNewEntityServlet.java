import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;
import java.util.SortedSet;
import java.util.TreeSet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.tdebroc.utilities.JsonUtilities;


public class GenerateNewEntityServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	private static final String ENTITY_NAME_PARAM = "entityName";
	
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {
		createEntity(req);
	  resp.setContentType("text/plain");
	  resp.getWriter().println("Entity " + 
	      req.getParameter(ENTITY_NAME_PARAM) + " has been created");
	}
	
	
	/**
	 * function to create an entity based on get parameters
	 * @param req : request that posess required parameters to create new Entity
	 */
	public void createEntity(HttpServletRequest req){
		String entityName = req.getParameter("entityName");
		
		Map<String, String[]> params = req.getParameterMap();
		
		ArrayList<String>  propertyName = new ArrayList<String>();
		ArrayList<String> type=new ArrayList<String>();
		ArrayList<String> maxVal=new ArrayList<String>(),minVal =new ArrayList<String>();;
		
		SortedSet<String> sortedParams = new TreeSet<String>();
		for(String param : params.keySet()){
			sortedParams.add(param);
		}
		
		for(String param : 	sortedParams){
			String property = req.getParameter(param);
			if (param.contains("propertyName")){
				propertyName.add(property);
			}
			else if(param.contains("type")){
				type.add(property);
			}
			if(param.contains("minVal")){
				minVal.add(property);
			}
			if(param.contains("maxVal")){
				maxVal.add(property);
			}
		}	
		
		DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
		for (int i = 0; i< propertyName.size(); i++){
			Entity ent = new Entity("EntityProperty");
			ent.setProperty("EntityName", entityName);
		    ent.setProperty("propertyName", propertyName.get(i));
		    ent.setProperty("type", type.get(i));
		    ent.setProperty("maxValue", (maxVal.get(i) == "" ? "": Long.valueOf(maxVal.get(i)) ));
		    ent.setProperty("minValue", (minVal.get(i)== "" ? "":  Long.valueOf(minVal.get(i))));
		    datastore.put(ent);
	}
		
}
}
