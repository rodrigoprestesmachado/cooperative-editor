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

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "rubric_production_configuration")
public class RubricProductionConfiguration implements Serializable {

	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private Integer minimumTickets;
	
	private Integer limitTickets;
	
	private Integer ticketsUsed;
	
	private Status status;
	
	@ManyToOne
	@JoinColumn(name = "production_id", nullable = false, unique = false)
	private Production production;
	
	@ManyToOne
	@JoinColumn(name = "rubric_id", nullable = false, unique = false)
	private Rubric rubric;

	public RubricProductionConfiguration() {
		super();
		this.status = Status.FREE;
		this.minimumTickets = 0;
		this.limitTickets = 0;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public int getMinimumTickets() {
		return minimumTickets;
	}

	public void setMinimumTickets(Integer minimumTickets) {
		this.minimumTickets = minimumTickets;
	}

	public int getLimitTickets() {
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

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Rubric getRubric() {
		return rubric;
	}

	public void setRubric(Rubric rubric) {
		this.rubric = rubric;
	}

	public Production getProduction() {
		return production;
	}

	public void setProduction(Production production) {
		this.production = production;
	}

	@Override
	public String toString() {
		return " { \"id\":\"" + id + "\", \"minimumTickets\":\"" + minimumTickets
				+ "\", \"limitTickets\":\"" + limitTickets + "\", \"status\":\"" + status + "\", \"rubric\": " + rubric.toString()
				+ ", \"production\": { \"id\" : \"" + production.getId() + "\"} }";
	}

}