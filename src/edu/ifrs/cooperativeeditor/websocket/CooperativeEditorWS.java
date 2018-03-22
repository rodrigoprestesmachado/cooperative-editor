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
import java.util.Calendar;
import java.util.Collections;
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
import edu.ifrs.cooperativeeditor.model.InputMessage;
import edu.ifrs.cooperativeeditor.model.OutputMessage;
import edu.ifrs.cooperativeeditor.model.Production;
import edu.ifrs.cooperativeeditor.model.Rubric;
import edu.ifrs.cooperativeeditor.model.RubricProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.Situation;
import edu.ifrs.cooperativeeditor.model.SoundColors;
import edu.ifrs.cooperativeeditor.model.TextMessage;
import edu.ifrs.cooperativeeditor.model.Type;
import edu.ifrs.cooperativeeditor.model.User;
import edu.ifrs.cooperativeeditor.model.UserProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.UserRubricStatus;
import edu.ifrs.cooperativeeditor.model.UsersAndConfigurarion;

/**
 * Web Socket server that controls the editor
 * 
 * @author Rodrigo Prestes Machado
 */
@ServerEndpoint(value = "/editorws/{hashProduction}", configurator = HttpSessionConfigurator.class)
@Stateless
public class CooperativeEditorWS {

	private static final Logger log = Logger.getLogger(CooperativeEditorWS.class.getName());	
	private static Map<String, UsersAndConfigurarion> mapUserAndConf = Collections
			.synchronizedMap(new HashMap<String, UsersAndConfigurarion>());
	
	private static Gson gson = new Gson();
	private int countSoundColor = 1;

	@EJB
	private DataObject dao;

	@OnMessage
	public void onMessage(String jsonMessage, @PathParam("hashProduction") String hashProduction, Session session) {

		log.log(Level.INFO, "inputMessage: " + jsonMessage + " hashProduction " + hashProduction + " session "
				+ session.getUserProperties().get(hashProduction));

		InputMessage input = parseInputMessage(jsonMessage, session, hashProduction);
		
		log.log(Level.INFO, "Participant in production: " + (input != null) );

		boolean returnMessage = false;
		OutputMessage out = new OutputMessage();
		
		if(input != null)
			switch (Type.valueOf(input.getType())) {
			
			case SEND_MESSAGE:
				
				out.setType(Type.SEND_MESSAGE.name());
				out.addData("message", input.getMessage().getTextMessage());
				out.addData("user", input.getUser().getName());
				out.addData("soundColor", String.valueOf(input.getUser().getSoundColor()));
				SimpleDateFormat sdf = new SimpleDateFormat("HH:mm");
				out.addData("time", sdf.format(input.getDate()));			
				returnMessage = true;
				break;
				
			case TYPING:
				
				out.setType(Type.TYPING.name());
				out.addData("user", input.getUser().getName());
				out.addData("soundColor", String.valueOf(input.getUser().getSoundColor()));
				//out.addData("user", findUserFromSession(session, hashProduction).getName());
				returnMessage = true;
				break;
				
			case SET_SOUND_COLOR:
				
				this.countSoundColor = Integer.valueOf(input.getMessage().getTextMessage());
				returnMessage = false;
				break;
				
			case FINISH_RUBRIC:
				
				int last = mapUserAndConf.get(hashProduction).getUserRubricStatuss().size();
				
				last = last > 0 ? last - 1 : last;
				
				out.setType(Type.FINISH_RUBRIC.name());
				out.addData("userRubricStatus", mapUserAndConf.get(hashProduction).getUserRubricStatuss().get(last).toString());
				returnMessage = true;
				break;
				
			default:
				break;
			
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
		
		Production production;
				
		// initializes the map where UserProductionConfiguration are stored
		if (!mapUserAndConf.containsKey(hashProduction)) {
			mapUserAndConf.put(hashProduction, new UsersAndConfigurarion());
			production = findProductionFromDataBase(hashProduction);
			mapUserAndConf.get(hashProduction).setProduction(production);
			mapUserAndConf.get(hashProduction).setUserRubricStatuss(findUserRubricStatusFromDataBase(production.getId()));
		
		}

		// retrieve http session
		HttpSession httpSession = (HttpSession) config.getUserProperties().get("sessionHttp");

		// retrieves the id of the logged-in user in the http session
		String userId = httpSession.getAttribute("userId").toString();

		// register the user
		OutputMessage out = registerUser(userId, session, hashProduction);

		// sends a text to the client
		sendToAll(out.toString(), session, hashProduction);

		log.log(Level.INFO, "outputMessage: " + out.toString());

		production = mapUserAndConf.get(hashProduction).getProduction();

		out = new OutputMessage();
		out.setType(Type.LOAD_EDITOR.name());
		out.addData("production", production.toString());
		out.addData("userRubricStatuss", mapUserAndConf.get(hashProduction).getUserRubricStatuss().toString());

		session.getBasicRemote().sendText(out.toString());

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
		UserProductionConfiguration uPC = findUserProductionConfigurationFromSession(session, hashProduction);
		User user = findUserFromSession(session, hashProduction);
		
		mapUserAndConf.get(hashProduction).getUsers().remove(user);
		
		if(uPC != null) {
			
			mapUserAndConf.get(hashProduction).getUpcs().remove(uPC);
	
			OutputMessage out = new OutputMessage();
			out.setType(Type.CONNECT.name());
			out.addData("size", String.valueOf(mapUserAndConf.get(hashProduction).getUpcs().size()));
			out.addData("userProductionConfigurations", mapUserAndConf.get(hashProduction).getUpcs().toString());
	
			log.log(Level.INFO, "outputMessage: " + out.toString());
			sendToAll(out.toString(), session, hashProduction);
		}
		
		
	}

	/**
	 * Send to all connected users in web socket server
	 * 
	 * @param Strign
	 *            message : A message in JSON format
	 */
	private void sendToAll(String message, Session session, String hashProduction) {
		try {
			synchronized (mapUserAndConf.get(hashProduction)) {
				for (User u : mapUserAndConf.get(hashProduction).getUsers()) {
					if (Boolean.TRUE.equals(u.getSession().getUserProperties().get(hashProduction)))
						u.getSession().getBasicRemote().sendText(message);
				}
			}
		} catch (IOException ex) {
			// TODO Exception
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
	 * Find the UserProductionConfiguration from data base
	 * 
	 * @param long idUser : User id
	 * @param String hashProduction : Production url
	 * @return UserProductionConfiguration: One user object
	 */
	private UserProductionConfiguration findUserProductionConfiguration(long idUser, String hashProduction) {
		return dao.getUserProductionConfigurationByidUserAndHashProduction(idUser, hashProduction);
	}
	
	/**
	 * Find the user from data base
	 * 
	 * @param long idRPC : RubricProductionConfiguration id
	 * @return RubricProductionConfiguration: One RubricProductionConfiguration object
	 */
	private RubricProductionConfiguration findRubricProductionConfiguration(long idRPC) {
		return dao.getRubricProductionConfiguration(idRPC);
	}

	/**
	 * Find the user from Web Socket session
	 * 
	 * @param Session session : Web socket session
	 * @return User object
	 */
	private User findUserFromSession(Session session, String hashProduction) {
		User user = null;
		for (User u : mapUserAndConf.get(hashProduction).getUsers()) {
			String idSesssion = u.getSession().getId();
			if (idSesssion.equals(session.getId()))
				user = u;
		}
		return user;
	}
	
	/**
	 * Find the UserProductionConfiguration  user from Web Socket session
	 * 
	 * @param Session session : Web socket session
	 * @return User object
	 */
	private UserProductionConfiguration findUserProductionConfigurationFromSession(Session session, String hashProduction) {
		UserProductionConfiguration uPC = null;
		for (UserProductionConfiguration upc : mapUserAndConf.get(hashProduction).getUpcs()) {
			String idSesssion = upc.getUser().getSession().getId();
			if (idSesssion.equals(session.getId()))
				uPC = upc;
		}
		return uPC;
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
	 * Find the Production from data base
	 * 
	 * @param String hashProduction : Production URL
	 * @return Production: One Production object
	 */
	
	private List<UserRubricStatus> findUserRubricStatusFromDataBase(Long idProduction) {
		return dao.getUserRubricStatusByidProduction(idProduction);
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
		UserProductionConfiguration uPC = findUserProductionConfigurationFromSession(session, hashProduction);
		InputMessage input = null;
		
		if(uPC != null) {
			User user = uPC.getUser();
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
				dao.persistMessage(message);
				input.setMessage(message);
				
				// To maintain the relationship between the messages exchanged during production
				
				Production production = mapUserAndConf.get(hashProduction).getProduction();
				production.addInputMessage(input);
				dao.mergeProduction(production);
				
			}else if(input.getType().equals(Type.FINISH_RUBRIC.toString())) {
				
				JsonParser parser = new JsonParser();
				JsonObject objeto = parser.parse(jsonMessage).getAsJsonObject();
				RubricProductionConfiguration rPC = new RubricProductionConfiguration();
				rPC = gson.fromJson(objeto.get("rubricProductionConfiguration").toString(), RubricProductionConfiguration.class);
				
				rPC = findRubricProductionConfiguration(rPC.getId());				
				
				Rubric rubric = rPC.getRubric();
				
				Production production = mapUserAndConf.get(hashProduction).getProduction();
				
				UserRubricStatus userRubricStatus = new UserRubricStatus();
				userRubricStatus.setConsent(true);
				userRubricStatus.setSituation(Situation.FINALIZED);
				userRubricStatus.setUser(user);
				userRubricStatus.setRubric(rubric);
				userRubricStatus.setProduction(production);
				dao.persistUserRubricStatus(userRubricStatus);
				
				mapUserAndConf.get(hashProduction).addUserRubricStatus(userRubricStatus);
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
	private OutputMessage registerUser(String idUser, Session session, String hashProduction) {

		InputMessage input = new InputMessage();
		input.setType(Type.CONNECT.name());
		Calendar cal = Calendar.getInstance();
		Timestamp time = new Timestamp(cal.getTimeInMillis());
		input.setDate(time);
		
		// Get the user from the data base in the login
		User user = null;		
		UserProductionConfiguration uPC = findUserProductionConfiguration(Long.parseLong(idUser), hashProduction);
						
		if(uPC != null) {
			uPC.getUser().setSession(session);
			//uPC.getUser().setSoundColor(genereteSoundColor());
			mapUserAndConf.get(hashProduction).addUpc(uPC);
			user = uPC.getUser();
		} else {
			user = findUserFromDataBase(Long.parseLong(idUser));
			user.setSession(session);
			user.setSoundColor(genereteSoundColor());
		}

		// Assign the user to the input
		input.setUser(user);
		
		// Add the user in the WS connected users
		mapUserAndConf.get(hashProduction).addUser(user);

		// Sets a new sound color for other user
		countSoundColor++;
		dao.persistInputMessage(input);

		OutputMessage out = new OutputMessage();
		out.setType(Type.CONNECT.name());
		out.addData("size", String.valueOf(mapUserAndConf.get(hashProduction).getUpcs().size()));
		out.addData("userProductionConfigurations", mapUserAndConf.get(hashProduction).getUpcs().toString());
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