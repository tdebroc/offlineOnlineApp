<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="com.tdebroc.utilities.JsonUtilities" %>
<%@ page import="java.util.List" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<!DOCTYPE HTML>
<html <%--manifest="manifest.mf" --%>>
  <head>
    <title>Offline / Online App</title>
    <link rel="stylesheet" type="text/css" href="static/css/bootstrap.css" />
    <link rel="stylesheet" type="text/css" href="static/css/style.css" /> 
  </head>
  
  <body>
    <%
      String modelName = request.getParameter("modelName");;
        if (modelName == null) {
          modelName = "Order";
        }
    %> 
    <script type="text/javascript">
      // TODO : "ModelName" is bad naming convention, to change everywhere with 
      // "EntityKind"
      var MODEL_NAME = "<%=modelName%>";
      var ENTITY_KIND_PROPERTY_NAME = "<%=JsonUtilities.ENTITY_KIND_PROPERTY_NAME%>";
      var ENTITY_KEY_PROPERTY_NAME = "<%=JsonUtilities.ENTITY_KEY_PROPERTY_NAME%>";
    </script>
    
    <div id="header">
      <div id="synchronizedLogo">
      Synchronized
      </div>
    </div>
    
    <div id="content">
      
    </div>
    
    

    <div id="updateModal" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title">Update Entity</h4>
          </div>
          <div class="modal-body">
            
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default cancelSaveChange" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary saveChange">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    
    <button class="btn btn-primary"
      data-toggle="modal" data-target="#insertModal">Add</button>
    
    <div id="insertModal" class="modal fade bs-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
		        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		        <h4 class="modal-title">Insert New Entity</h4>
		      </div>
		      <form id ="add-new-entity" action="generateNewEntityServlet" method="GET">
		      <div class="form-group">
		      	<strong> Entity Name : </strong><input class='form-control' type="text" name="entityName" >
		      	Property Name : <input class='form-control' type="text" name="propertyName">
		      	Type : <input class='form-control' type="text" name="type">
		      	Minimum Value : <input class='form-control' type="text" name="minVal">
		      	Minimum Value : <input class='form-control' type="text" name="maxVal">
		      	<button class="addPropertyField btn btn-default">+</button>
		      	<input id="new" class="btn btn-default" type="submit" value="Submit new entity" />
		      	 </div>
		      </form>
		      <div class="modal-body">
		      <form id="addRandomEntity" action="generateRandomEntity" method="GET">
		      	<select id="addRandom" name="entityName" class="form-control">
		      	</select>
		      	<input id="new" class="btn btn-default" type="submit" value="Generate Random Entity" />
		        <p>Insert a new random entity ?</p>
		      </div>
		      <div class="modal-footer">
		        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
		        <button type="button" class="btn btn-primary">Save changes</button>
		      </div>

        </div>
      </div>
    </div>
    <script src="static/js/jquery-2.1.1.js"></script>
    <script  src="static/js/bootstrap.js"></script>
    <script src="static/js/DataBaseManager.js"></script>
    <script src="static/js/main.js"></script>
    <script src="static/js/Table.js"></script>
    <script src="static/js/Form.js"></script>   
  </body>

</html>

