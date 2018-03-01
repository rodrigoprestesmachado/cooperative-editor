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
package edu.ifrs.cooperativeeditor.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ConvertFromJson {

	private Long idProduction;
	private String objective;
	private Integer productionTime = 1;
	private User owner;
	private Long data;
	private Long time;
	private List<User> participates;
	private List<Rubric> rubricts;
	private Rubric rubric;
	private Long startOfProduction;
	private Long configurationId;

	public ConvertFromJson(String json) {
		Gson gson = new Gson();
		JsonParser parser = new JsonParser();
		JsonObject objeto = parser.parse(json).getAsJsonObject();

		// Are involved by "try" because if the attribute does not exist, an exception
		// is thrown
		try {
			this.idProduction = objeto.get("id").getAsLong();
		} catch (Exception e) {
		}
		
		try {
			this.idProduction = objeto.get("productionId").getAsLong();
		} catch (Exception e) {
		}
		
		try {
			this.objective = objeto.get("objective").toString();
		} catch (Exception e) {
		}
		
		try {
			owner = new User();
			owner.setId((long) 1);
			if (objeto.get("participatInProduction").getAsBoolean()) {
				// Falta implementar
				// this.participate.add(owner);
			}
		} catch (Exception e) {
		}
		
		try {
			this.productionTime = objeto.get("productionTime").getAsInt();
		} catch (Exception e) {
		}
		
		try {
			this.data = objeto.get("data").getAsLong();
		} catch (Exception e) {
		}
		
		try {
			this.time = objeto.get("time").getAsLong();
		} catch (Exception e) {
		}
		
		try {
			this.configurationId = objeto.get("configurationId").getAsLong();
		} catch (Exception e) {
		}

		try {
			this.startOfProduction = objeto.get("startOfProduction").getAsLong();
		} catch (Exception e) {
		}
		
		try {
			User[] user = gson.fromJson(objeto.get("participate").toString(), User[].class);
			this.participates = Arrays.asList(user);
		} catch (Exception e) {
		}
		
		String rubricsInString = "";
		try {
			rubricsInString = objeto.get("rubricts").toString();
			JsonArray jsonRubrics = parser.parse(rubricsInString).getAsJsonArray();
			for (int i = 0; i < jsonRubrics.size(); i++) {
				Rubric rubric = new Rubric();
				JsonObject jsonRubric = jsonRubrics.get(i).getAsJsonObject();
				rubric.setObjective(jsonRubric.get("objective").toString());
				String[] descriptors = gson.fromJson(jsonRubric.get("descriptors").toString(), String[].class);
				rubric.setDescriptors(Arrays.asList(descriptors));
				this.addRubricts(rubric);
			}
		} catch (Exception e) {
			
		}
		
		try {
			this.rubric = gson.fromJson(objeto.get("rubric").toString(),Rubric.class);	
		}catch (Exception e) {			
		}
	}

	public Long getIdProduction() {
		return idProduction;
	}

	public String getObjective() {
		return objective;
	}

	public Integer getproductionTime() {
		return productionTime;
	}

	public User getOwner() {
		return owner;
	}
	
	public Rubric getRubric() {
		if(this.rubric == null)
			this.rubric = new Rubric();
		return this.rubric;
	}
	
	public Long getConfigurationId() {
		return this.configurationId;
	}

	public Calendar getStartOfProduction() {
		Calendar calendar = Calendar.getInstance();

		if (startOfProduction != null) {
			calendar.setTimeInMillis(startOfProduction);
		}

		if (data != null && time != null) {

			calendar.setTimeInMillis(data);

			int year = calendar.get(Calendar.YEAR);
			int month = calendar.get(Calendar.MONTH);
			int dayOfMonth = calendar.get(Calendar.DAY_OF_MONTH);

			calendar.setTimeInMillis(time);

			int hourOfDay = calendar.get(Calendar.HOUR_OF_DAY);
			int minute = calendar.get(Calendar.MINUTE);
			calendar = new GregorianCalendar(year, month, dayOfMonth, hourOfDay, minute, 0);

		}

		return calendar;
	}

	public List<User> getParticipates() {
		if (this.participates == null) {
			this.participates = new ArrayList<User>();
		}
		return participates;
	}

	public List<Rubric> getRubricts() {
		if (this.rubricts == null) {
			this.rubricts = new ArrayList<Rubric>();
		}
		return rubricts;
	}

	private void addRubricts(Rubric rubric) {
		if (this.rubricts == null) {
			this.rubricts = new ArrayList<Rubric>();
		}
		this.rubricts.add(rubric);
	}

}
