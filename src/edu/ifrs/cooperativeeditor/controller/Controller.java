/**
 * @license
 * Copyright 2018, Rodrigo Prestes Machado and Lauro Correa Junior
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

import java.io.IOException;

import javax.ejb.EJB;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

import edu.ifrs.cooperativeeditor.dao.DataObject;
import edu.ifrs.cooperativeeditor.model.Production;

@WebServlet("/editor/*")
public class Controller extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2252618866283990092L;

	@EJB
	private DataObject dao;
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		String url = null;
		
		try {		
			url = request.getPathInfo().substring(1, request.getPathInfo().length());
		}catch (Exception e) {
			response.sendRedirect(request.getContextPath()+"/error404.html");
		}
		
		if(url.contains(".html")) {
			url = url.substring(0 , url.length() - 5);
		}
		
		if(url.equals("index")) {
			response.sendRedirect(request.getContextPath()+"/private/index.html");
		}else {
					
			Production production = dao.getProductionByUrl(url);
			
			if(production != null) {
				getServletContext().getRequestDispatcher("/private/editor.html").forward(request, response);
			}else {
				response.sendRedirect(request.getContextPath()+"/error404.html");
			}
		}
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String userId = null;
		String name = null;
		
		try {
			userId = request.getSession().getAttribute("userId").toString();
			name = request.getSession().getAttribute("name").toString();
		}catch (Exception e) {
		}
		
		JsonObject jsonResponseObject = new JsonObject();
		if(userId == null) {
			jsonResponseObject.addProperty("userId", false);
			jsonResponseObject.addProperty("userName", false);
		}else {
			jsonResponseObject.addProperty("userId", userId);
			jsonResponseObject.addProperty("userName", name);
		}
		
		response.getWriter().write(jsonResponseObject.toString());
	}
}
