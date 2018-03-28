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
package edu.ifrs.cooperativeeditor.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;


@Entity
@Table(name = "user_production_configuration")
public class UserProductionConfiguration {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String urlMaterial;
	private Boolean soundOn;
	private Integer ticketsUsed;
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)	
	private User user;
	@ManyToOne
	@JoinColumn(name = "production_id", nullable = false)
	private Production production;
	
	@OneToOne
	@JoinColumn(name = "sound_effect_id")
	private SoundEffect soundEffect;

	public UserProductionConfiguration() {
		super();
		this.ticketsUsed = 0;
		this.soundOn = true;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUrlMaterial() {
		return urlMaterial == null ? "" : urlMaterial;
	}

	public void setUrlMaterial(String urlMaterial) {
		this.urlMaterial = urlMaterial;
	}
	
	public Integer getTicketsUsed() {
		return ticketsUsed;
	}

	public void setTicketsUsed(Integer ticketsUsed) {
		this.ticketsUsed = ticketsUsed;
	}

	public boolean isSoundOn() {
		return soundOn;
	}

	public void setSoundOn(boolean sound) {
		this.soundOn = sound;
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
	
	public SoundEffect getSoundEffect() {
		return soundEffect;
	}

	public void setSoundEffect(SoundEffect soundEffect) {
		this.soundEffect = soundEffect;
	}

	@Override
	public String toString() {
		return "{ \"id\":\"" + id + "\", "
			   + "\"urlMaterial\":\"" + getUrlMaterial() +"\","
			   + "\"sound\":\"" + soundOn + "\","
			   + "\"user\" : " + user + ","
			   + "\"ticketsUsed\" : " + ticketsUsed + ","
			   + "\"soundEffect\":"+ getSoundEffect()+","
			   + "\"production\" : {\"id\":\"" +  production.getId() +"\",\"minimumTickets\":\""+production.getMinimumTickets()+"\"}}";
	}
}
