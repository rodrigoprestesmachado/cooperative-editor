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
package edu.ifrs.cooperativeeditor.websocket;

import java.io.IOException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
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

import edu.ifrs.cooperativeeditor.dao.DataObject;
import edu.ifrs.cooperativeeditor.model.InputMessage;
import edu.ifrs.cooperativeeditor.model.OutputMessage;
import edu.ifrs.cooperativeeditor.model.Production;
import edu.ifrs.cooperativeeditor.model.SoundColors;
import edu.ifrs.cooperativeeditor.model.TextMessage;
import edu.ifrs.cooperativeeditor.model.Type;
import edu.ifrs.cooperativeeditor.model.User;

/**
 * Web Socket server that controls the chat
 * 
 * @author Rodrigo Prestes Machado
 */
@ServerEndpoint(value = "/chat/{hashProduction}", configurator = HttpSessionConfigurator.class)
@Stateless
public class SoundChatWS {

	private static final Logger log = Logger.getLogger(SoundChatWS.class.getName());
	private static Map<String, ArrayList<User>> mapUsers = Collections
			.synchronizedMap(new HashMap<String, ArrayList<User>>());
	private static Gson gson = new Gson();
	private int countSoundColor = 1;

	@EJB
	private DataObject dao;

	@OnMessage
	public void onMessage(String jsonMessage, @PathParam("hashProduction") String hashProduction, Session session) {

		log.log(Level.INFO, "inputMessage: " + jsonMessage + " hashProduction " + hashProduction + " session "
				+ session.getUserProperties().get(hashProduction));

		InputMessage input = parseInputMessage(jsonMessage, session, hashProduction);

		boolean returnMessage = false;
		OutputMessage out = new OutputMessage();
		if (Type.valueOf(input.getType()) == Type.SEND_MESSAGE) {
			out.setType("ACK_SEND_MESSAGE");
			out.addData("message", input.getMessage().getTextMessage());
			out.addData("user", input.getUser().getName());
			out.addData("soundColor", String.valueOf(input.getUser().getSoundColor()));
			SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
			out.addData("time", sdf.format(input.getDate()));
			returnMessage = true;
		} else if (Type.valueOf(input.getType()) == Type.TYPING) {
			out.setType("ACK_TYPING");
			out.addData("user", input.getUser().getName());
			out.addData("soundColor", String.valueOf(input.getUser().getSoundColor()));
			out.addData("user", findUserFromSession(session, hashProduction).getName());
			returnMessage = true;
		} else if (Type.valueOf(input.getType()) == Type.SET_SOUND_COLOR) {
			this.countSoundColor = Integer.valueOf(input.getMessage().getTextMessage());
			returnMessage = false;
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
		
		// initializes the map where users are stored
		if (!mapUsers.containsKey(hashProduction))
			mapUsers.put(hashProduction, new ArrayList<User>());
		
		// retrieve http session
		HttpSession httpSession = (HttpSession) config.getUserProperties().get("sessionHttp");
		
		// retrieves the id of the logged-in user in the http session
		String userId = httpSession.getAttribute("userId").toString();

		// register the user
		OutputMessage out = registerUser(userId, session, hashProduction);
		
		// sends a text to the client		
		sendToAll(out.toString(), session, hashProduction);
		
		log.log(Level.INFO, "outputMessage: " + out.toString());	
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
		mapUsers.get(hashProduction).remove(user);

		OutputMessage out = new OutputMessage();
		out.setType("ACK_CONNECT");
		out.addData("size", String.valueOf(mapUsers.get(hashProduction).size()));
		out.addData("users", gson.toJson(mapUsers.get(hashProduction).toArray()));

		log.log(Level.INFO, "outputMessage: " + out.toString());
		sendToAll(out.toString(), session, hashProduction);
	}

	/**
	 * Send to all connected users in web socket server
	 * 
	 * @param Strign
	 *            message : A message in JSON format
	 */
	private void sendToAll(String message, Session session, String hashProduction) {
		try {
			synchronized (mapUsers.get(hashProduction)) {
				for (User user : mapUsers.get(hashProduction))
					if (Boolean.TRUE.equals(user.getSession().getUserProperties().get(hashProduction)))
						user.getSession().getBasicRemote().sendText(message);
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	/**
	 * Find the user from data base
	 * 
	 * @param long
	 *            idUser : User id
	 * @return User: One user object
	 */
	private User findUserFromDataBase(long idUser) {
		User user = dao.getUser(idUser);
		return user;
	}

	/**
	 * Find the user from Web Socket session
	 * 
	 * @param Session
	 *            session : Web socket session
	 * @return User object
	 */
	private User findUserFromSession(Session session, String hashProduction) {
		User user = null;
		for (User u : mapUsers.get(hashProduction)) {
			String idSesssion = u.getSession().getId();
			if (idSesssion.equals(session.getId()))
				user = u;
		}
		return user;
	}

	/**
	 * Creates the input message object
	 * 
	 * @param String
	 *            jsonMessage : JSON message from the client
	 * @param Sesstion
	 *            session : Web Socket session
	 * @return InputMessage object
	 */
	private InputMessage parseInputMessage(String jsonMessage, Session session, String hashProduction) {

		InputMessage input = gson.fromJson(jsonMessage, InputMessage.class);
		Calendar cal = Calendar.getInstance();
		Timestamp time = new Timestamp(cal.getTimeInMillis());
		input.setDate(time);

		// Retrieve the user from WS list of sessions or data base
		User u = gson.fromJson(jsonMessage, User.class);
		User user = null;
		if (((u.getId() == null) && (u.getName() == null)) || (u.getName() != null))
			user = findUserFromSession(session, hashProduction);
		else if (u.getId() != null) {
			// Get the user from the data base in the login
			user = findUserFromDataBase(u.getId());
			user.setSession(session);
			user.setSoundColor(genereteSoundColor());
			// Add the user in the WS connected users
			mapUsers.get(hashProduction).add(user);
		}

		// Assign the user to the input
		input.setUser(user);

		// Sets a new sound color for other user
		countSoundColor++;

		// Check if the json message contains an text message
		if (jsonMessage.toLowerCase().contains("message")) {
			TextMessage message = new TextMessage();
			message = gson.fromJson(jsonMessage, TextMessage.class);
			message.escapeCharacters();
			dao.persistMessage(message);
			input.setMessage(message);
			// To maintain the relationship between the messages exchanged during production
			Production production = dao.getProductionByUrl(hashProduction);
			production.addInputMessage(input);
			dao.mergeProduction(production);
		}

		dao.persistInputMessage(input);
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
		User user = findUserFromDataBase(Long.parseLong(userId));
		user.setSession(session);
		user.setSoundColor(genereteSoundColor());
		
		// Add the user in the WS connected users
		mapUsers.get(hashProduction).add(user);

		// Assign the user to the input
		input.setUser(user);

		// Sets a new sound color for other user
		countSoundColor++;
		dao.persistInputMessage(input);
		
		OutputMessage out = new OutputMessage();
		out.setType("ACK_CONNECT");
		out.addData("size", String.valueOf(mapUsers.get(hashProduction).size()));
		out.addData("soundColor", String.valueOf(input.getUser().getSoundColor()));
		out.addData("users", gson.toJson(mapUsers.get(hashProduction).toArray()));
		out.addData("messages", dao.getMessages(hashProduction));
		
		return out;
	}

	/**
	 * Generates sound color
	 * 
	 * @return String : A sound color
	 */
	private String genereteSoundColor() {
		SoundColors effect = null;
		switch (countSoundColor) {
		case 1:
			effect = SoundColors.NOCOLOR;
			break;
		case 2:
			effect = SoundColors.DELAY;
			break;
		case 3:
			effect = SoundColors.WAHWAH;
			break;
		default:
			effect = SoundColors.MOOG;
			break;
		}
		return effect.toString();
	}

}