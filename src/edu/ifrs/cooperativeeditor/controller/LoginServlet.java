/**
 * @license
 * Copyright 2018, Instituto Federal do Rio Grande do Sul (IFRS)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * 		http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package edu.ifrs.cooperativeeditor.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.EJB;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.PUT;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import edu.ifrs.cooperativeeditor.dao.DataObject;
import edu.ifrs.cooperativeeditor.model.User;
import edu.ifrs.cooperativeeditor.webservice.FormWebService;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private static final Logger log = Logger.getLogger(LoginServlet.class.getName());

	@EJB
	private DataObject dao;

	@PUT
	protected void doPut(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
		StringBuilder json = new StringBuilder();
		BufferedReader reader = request.getReader();
		String linha;
		while ((linha = reader.readLine()) != null) {
			json.append(linha);
		}

		Gson gson = new Gson();
		User user = gson.fromJson(json.toString(), User.class);

		User userToUpdate = dao.getUser(user.getEmail());
		if (userToUpdate != null) {
			userToUpdate.setEmail(user.getEmail());
			userToUpdate.setName(user.getName());
			userToUpdate.setPassword(user.getPassword());
			dao.mergerUser(userToUpdate);
			log.log(Level.INFO, "LoginServlet method doPUT merger User ");
		} else {
			dao.mergerUser(user);
			log.log(Level.INFO, "LoginServlet method doPUT new User ");
		}

		JsonObject jsonResponseObject = new JsonObject();
		jsonResponseObject.addProperty("isUserValid", true);
		response.getWriter().write(jsonResponseObject.toString());
	}

	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		JsonObject jsonResponseObject = new JsonObject();

		request.getSession().removeAttribute("userId");
		request.getSession().removeAttribute("name");
		request.getSession().invalidate();
		
		log.log(Level.INFO, "LoginServlet method doGET AttributeNames: "+request.getSession().getAttributeNames());
		jsonResponseObject.addProperty("isLogoutValid", true);
		response.getWriter().write(jsonResponseObject.toString());
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		StringBuilder json = new StringBuilder();
		BufferedReader reader = request.getReader();
		String linha;
		while ((linha = reader.readLine()) != null) {
			json.append(linha);
		}

		JsonObject jsonRequestObject = new JsonParser().parse(json.toString()).getAsJsonObject();
		JsonObject jsonResponseObject = new JsonObject();
		String email = null;
		String password = null;

		try {
			email = jsonRequestObject.get("useremail").getAsString();
			password = jsonRequestObject.get("password").getAsString();
		} catch (Exception e) {
			// TODO Exception
		}

		response.setContentType("application/json");

		User user = dao.getUser(email, password);
		if (user != null) {
			request.getSession().setAttribute("userId", user.getId());
			request.getSession().setAttribute("name", user.getName());

			jsonResponseObject.addProperty("isLoginValid", true);

			if (request.getSession().getAttribute("urlBeforeRedirect") != null) {
				String url = request.getSession().getAttribute("urlBeforeRedirect").toString();
				jsonResponseObject.addProperty("urlRedirect", url);
			}

		} else {
			jsonResponseObject.addProperty("isLoginValid", false);
		}
		
		log.log(Level.INFO, "LoginServlet method doPOST AttributeNames: "+request.getSession().getAttributeNames());
		
		response.getWriter().write(jsonResponseObject.toString());
	}

}