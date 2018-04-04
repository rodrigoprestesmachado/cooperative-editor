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
package edu.ifrs.cooperativeeditor.webservice;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.EJB;
import javax.ejb.Stateless;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import edu.ifrs.cooperativeeditor.dao.DataObject;
import edu.ifrs.cooperativeeditor.mail.EmailClient;
import edu.ifrs.cooperativeeditor.model.MyDateTypeAdapter;
import edu.ifrs.cooperativeeditor.model.Production;
import edu.ifrs.cooperativeeditor.model.Rubric;
import edu.ifrs.cooperativeeditor.model.RubricProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.SoundEffect;
import edu.ifrs.cooperativeeditor.model.User;
import edu.ifrs.cooperativeeditor.model.UserProductionConfiguration;

@Path("/form")
@Stateless
public class FormWebService {

	private static final Logger log = Logger.getLogger(FormWebService.class.getName());

	public static final String URL = "http://localhost:8080/CooperationEditor/editor/";

	@EJB
	private DataObject dao;

	@Context
	private HttpServletRequest request;
	
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/peoplesuggestion/{partemail}")
	public String peopleSuggestion(@PathParam("partemail") String partEmail) {

		StringBuilder json = new StringBuilder();

		if (!"".equals(partEmail)) {

			List<User> result = dao.getUsersByPartEmail(partEmail);

			StringBuilder strReturn = new StringBuilder();
			strReturn.append("[ ");

			for (User user : result) {
				strReturn.append("{");
				strReturn.append("\"id\":");
				strReturn.append("\"" + user.getId() + "\",");
				strReturn.append("\"name\":");
				if (user.getName() == null) {
					strReturn.append("\"" + user.getEmail() + "\"");
				} else {
					strReturn.append("\"" + user.getName() + "\"");
				}

				strReturn.append("}");
				strReturn.append(",");
			}

			json.append(strReturn.substring(0, strReturn.length() - 1));
			json.append("]");

		}
		log.log(Level.INFO, "Web service return of /peoplesuggestion: " + json.toString());
		return json.toString();
	}

	/**
	 * rubric person search by the goal
	 * 
	 * @param partobjective
	 */
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/rubricsuggestion/{partobjective}")
	public String rubricSuggestion(@PathParam("partobjective") String partObjective) {

		StringBuilder json = new StringBuilder();

		if (!"".equals(partObjective)) {

			List<Rubric> result = dao.getRubricsByPartObjctive(partObjective);

			StringBuilder strReturn = new StringBuilder();
			strReturn.append("[ ");

			for (Rubric rubric : result) {
				strReturn.append("{");
				strReturn.append("\"id\":");
				strReturn.append("\"" + rubric.getId() + "\",");
				strReturn.append("\"name\":");
				strReturn.append("\"" + rubric.getObjective().replace('"', '\'') + "\"");
				strReturn.append("}");
				strReturn.append(",");
			}

			json.append(strReturn.substring(0, strReturn.length() - 1));
			json.append("]");

		}
		log.log(Level.INFO, "Web service return of /rubricsuggestion: " + json.toString());
		return json.toString();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/getrubric/{rubricId}")
	public String getRubric(@PathParam("rubricId") Long rubricId) {

		StringBuilder json = new StringBuilder();

		if (rubricId != null) {
			Rubric rubric = dao.getRubric(rubricId);
			json.append(rubric.toString());
		}
		log.log(Level.INFO, "Web service return of /getrubric: " + json.toString());
		return json.toString();
	}

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/getproduction/{productionId}")
	public String getProduction(@PathParam("productionId") Long productionId) {
		Production production = dao.getProduction(productionId);
		log.log(Level.INFO, "Web service return of /getproduction: " + production.toString());
		return production.toString();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/partialSubmit")
	public String partialSubmit(String jsonMessage) {
		log.log(Level.INFO, "Web  " + jsonMessage);
		
		Gson gson = new GsonBuilder().registerTypeAdapter(Calendar.class, new MyDateTypeAdapter()).create();
		Production production = new Production();
		production = gson.fromJson(jsonMessage, Production.class);

		User user = new User((long) request.getSession().getAttribute("userId"));
		production.setOwner(user);

		if (production.getId() == null)
			dao.persistProduction(production);
		else
			production = dao.mergeProduction(production);

		log.log(Level.INFO, "Web service return of /partialSubmit: " + production.getId());
		return "{ \"id\": \"" + production.getId().toString() + "\" }";
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/saveProduction")
	public String saveProduction(String jsonMessage) {
		
		log.log(Level.INFO, "entrou" + jsonMessage);

		Gson gson = new GsonBuilder().registerTypeAdapter(Calendar.class, new MyDateTypeAdapter()).create();
		Production production = new Production();
		production = gson.fromJson(jsonMessage, Production.class);

		MessageDigest md = null;
		try {
			md = MessageDigest.getInstance("MD5");
		} catch (NoSuchAlgorithmException e) {
			// TODO Exception
			e.printStackTrace();
		}
		String url = new BigInteger(1, md.digest(production.getObjective().getBytes())).toString(16);

		production.setUrl(url);

		User user = new User((long) request.getSession().getAttribute("userId"));
		production.setOwner(user);

		if (production.getId() == null)
			dao.persistProduction(production);
		else
			dao.mergeProduction(production);
		
		//TODO DO not remove, it will be used in future
		//initializesUserRubricStatus(production);

		production = dao.getProduction(production.getId());
		
		// Invite users
		this.sendEmail(production);

		log.log(Level.INFO, "Web service return of /saveProduction { \"isProductionValid\":" + true + ",\"url\" : \""
				+ production.getUrl() + "\"}");

		return "{ \"isProductionValid\":" + true + ",\"url\" : \"" + production.getUrl() + "\"}";
	}
	
	/**
	 * Sends the invitation to the users
	 * 
	 * @param production
	 */
	private void sendEmail(Production production) {
		// Localization
		Locale locale = request.getLocale();
		ResourceBundle localization = ResourceBundle.getBundle("MessagesBundle", locale);
		
		String addressUser = "";
		for (UserProductionConfiguration configuration : dao.getUserProductionConfigurationByProductionId(production.getId()))
			addressUser += configuration.getUser().getEmail() + ",";
		
		addressUser = addressUser.substring(0, addressUser.length() - 1);
		
		EmailClient emailClient = new EmailClient();
		String title = localization.getString("EmailService.title");
		String emailMessage = localization.getString("EmailService.emailMessage");
		SimpleDateFormat format = new SimpleDateFormat("dd/MM/yyyy - hh:mm aa");
		String startTime = format.format(production.getStartOfProduction().getTime());
		emailClient.sendEmail(title, addressUser, emailMessage, startTime, URL + production.getUrl());
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/rubricProductionConfiguration")
	public String rubricProductionConfiguration(String jsonMessage) {

		Gson gson = new Gson();
		RubricProductionConfiguration configuration = new RubricProductionConfiguration();
		configuration = gson.fromJson(jsonMessage, RubricProductionConfiguration.class);
		
		User user = dao.getUser((long) request.getSession().getAttribute("userId"));

		if (configuration.getProduction() == null) {
			Production production = new Production();
			production.setOwner(user);
			configuration.setProduction(production);
			dao.persistProduction(configuration.getProduction());
		} else {
			Long idProduction = configuration.getProduction().getId();
			configuration.setProduction(dao.getProduction(idProduction));
		}

		if (configuration.getRubric().isIdNull()) {
			configuration.getRubric().addOwner(user);
			dao.persistRubric(configuration.getRubric());
		} else {
			configuration.setRubric(dao.mergeRubric(configuration.getRubric()));
		}

		if (configuration.getId() == null)
			dao.persistRubricProductionConfiguration(configuration);
		else
			configuration = dao.mergeRubricProductionConfiguration(configuration);
	
		
		log.log(Level.INFO, "Web service return of /rubricProductionConfiguration: " + configuration.toString());
		return configuration.toString();
	}

	@POST
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes(MediaType.APPLICATION_JSON)
	@Path("/userProductionConfiguration")
	public String userProductionConfiguration(String jsonMessage) {

		// System.out.println("userProductionConfiguration " + jsonMessage);
		Gson gson = new Gson();
		UserProductionConfiguration configuration = new UserProductionConfiguration();
		configuration = gson.fromJson(jsonMessage, UserProductionConfiguration.class);

		if (configuration.getProduction() == null) {
			Production production = new Production();
			User user = new User((long) request.getSession().getAttribute("userId"));
			production.setOwner(user);
			configuration.setProduction(production);
			dao.persistProduction(production);
		}

		if (configuration.getUser().isIdNull()) {
			User user = dao.getUser(configuration.getUser().getEmail());
			if (user != null)
				configuration.setUser(user);
			else
				configuration.setUser(dao.mergerUser(configuration.getUser()));
		} else
			configuration.setUser(dao.getUser(configuration.getUser().getId()));
		
		if(configuration.getSoundEffect() == null) {
			Long idProduction = configuration.getProduction().getId();
			Long idUser = configuration.getUser().getId();
			configuration.setSoundEffect(genereteSoundEffect(idUser,idProduction));
		}

		if (configuration.getId() == null)
			dao.persistUserProductionConfiguration(configuration);
		else
			configuration = dao.mergeUserProductionConfiguration(configuration);

		log.log(Level.INFO, "Web service return of /userProductionConfiguration: " + configuration.toString());
		return configuration.toString();
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/deleteRubric/{rubricId}")
	public String deleteRubric(@PathParam("rubricId") Long rubricId) {
		
		List<RubricProductionConfiguration> result = dao.getRubricProductionConfigurationByRubricId(rubricId);

		for (RubricProductionConfiguration configuration : result)
			dao.removeRubricProductionConfiguration(configuration);

		Rubric rubric = dao.getRubric(rubricId);
		if (rubric != null) {
			rubric.setId(rubricId);
			dao.removeRubric(rubric);
		}
		return "\"OK\"";
	}

	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/disconnectRubric/{rubricProductionConfigurationId}")
	public String disconnectRubric(@PathParam("rubricProductionConfigurationId") Long configurationId) {
		RubricProductionConfiguration configuration = dao.getRubricProductionConfiguration(configurationId);
		if (configuration != null)
			dao.removeRubricProductionConfiguration(configuration);
		return "\"OK\"";
	}
	
	
	@DELETE
	@Produces(MediaType.APPLICATION_JSON)
	@Consumes({ MediaType.TEXT_XML, MediaType.WILDCARD, MediaType.TEXT_PLAIN })
	@Path("/disconnectUserProductionConfiguration/{userProductionConfigurationId}")
	public String disconnectUserProductionConfiguration(@PathParam("userProductionConfigurationId") Long configurationId) {
		UserProductionConfiguration configuration = dao.getUserProductionConfiguration(configurationId);
		if (configuration != null)
			dao.removeUserProductionConfiguration(configuration);
		return "\"OK\"";
	}
	
	/**
	 * Generates sound color
	 * 
	 * @return SoundEffect : A SoundEffect
	 */
	private SoundEffect genereteSoundEffect(Long userId,Long idProduction) {
		List<SoundEffect> soundEffects = dao.getSoundEffectNotInProduction(idProduction);
		Long idSoundEffect;
		int sizeSoundEffect = soundEffects.size();
		if(sizeSoundEffect < userId) {
			idSoundEffect = (userId % sizeSoundEffect);
		}else {
			idSoundEffect = userId - 1;
		}
		
		return soundEffects.get(idSoundEffect.intValue());
	}
	
	//TODO DO not remove, it will be used in future
	/**
	 * Initializes UserRubricStatus
	 * 
	 * @param production
	private void initializesUserRubricStatus(Production production) {
		List<UserProductionConfiguration> uPCs =  dao.getUserProductionConfigurationByProductionId(production.getId());
		
		for (RubricProductionConfiguration rPC : dao.getRubricProductionConfigurationByProductionId(production.getId())) {
			for (UserProductionConfiguration uPC : uPCs) {
				UserRubricStatus status = new UserRubricStatus();
				status.setRubric(rPC.getRubric());
				status.setProduction(production);
				status.setSituation(Situation.FREE);			
				status.setUser(uPC.getUser());
				dao.persistUserRubricStatus(status);
			}			
		} 
	}
	 */
}