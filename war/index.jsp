<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.users.User" %>
<%@ page import="com.google.appengine.api.users.UserService" %>
<%@ page import="com.google.appengine.api.users.UserServiceFactory" %>
<%@ page import="java.util.List" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<html>
	<head>
	<title>Title of the document</title>
	</head>
	
	<body>
		<%
		    String guestbookName = null;
		    if (guestbookName == null) {
		        guestbookName = "default";
		    }
		%>
		test : <%= guestbookName %>
	</body>

</html>

