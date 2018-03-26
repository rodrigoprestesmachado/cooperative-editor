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
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
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

	// @ManyToMany(fetch = FetchType.LAZY)
	// @JoinTable(name = "rubric_production_configuration", joinColumns =
	// @JoinColumn(name = "production_id", referencedColumnName = "id"),
	// inverseJoinColumns = @JoinColumn(name = "rubric_id", referencedColumnName =
	// "id"))
	private transient List<Rubric> rubrics;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "production_input_message", joinColumns = @JoinColumn(name = "production_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "input_message_id", referencedColumnName = "id"))
	private List<InputMessage> inputMessages;

	@OneToMany(mappedBy = "production", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST, targetEntity = RubricProductionConfiguration.class)
	private List<RubricProductionConfiguration> rubricProductionConfigurations;

	@OneToMany(mappedBy = "production", targetEntity = Contribution.class, fetch = FetchType.LAZY)
	private List<Contribution> contributions;

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

	public void setOwner(User owner) {
		this.owner = owner;
	}

	public List<InputMessage> getInputMessages() {
		return inputMessages;
	}

	public void setInputMessages(List<InputMessage> inputMessages) {
		this.inputMessages = inputMessages;
	}

	public void addInputMessage(InputMessage inputMessage) {
		if (this.inputMessages == null) {
			this.inputMessages = new ArrayList<InputMessage>();
		}
		this.inputMessages.add(inputMessage);
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

	public List<Rubric> getRubrics() {
		return rubrics;
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

	@SuppressWarnings("rawtypes")
	private String convertToJson(List list) {
		List<String> contributor = new ArrayList<String>();
		for (Object configuration : list)
			contributor.add(configuration.toString());
		return contributor.toString();
	}

	@Override
	public String toString() {
		return "  { \"id\" : \"" + id + "\"," + "\"objective\" : \"" + objective + "\"," + "\"startOfProduction\" : \""
				+ getStartOfProductionToJson() + "\"," + "\"productionTime\" : \"" + getProductionTime() + "\","
				+ "\"minimumTickets\" : \"" + getMinimumTickets() + "\"," + "\"limitTickets\" : \"" + getLimitTickets()
				+ "\"," + "\"userProductionConfigurations\" : " + convertToJson(userProductionConfigurations) + ","
				+ "\"rubricProductionConfigurations\": " + convertToJson(rubricProductionConfigurations) + " }";
	}
}
