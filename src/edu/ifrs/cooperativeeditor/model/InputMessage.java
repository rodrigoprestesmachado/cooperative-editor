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

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "input_message")
public class InputMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	private String type;

	private Timestamp moment;

	@ManyToOne(cascade = CascadeType.MERGE)
	private User user;

	@ManyToOne(optional = true, cascade = CascadeType.PERSIST)
	private TextMessage message;

	private transient UserRubricStatus userRubricStatus;

	private transient Contribution contribution;

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public Timestamp getDate() {
		return moment;
	}

	public void setDate(Timestamp date) {
		this.moment = date;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public TextMessage getMessage() {
		return message;
	}

	public void setMessage(TextMessage message) {
		this.message = message;
	}

	public UserRubricStatus getUserRubricStatus() {
		return userRubricStatus;
	}

	public void setUserRubricStatus(UserRubricStatus userRubricStatus) {
		this.userRubricStatus = userRubricStatus;
	}

	public Contribution getContribution() {
		return contribution;
	}

	public void setContribution(Contribution contribution) {
		this.contribution = contribution;
	}

	/**
	 * Return the object state in JSON format
	 */
	public String toString() {
		return "{\"textMessage\":\"" + message.getTextMessage() + "\","
		+ "\"time\":\"" + new SimpleDateFormat("HH:mm:ss").format(moment) + "\","
		+ "\"user\":\"" + user.getName() + "\"}";
		
	}

}