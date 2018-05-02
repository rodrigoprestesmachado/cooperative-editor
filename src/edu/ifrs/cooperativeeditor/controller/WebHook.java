package edu.ifrs.cooperativeeditor.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/webhook")
public class WebHook extends HttpServlet {
	
	private static final long serialVersionUID = 1L;
	private static final Logger log = Logger.getLogger(WebHook.class.getName());
	
	private void execute(HttpServletRequest request, HttpServletResponse response) {
		log.info("Executing Cooperative Editor update");
		try {
			Process process = Runtime.getRuntime().exec("sh /home/rodrigo/updateEditor.sh");
			process.waitFor();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String line = "";			
			while ((line = reader.readLine())!= null) {
				PrintWriter writer = response.getWriter();
				writer.print(line + "<br/>");
			}
		} catch (IOException e) {
			e.printStackTrace();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.execute(request, response);
	}
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.execute(request, response);
	}
}