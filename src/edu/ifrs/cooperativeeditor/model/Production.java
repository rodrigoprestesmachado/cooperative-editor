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

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
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
	@OneToMany(mappedBy = "production", targetEntity = UserProductionConfiguration.class, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<UserProductionConfiguration> contributorsAndConfiguration;
	@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JoinTable(name = "rubric_production_configuration", joinColumns = @JoinColumn(name = "production_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "rubric_id", referencedColumnName = "id"))
	private List<Rubric> rubrics;

	@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JoinTable(name = "production_input_message", joinColumns = @JoinColumn(name = "production_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "input_message_id", referencedColumnName = "id"))
	private List<InputMessage> inputMessages;

	@OneToMany(mappedBy = "production", fetch = FetchType.LAZY, targetEntity = RubricProductionConfiguration.class, cascade = CascadeType.ALL)
	private List<RubricProductionConfiguration> rubricsAndConfiguration;

	@OneToMany(mappedBy = "production", targetEntity = Contribution.class, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	private List<Contribution> contributions;

	public Production() {
		super();

	}

	public Production(String objective, Calendar startOfProduction, Integer productionTime, User owner,
			List<Rubric> rubrics) {
		super();
		this.objective = objective;
		this.startOfProduction = startOfProduction;
		this.productionTime = productionTime;
		this.owner = owner;
		this.rubrics = rubrics;
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

	public List<UserProductionConfiguration> getContributorsAndConfiguration() {
		return contributorsAndConfiguration;
	}

	public void setContributorsAndConfiguration(List<UserProductionConfiguration> contributorsAndConfiguration) {
		this.contributorsAndConfiguration = contributorsAndConfiguration;
	}

	public void addContributorsAndConfiguration(UserProductionConfiguration contributorAndConfiguration) {
		if (this.contributorsAndConfiguration == null) {
			this.contributorsAndConfiguration = new ArrayList<UserProductionConfiguration>();
		}
		this.contributorsAndConfiguration.add(contributorAndConfiguration);
	}

	public List<Rubric> getRubrics() {
		return rubrics;
	}

	public List<RubricProductionConfiguration> getRubricsAndConfiguration() {
		return rubricsAndConfiguration;
	}

	public void setRubricsAndConfiguration(List<RubricProductionConfiguration> rubricsAndConfiguration) {
		this.rubricsAndConfiguration = rubricsAndConfiguration;
	}

	public void addRubricsAndConfiguration(RubricProductionConfiguration rubricAndConfiguration) {
		if (this.rubricsAndConfiguration == null) {
			this.rubricsAndConfiguration = new ArrayList<RubricProductionConfiguration>();
		}
		this.rubricsAndConfiguration.add(rubricAndConfiguration);
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

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		result = prime * result + ((url == null) ? 0 : url.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Production other = (Production) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
			return false;
		if (url == null) {
			if (other.url != null)
				return false;
		} else if (!url.equals(other.url))
			return false;
		return true;
	}

	@Override
	public String toString() {

		return " \"production\" : { \"id\" : \"" + id + " \"," + "\"objective\" : \"" + objective + "\","
				+ "\"startOfProduction\" : \"" + getStartOfProduction() + "\"," + "\"productionTime\" : \""
				+ getProductionTime() + "\"," + "\"minimumTickets\" : \"" + getMinimumTickets() + "\","
				+ "\"limitTickets\" : \"" + getLimitTickets() + "\"}" + "\"contributorsAndConfiguration\" : "
				+ contributorsAndConfiguration + "," + "\"rubricsAndConfiguration\": " + rubricsAndConfiguration + " }";
	}

	public String toJson() {
		StringBuilder json = new StringBuilder();
		json.append(" \"production\" : { \"id\" : \"" + id + "\"");
		if (objective != null)
			json.append(",\"objective\" : \"" + getObjective() + "\"");
		if (startOfProduction != null)
			json.append(",\"startOfProduction\" : \"" + startOfProduction.getTimeInMillis() + "\"");
		if (productionTime != null)
			json.append(",\"productionTime\" : \"" + productionTime + "\"");
		if (minimumTickets != null)
			json.append(",\"minimumTickets\" : \"" + minimumTickets + "\"");
		if (limitTickets != null)
			json.append(",\"limitTickets\" : \"" + limitTickets + "\"");
		if (contributorsAndConfiguration != null) {
			List<String> contributor = new ArrayList<String>();
			for (UserProductionConfiguration configuration : contributorsAndConfiguration) {
				contributor.add("{" + configuration.toString() + "}");
			}
			json.append(",\"contributorsAndConfiguration\" : " + contributor.toString() + "");
		}
		if (rubricsAndConfiguration != null) {
			List<String> contributor = new ArrayList<String>();
			for (RubricProductionConfiguration configuration : rubricsAndConfiguration) {
				contributor.add("{" + configuration.toString() + "}");
			}
			json.append(",\"rubricsAndConfiguration\": " + contributor.toString() + "");
		}

		json.append("}");

		return json.toString();
	}
}
