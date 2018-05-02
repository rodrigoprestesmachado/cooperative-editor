package edu.ifrs.cooperativeeditor.controller;

import java.io.File;
import java.io.IOException;
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
	
	private static final String SCRIPT = "updateEditor.sh";
	private static final String DIRECTORY = "/home/rodrigo/";
	
	private void execute() {
		log.info("Executing Cooperative Editor update");
		ProcessBuilder pb = new ProcessBuilder(SCRIPT);
		pb.directory(new File(DIRECTORY));
		try {
			pb.start();
		} catch (IOException e) {
			e.printStackTrace();
		}
		log.info("End of Cooperative Editor update");
	}
	
	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.execute();
	}
	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.execute();
	}	

}