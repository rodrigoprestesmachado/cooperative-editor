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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import edu.ifrs.cooperativeeditor.webservice.FormWebService;

/**
 * Servlet Filter implementation class ControllerFilter
 */
@WebFilter(urlPatterns = { "/private/*", "/editor/*", "/webresources/*", "/chat/*", "/src/*" })
public class ControllerFilter implements Filter {
	
	private static final Logger log = Logger.getLogger(FormWebService.class.getName());

	private static final Set<String> ALLOWED_PATHS = Collections.unmodifiableSet(new HashSet<String>(
			Arrays.asList("/src/ce-login/ce-login.html", "/src/ce-login/ce-login-localization.html")));

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		log.log(Level.INFO, "WebFilter destroy ");
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws ServletException, IOException {
		HttpServletRequest request = (HttpServletRequest) req;
		HttpServletResponse response = (HttpServletResponse) res;
		HttpSession session = request.getSession();

		String path = request.getRequestURI().substring(request.getContextPath().length()).replaceAll("[/]+$", "");

		boolean loggedIn = session.getAttribute("userId") != null;
		boolean allowedPath = ALLOWED_PATHS.contains(path);

		if (loggedIn || allowedPath) {
			chain.doFilter(req, res);
		} else {
			session.setAttribute("urlBeforeRedirect", request.getRequestURL());
			response.sendRedirect(request.getContextPath() + "/login.html");
		}
	}

	@Override
	public void init(FilterConfig arg0) throws ServletException {
		log.log(Level.INFO, "WebFilter init ");		
	}
}