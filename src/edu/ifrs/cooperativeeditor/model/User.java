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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.websocket.Session;

import com.google.gson.annotations.Expose;

@Entity
@Table(name = "user")
public class User implements Serializable {

	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;
	private String email;
	private String soundColor;
	private String password;
	private transient ArrayList<InputMessage> inputs;
	private transient ArrayList<OutputMessage> outputs;
	private transient Session session;
	@Expose(serialize = false)
	@OneToMany(mappedBy = "user", fetch = FetchType.LAZY, targetEntity = UserProductionConfiguration.class, cascade = CascadeType.ALL)
	private List<UserProductionConfiguration> userProductionConfigurations;

	public User(Long id) {
		this.id = id;
	}

	public User() {
		this.inputs = new ArrayList<>();
		this.outputs = new ArrayList<>();
	}

	public boolean isIdNull() {
		return this.id == null || this.id == 0;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		if (name != null)
			name = name.replace('"', '\'');
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getSoundColor() {
		return soundColor;
	}

	public void setSoundColor(String soundColor) {
		this.soundColor = soundColor;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Session getSession() {
		return session;
	}

	public void setSession(Session session) {
		this.session = session;
	}

	public void addInputMessage(InputMessage input) {
		this.inputs.add(input);
	}

	public void addOutputMessage(OutputMessage output) {
		this.outputs.add(output);
	}

	public List<UserProductionConfiguration> getUserProductionConfigurations() {
		return userProductionConfigurations;
	}

	public void setUserProductionConfigurations(List<UserProductionConfiguration> userProductionConfigurations) {
		this.userProductionConfigurations = userProductionConfigurations;
	}

	private String userProductionConfigurationsToString() {
		if (this.userProductionConfigurations == null || this.userProductionConfigurations.isEmpty()) {
			return "";
		} else {
			return ", \"url\" : \"" + this.userProductionConfigurations.get(0).getUrlMaterial() + "\""
				 + ", \"sound\" : \""+ this.userProductionConfigurations.get(0).isSound() + "\""
				 + ", \"minimumTickets\" : \""+ this.userProductionConfigurations.get(0).getProduction().getMinimumTickets()+ "\""
				 + ", \"limitTickets\" : \""+ this.userProductionConfigurations.get(0).getProduction().getLimitTickets()+ "\"";
		}
	}

	@Override
	public String toString() {
		return " { \"id\":\"" + id + "\", \"name\":\"" + getName() + "\", \"email\":\"" + email + "\" "
				+ userProductionConfigurationsToString() + "}";
	}

}