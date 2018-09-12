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

import java.util.Date;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "contribution")
public class Contribution {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;
	private Date moment;
	@ManyToOne
	@JoinColumn(name="production_id", nullable=false)
	private Production production;
	private long card;
	@ManyToOne
	@JoinColumn(name="user_id", nullable=false)
	private User user;
	@ManyToOne(cascade = CascadeType.ALL)
	@JoinColumn(name="content_id", nullable=false)
	private Content content;
		
	public Contribution() {
		super();
		this.card = 0;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Date getMoment() {
		return moment;
	}

	public void setMoment(Date moment) {
		this.moment = moment;
	}

	public Production getProduction() {
		return production;
	}

	public void setProduction(Production production) {
		this.production = production;
	}

	public long getCard() {
		return card;
	}

	public void setCard(long card) {
		this.card = card;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Content getContent() {
		return content;
	}

	public void setContent(Content content) {
		this.content = content;
	}
	
	@Override
	public String toString() {
		return "{\"user\" : {\"id\":\"" +  user.getId() +"\", \"name\":\"" +  user.getName() +"\" },"
			   + "\"content\" : \"" + content.getText() + "\","
		       + "\"original\" : \"" + content.getOriginal() + "\","
			   + "\"production\" : {\"id\":\"" +  production.getId() +"\"}}";
	}	
	
}
