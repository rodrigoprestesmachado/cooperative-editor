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
package edu.ifrs.cooperativeeditor.websocket;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.http.HttpSession;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import edu.ifrs.cooperativeeditor.dao.DataObject;
import edu.ifrs.cooperativeeditor.model.Content;
import edu.ifrs.cooperativeeditor.model.Contribution;
import edu.ifrs.cooperativeeditor.model.InputMessage;
import edu.ifrs.cooperativeeditor.model.OutputMessage;
import edu.ifrs.cooperativeeditor.model.Production;
import edu.ifrs.cooperativeeditor.model.Rubric;
import edu.ifrs.cooperativeeditor.model.RubricProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.Situation;
import edu.ifrs.cooperativeeditor.model.TextMessage;
import edu.ifrs.cooperativeeditor.model.User;
import edu.ifrs.cooperativeeditor.model.UserRubricStatus;

/**
 * Web Socket server that controls the editor
 * 
 * @author Rodrigo Prestes Machado
 */
@ServerEndpoint(value = "/editorws/{hashProduction}", configurator = HttpSessionConfigurator.class)
@Stateless
public class CooperativeEditorWS {

	@EJB
	private DataObject dao;

	private static Map<String, List<User>> mapUserAndConf = Collections.synchronizedMap(new HashMap<String, List<User>>());

	private static final Logger log = Logger.getLogger(CooperativeEditorWS.class.getName());

	private static Gson gson = new Gson();

	@OnMessage
	public void onMessage(String jsonMessage, @PathParam("hashProduction") String hashProduction, Session session) {

		log.log(Level.INFO, "inputMessage: " + jsonMessage + " hashProduction " + hashProduction + " session "
				+ session.getUserProperties().get(hashProduction));

		InputMessage input = parseInputMessage(jsonMessage, session, hashProduction);		
		boolean returnMessage = false;
		OutputMessage out = null;
		
		if (input != null) {
			switch (Type.valueOf(input.getType())) {
			case SEND_MESSAGE:
				out = this.sendMessageHandler(input);
				returnMessage = true;
				break;
			case TYPING:
				out = this.typingHandler(input);
				returnMessage = true;
				break;
			case FINISH_RUBRIC:
				out = this.finishRubricHandler(input);
				returnMessage = out != null;
				break;
			case REQUEST_PARTICIPATION:
				out = this.requestParticipationHandler(input, session, hashProduction);
				returnMessage = out != null;
				break;
			case FINISH_PARTICIPATION:
					out = this.finishParticipationHandler(input,hashProduction);
					returnMessage = true;
				break;
			default:
				break;
			}
		}

		if (returnMessage) {
			log.log(Level.INFO, "outputMessage: " + out.toString());
			sendToAll(out.toString(), session, hashProduction);
		}
	}

	/**
	 * Open web socket method
	 * 
	 * @param session
	 */
	@OnOpen
	public void onOpen(Session session, @PathParam("hashProduction") String hashProduction, EndpointConfig config)
			throws IOException {

		log.log(Level.INFO, "onOpen");

		// saves the production hash in session, to filter the exchange of msg between
		// users
		session.getUserProperties().put(hashProduction, true);

		Production production = findProductionFromDataBase(hashProduction);

		// initializes the map where UserProductionConfiguration are stored
		if (!mapUserAndConf.containsKey(hashProduction)) {
			mapUserAndConf.put(hashProduction, new ArrayList<User>());
		}

		// retrieve http session
		HttpSession httpSession = (HttpSession) config.getUserProperties().get("sessionHttp");

		// retrieves the id of the logged-in user in the http session
		String userId = httpSession.getAttribute("userId").toString();

		// register the user
		OutputMessage outLast = registerUser(userId, session, hashProduction);
		
		OutputMessage out = new OutputMessage();
		out.setType(Type.LOAD_EDITOR.name());
		out.addData("userId", findUserFromSession(session, hashProduction).getId().toString());
		out.addData("production", production.toString());
		session.getBasicRemote().sendText(out.toString());
		log.log(Level.INFO, "outputMessage: " + out.toString());		

		// sends a text to the client
		sendToAll(outLast.toString(), session, hashProduction);
		
		log.log(Level.INFO, "outputMessage: " + outLast.toString());
	}

	/**
	 * Close web socket method
	 * 
	 * @param session
	 */
	@OnClose
	public void onClose(Session session, @PathParam("hashProduction") String hashProduction) {
		log.log(Level.INFO, "onClose");
		User user = findUserFromSession(session, hashProduction);

		mapUserAndConf.get(hashProduction).remove(user);

		if (user.getUserProductionConfiguration() != null) {
			
			Boolean releaseProduction = user.getUserProductionConfiguration().getSituation().equals(Situation.CONTRIBUTING);
				
			List<String> strUPC = new ArrayList<String>();
			for (User u : mapUserAndConf.get(hashProduction))
				if (u.getUserProductionConfiguration() != null) {
					if(releaseProduction)
						u.getUserProductionConfiguration().setSituation(Situation.FREE);
					strUPC.add(u.getUserProductionConfiguration().toString());
				}

			OutputMessage out = new OutputMessage();
			out.setType(Type.CONNECT.name());
			out.addData("size", String.valueOf(mapUserAndConf.get(hashProduction).size()));
			out.addData("userProductionConfigurations", strUPC.toString());

			log.log(Level.INFO, "outputMessage: " + out.toString());
			sendToAll(out.toString(), session, hashProduction);
		}

	}
	
	private OutputMessage sendMessageHandler(InputMessage input) {
		OutputMessage out = new OutputMessage();
		out.setType(Type.SEND_MESSAGE.name());
		out.addData("message", input.getMessage().getTextMessage());
		out.addData("user", input.getUser().getName());
		SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
		out.addData("time", sdf.format(input.getDate()));
		return out;
		
	}
	
	private OutputMessage typingHandler(InputMessage input) {
		OutputMessage out = new OutputMessage();
		out.setType(Type.TYPING.name());
		out.addData("user", input.getUser().getName());
		return out;
	}
	
	private OutputMessage finishRubricHandler(InputMessage input) {
		OutputMessage out = null;
		UserRubricStatus userRubricStatus = input.getUserRubricStatus();
		if(userRubricStatus != null) {
			out = new OutputMessage();
			out.setType(Type.FINISH_RUBRIC.name());						
			out.addData("userRubricStatus",userRubricStatus.toString());
		}
		return out;
	}
	
	
	private OutputMessage requestParticipationHandler(InputMessage input,Session session,String hashProduction) {
		OutputMessage out = null;
		if (!this.hasAnyoneContributed(hashProduction)) {
			out = new OutputMessage();
			out.setType(Type.REQUEST_PARTICIPATION.name());
			User user = findUserFromSession(session, hashProduction);			
			List<String> strUPC = new ArrayList<String>();
			for (User u : mapUserAndConf.get(hashProduction))
				if (u.getUserProductionConfiguration() != null) {
					if (u.getId() == user.getId()) {
						u.getUserProductionConfiguration().setSituation(Situation.CONTRIBUTING);
					} else {
						u.getUserProductionConfiguration().setSituation(Situation.BLOCKED);
					}
					strUPC.add(u.getUserProductionConfiguration().toString());
				}			
			out.addData("userProductionConfigurations", strUPC.toString());			
		}	
		return out;
	}
	
	private OutputMessage finishParticipationHandler(InputMessage input,String hashProduction) {
		OutputMessage out = new OutputMessage();
		out.setType(Type.FINISH_PARTICIPATION.name());
		List<String> strUPC = new ArrayList<String>();
		for (User u : mapUserAndConf.get(hashProduction))
			if (u.getUserProductionConfiguration() != null) {
				u.getUserProductionConfiguration().setSituation(Situation.FREE);
				strUPC.add(u.getUserProductionConfiguration().toString());
			}
		out.addData("userProductionConfigurations", strUPC.toString());
		out.addData("content", input.getContribution().toString());
	return out;
}
	

	/**
	 * Send to all connected users in web socket server
	 * 
	 * @param String message : A message in JSON format
	 */
	private void sendToAll(String message, Session session, String hashProduction) {
		try {
			synchronized (mapUserAndConf.get(hashProduction)) {
				for (User u : mapUserAndConf.get(hashProduction)) {
					if (Boolean.TRUE.equals(u.getSession().getUserProperties().get(hashProduction)))
						u.getSession().getBasicRemote().sendText(message);
				}
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * Find the user from data base
	 * 
	 * @param long: userId : User id
	 * @return User: One user object
	 */
	private User findUserFromDataBase(long userId, String hashProduction) {
		User user = dao.getUser(userId, hashProduction);
		return user;
	}

	/**
	 * Find the user from Web Socket session
	 * 
	 * @param Session session : Web socket session
	 * @return User object
	 */
	private User findUserFromSession(Session session, String hashProduction) {
		User user = null;
		for (User u : mapUserAndConf.get(hashProduction)) {
			String idSesssion = u.getSession().getId();
			if (idSesssion.equals(session.getId()))
				user = u;
		}
		return user;
	}

	/**
	 * Find the Production from data base
	 * 
	 * @param String hashProduction : Production URL
	 * @return Production: One Production object
	 */

	private Production findProductionFromDataBase(String hashProduction) {
		return dao.getProductionByUrl(hashProduction);
	}	
	
	/**
	 * Find the UserRubricStatus from data base
	 * 
	 * @param String hashProduction : Production URL
	 * @return UserRubricStatus : One UserRubricStatus  object
	 */
	
	private Boolean hasAnyoneContributed(String hashProduction) {
		Boolean a = false;
			for (User u : mapUserAndConf.get(hashProduction))
				if(u.getUserProductionConfiguration() != null)
					if (u.getUserProductionConfiguration().getSituation().equals(Situation.CONTRIBUTING))
						a = true;
		return a;
	}

	/**
	 * Creates the input message object
	 * 
	 * @param String jsonMessage : JSON message from the client
	 * @param Sesstion session : Web Socket session
	 * @return InputMessage object
	 */
	private InputMessage parseInputMessage(String jsonMessage, Session session, String hashProduction) {

		// Retrieve the user from WS list of sessions
		User user = findUserFromSession(session, hashProduction);
		InputMessage input = null;

		// if it is null, it means that the user is not participating in the production,
		// just a visitor or owner.
		if (user.getUserProductionConfiguration() != null) {

			Production production = user.getUserProductionConfiguration().getProduction();

			input = gson.fromJson(jsonMessage, InputMessage.class);
			Calendar cal = Calendar.getInstance();
			Timestamp time = new Timestamp(cal.getTimeInMillis());
			input.setDate(time);

			// Assign the user to the input
			input.setUser(user);

			dao.persistInputMessage(input);

			// Check if the json message contains an text message
			if (jsonMessage.toLowerCase().contains("message")) {
				TextMessage message = new TextMessage();
				message = gson.fromJson(jsonMessage, TextMessage.class);
				message.escapeCharacters();
				// To maintain the relationship between the messages exchanged during production
				message.setProduction(production);
				dao.persistMessage(message);
				input.setMessage(message);

			} else if (input.getType().equals(Type.FINISH_RUBRIC.toString())) {

				JsonParser parser = new JsonParser();
				JsonObject objeto = parser.parse(jsonMessage).getAsJsonObject();
				RubricProductionConfiguration rPC = new RubricProductionConfiguration();
				rPC = gson.fromJson(objeto.get("rubricProductionConfiguration").toString(),
						RubricProductionConfiguration.class);

				for (RubricProductionConfiguration ruPC : production.getRubricProductionConfigurations())
					if (ruPC.getId() == rPC.getId()) {
						rPC = ruPC;
						break;
					}

				Rubric rubric = rPC.getRubric();
				UserRubricStatus userRubricStatus = new UserRubricStatus();
				userRubricStatus.setConsent(true);
				userRubricStatus.setSituation(Situation.FINALIZED);
				userRubricStatus.setUser(user);
				userRubricStatus.setRubric(rubric);
				userRubricStatus.setProduction(production);
				dao.persistUserRubricStatus(userRubricStatus);
				
				input.setUserRubricStatus(userRubricStatus);
				
				rPC.getRubric().addUserRubricStatus(userRubricStatus);
				production.addUserRubricStatus(userRubricStatus);
				
			} else if (input.getType().equals(Type.FINISH_PARTICIPATION.toString())) {
				
				Content content = new Content();
				JsonParser parser = new JsonParser();
				JsonObject objeto = parser.parse(jsonMessage).getAsJsonObject();
				content = gson.fromJson(objeto.get("content").toString(), Content.class);
				
				Contribution contribution = new Contribution();
				contribution.setUser(user);
				contribution.setProduction(production);
				contribution.setContent(content);
				contribution.setMoment(new Date());
				//contribution.setcard(card);
				
				input.setContribution(contribution);			
			}

			dao.mergeInputMessage(input);
		}

		return input;
	}

	/**
	 * Register the user by creating a creates the input message object
	 * 
	 * @param String userId : user Id
	 * @param Sesstion session : Web Socket session
	 * @return OutputMessage object
	 */
	private OutputMessage registerUser(String userId, Session session, String hashProduction) {

		InputMessage input = new InputMessage();
		input.setType(Type.CONNECT.name());
		Calendar cal = Calendar.getInstance();
		Timestamp time = new Timestamp(cal.getTimeInMillis());
		input.setDate(time);

		// Get the user from the data base in the login
		User user = findUserFromDataBase(Long.parseLong(userId), hashProduction);
		user.setSession(session);

		// Assign the user to the input
		input.setUser(user);

		// Add the user in the WS connected users
		mapUserAndConf.get(hashProduction).add(user);

		dao.persistInputMessage(input);

		List<String> strUPC = new ArrayList<String>();
		for (User u : mapUserAndConf.get(hashProduction))
			if (u.getUserProductionConfiguration() != null) {
				strUPC.add(u.getUserProductionConfiguration().toString());
			}

		OutputMessage out = new OutputMessage();
		out.setType(Type.CONNECT.name());
		out.addData("size", String.valueOf(mapUserAndConf.get(hashProduction).size()));
		out.addData("userProductionConfigurations", strUPC.toString());
		out.addData("messages", dao.getMessages(hashProduction));

		return out;
	}
}