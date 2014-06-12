<%@ page contentType="text/html;charset=UTF-8" language="java"%>
<%@ page import="com.google.appengine.api.users.User"%>
<%@ page import="com.google.appengine.api.users.UserService"%>
<%@ page import="com.google.appengine.api.users.UserServiceFactory"%>
<%@ page import="com.tdebroc.utilities.JsonUtilities"%>
<%@ page import="com.tdebroc.utilities.EntityConstant"%>
<%@ page import="java.util.*"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>

<!DOCTYPE HTML>
<html<%-- manifest="manifest.mf" --%>
>
<head>
<title>Offline / Online App</title>
<meta name="viewport" content="width=device-width, user-scalable=no">
<link rel="stylesheet" type="text/css" href="static/css/bootstrap.css" />
<link rel="stylesheet" type="text/css" href="static/css/style.css" />
</head>

<body>
  <%
    Date d = new Date();
  %>
  index.jsp Generated on
  <%=d.toLocaleString()%>
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
      var ENTITY_KIND_PROPERTY_NAME = "<%=EntityConstant.ENTITY_KIND_PROPERTY_NAME%>";
      var ENTITY_KEY_PROPERTY_NAME = "<%=EntityConstant.ENTITY_KEY_PROPERTY_NAME%>";
      var ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME = 
          "<%=EntityConstant.ENTITY_CHANGES_TIMESTAMP_PROPERTY_NAME%>";
  </script>

  <div id="header">
    <div id="rightHeader">
      <button id="launchFullSynch" class="btn btn-primary">Launch
        Full Synch</button>
      <span id="onLineStatus"> onLine </span>
      <span id="synchronizedLogo">
        Synchronized
      </span>
    </div>
  </div>

  <div id="content">
    <div id="tableContainer">Please Wait..</div>
    <button id="createNewEntity" class="btn btn-primary"
      data-toggle="modal" data-target="#newEntityModal">Create new
      Entity</button>
    <button id="generateNewRandomEntity" class="btn btn-primary"
      data-toggle="modal" data-target="#generateEntityModal">
      Generate New random Entity</button>
  </div>

  <div id="updateModal" class="modal fade bs-example-modal-lg"
    tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"
            aria-hidden="true">&times;</button>
          <h4 class="modal-title">Update Entity</h4>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default cancelSaveChange"
            data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary saveChange">
            Save changes</button>
        </div>
      </div>
    </div>
  </div>

  <div id="newEntityModal" class="modal fade bs-example-modal-lg"
    tabindex="-1" role="dialog" aria-labelledby="Create"
    aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"
            aria-hidden="true">&times;</button>
          <h4 class="modal-title">Create new Entity</h4>
        </div>
        <div class="modal-body">
          <form id="add-new-entity">
          </form>
        </div>
        <div class="modal-footer">
          <span id="newEntityModalMessage"></span>
          <button type="button" class="btn btn-default" data-dismiss="modal">
            Close
          </button>
          <button id="createNewEntityConfirm" type="button"
              class="btn btn-primary">
            Create new entity Kind
          </button>
        </div>
      </div>
    </div>
  </div>

  <div id="generateEntityModal" class="modal fade bs-example-modal-lg"
    tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"
            aria-hidden="true">&times;</button>
          <h4 class="modal-title">Create new Entity</h4>
        </div>
        <div class="modal-body">
          <form id="addRandomEntity" action="generateRandomEntity"
            method="GET">
            <select id="addRandom" name="entityName"
                class="form-control entityKindSelect">
            </select>
            <input id="new" class="btn btn-default" type="submit"
                value="Generate Random Entity" />
          </form>

          <p>Insert a new random entity ?</p>
          Be careful, for the moment, it won't work across several clients.
          So to receive the entity on another client, you will need to click
          on "Launch Full Synch".
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Generate</button>
        </div>
      </div>
    </div>
  </div>

  <div id="removeModal" class="modal fade bs-example-modal-lg"
    tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel"
    aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal"
            aria-hidden="true">&times;</button>
          <h4 class="modal-title">Are you sure you want to delete this
            entity ?</h4>
        </div>
        <div class="modal-body"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary btn-danger">Delete</button>
        </div>

      </div>
    </div>
  </div>
  
  Switch Entity Kind :
  <select id="entityKindSwitcher" name="entityName"
      class="form-control entityKindSelect">
  </select>
  
  
  <script src="static/js/jquery-2.1.1.js"></script>
  <script src="static/js/bootstrap.js"></script>
  <script src="static/js/main.js"></script>
  <script src="static/js/Table.js"></script>
  <script src="static/js/Form.js"></script>
  <script src="static/js/DBManager.js"></script>
  <script src="static/js/EntityKindSwitcher.js"></script>
  <script src="static/js/EntityCreationManager.js"></script>
</body>

</html>

