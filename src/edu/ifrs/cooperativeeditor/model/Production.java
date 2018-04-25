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

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "production")
public class Production implements Serializable {

	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "objective", length = 2147483647)
	private String objective;

	private String url;

	private Calendar startOfProduction;

	private Integer productionTime;

	private Integer minimumTickets;

	private Integer limitTickets;

	private Integer ticketsUsed;

	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private User owner;

	@OneToMany(mappedBy = "production", targetEntity = UserProductionConfiguration.class, fetch = FetchType.LAZY)
	private List<UserProductionConfiguration> userProductionConfigurations;

	@OneToMany(mappedBy = "production", targetEntity = TextMessage.class)
	private List<TextMessage> textMessages;

	@OneToMany(mappedBy = "production", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST, targetEntity = RubricProductionConfiguration.class)
	private List<RubricProductionConfiguration> rubricProductionConfigurations;

	@OneToMany(mappedBy = "production", targetEntity = Contribution.class,fetch = FetchType.EAGER)
	private List<Contribution> contributions;
	
	private transient List<UserRubricStatus> userRubricStatuss;

	public Production() {
		super();
		this.minimumTickets = 0;
		this.limitTickets = 0;
	}

	public Long getId() {
		return this.id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Calendar getStartOfProduction() {
		return startOfProduction;
	}

	private Long getStartOfProductionToJson() {
		return startOfProduction != null ? startOfProduction.getTimeInMillis() : null;
	}

	public String getObjective() {
		if (objective != null)
			objective = objective.replace('"', '\'');
		return objective;
	}

	public void setObjective(String objective) {
		this.objective = objective;
	}

	public String getUrl() {
		if (url == null)
			return "";
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public void setStartOfProduction(Calendar startOfProduction) {
		this.startOfProduction = startOfProduction;
	}

	public Integer getProductionTime() {
		return productionTime;
	}

	public void setProductionTime(Integer productionTime) {
		this.productionTime = productionTime;
	}

	public User getOwner() {
		return owner;
	}
	
	public Long getOwnerString() {
		Long id = null;
		if(owner != null)
			id = owner.getId();
		return id;
	}

	public void setOwner(User owner) {
		this.owner = owner;
	}

	public List<TextMessage> getTextMessages() {
		return textMessages;
	}

	public void setTextMessages(List<TextMessage> textMessages) {
		this.textMessages = textMessages;
	}

	public void addTextMessage(TextMessage textMessage) {
		if (this.textMessages == null) {
			this.textMessages = new ArrayList<TextMessage>();
		}
		this.textMessages.add(textMessage);
	}

	public List<UserProductionConfiguration> getUserProductionConfigurations() {
		return userProductionConfigurations;
	}

	public void setUserProductionConfigurations(List<UserProductionConfiguration> userProductionConfigurations) {
		this.userProductionConfigurations = userProductionConfigurations;
	}

	public void addUserProductionConfigurations(UserProductionConfiguration contributorAndConfiguration) {
		if (this.userProductionConfigurations == null) {
			this.userProductionConfigurations = new ArrayList<UserProductionConfiguration>();
		}
		this.userProductionConfigurations.add(contributorAndConfiguration);
	}

	public List<RubricProductionConfiguration> getRubricProductionConfigurations() {
		return rubricProductionConfigurations;
	}

	public void setRubricProductionConfigurations(List<RubricProductionConfiguration> rubricProductionConfigurations) {
		this.rubricProductionConfigurations = rubricProductionConfigurations;
	}

	public void addRubricProductionConfigurations(RubricProductionConfiguration rubricAndConfiguration) {
		if (this.rubricProductionConfigurations == null) {
			this.rubricProductionConfigurations = new ArrayList<RubricProductionConfiguration>();
		}
		this.rubricProductionConfigurations.add(rubricAndConfiguration);
	}

	public List<Contribution> getContributions() {
		return contributions;
	}

	public void setContributions(List<Contribution> contributions) {
		this.contributions = contributions;
	}

	public Integer getMinimumTickets() {
		return minimumTickets;
	}

	public void setMinimumTickets(Integer minimumTickets) {
		this.minimumTickets = minimumTickets;
	}

	public Integer getLimitTickets() {
		return limitTickets;
	}

	public void setLimitTickets(Integer limitTickets) {
		this.limitTickets = limitTickets;
	}

	public Integer getTicketsUsed() {
		return ticketsUsed;
	}

	public void setTicketsUsed(Integer ticketsUsed) {
		this.ticketsUsed = ticketsUsed;
	}
	
	public List<UserRubricStatus> getUserRubricStatuss() {
		return userRubricStatuss;
	}

	public void setUserRubricStatus(List<UserRubricStatus> userRubricStatuss) {
		this.userRubricStatuss = userRubricStatuss;
	}
	
	public void addUserRubricStatus(UserRubricStatus userRubricStatus) {
		if(this.userRubricStatuss == null)
			this.userRubricStatuss = new ArrayList<UserRubricStatus>();
		this.userRubricStatuss.add(userRubricStatus);
	}

	@SuppressWarnings("rawtypes")
	private String convertToJson(List list) {
		List<String> contributor = new ArrayList<String>();
		for (Object configuration : list)
			contributor.add(configuration.toString());
		return contributor.toString();
	}

	@Override
	public String toString() {
		return "{\"id\":\"" + id + "\","+
				"\"objective\":\"" + objective + "\","+
				"\"startOfProduction\":\""+ getStartOfProductionToJson() + "\","+
				"\"productionTime\":\"" + getProductionTime() + "\","+
				"\"minimumTickets\":\"" + getMinimumTickets() + "\","+
				"\"limitTickets\":\"" + getLimitTickets()+ "\","+				
				"\"userProductionConfigurations\":" + convertToJson(userProductionConfigurations) + ","+
				"\"rubricProductionConfigurations\":" + convertToJson(rubricProductionConfigurations) + ","+
				"\"contributions\":" + convertToJson(contributions) +"}";
	}
}
