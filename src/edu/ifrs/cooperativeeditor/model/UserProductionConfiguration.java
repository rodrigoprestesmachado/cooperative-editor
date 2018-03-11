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

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;


@Entity
@Table(name = "user_production_configuration")
public class UserProductionConfiguration {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String urlMaterial;
	private Boolean sound;
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)	
	private User user;
	@ManyToOne
	@JoinColumn(name = "production_id", nullable = false)
	private Production production;

	public UserProductionConfiguration() {
		super();
	}

	public UserProductionConfiguration(User user, Production production) {
		super();
		this.user = user;
		this.sound = true;
		this.production = production;
	}

	public UserProductionConfiguration(String urlMaterial, User user, Production production) {
		super();
		this.urlMaterial = urlMaterial;
		this.user = user;
		this.sound = true;
		this.production = production;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUrlMaterial() {
		return urlMaterial;
	}

	public void setUrlMaterial(String urlMaterial) {
		this.urlMaterial = urlMaterial;
	}

	public boolean isSound() {
		return sound == null ? true : sound;
	}

	public void setSound(boolean sound) {
		this.sound = sound;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Production getProduction() {
		return production;
	}

	public void setProduction(Production production) {
		this.production = production;
	}

	@Override
	public String toString() {
		return " { \"id\":\"" + id + "\", \"urlMaterial\":\"" + urlMaterial +
				"\", \"sound\":\"" + sound + "\", \"user\" : " + user + ", \"production\" : {\"id\":\"" +  production.getId() +"\"} }";
	}
}
