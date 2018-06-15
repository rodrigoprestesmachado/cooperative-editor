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
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;

@Entity
@Table(name = "rubric")
public class Rubric implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@Column(name = "objective", length = 2147483647)
	private String objective;
	@ElementCollection
	@CollectionTable(name = "rubric_descriptors", joinColumns = @JoinColumn(name = "rubric_id", referencedColumnName = "id"))
	@Column(name = "descriptors")
	private List<String> descriptors;
	@ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
	@JoinTable(name = "rubric_owner", joinColumns = @JoinColumn(name = "rubric_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"))
	private List<User> owners;

	@OneToMany(mappedBy = "rubric", targetEntity = UserRubricStatus.class, fetch = FetchType.LAZY)
	private List<UserRubricStatus> userRubricStatus;

	public Rubric() {
		super();
	}

	public Rubric(String objective, List<String> descriptors, User owner) {
		super();
		this.objective = objective;
		this.descriptors = descriptors;
		this.owners = new ArrayList<User>();
		this.owners.add(owner);
		this.descriptors = new ArrayList<String>();
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public boolean isIdNull() {
		return this.id == null || this.id == 0;
	}

	public String getObjective() {
		if (objective != null)
			objective = objective.replace('"', '\'');
		return objective;
	}

	public void setObjective(String objective) {
		this.objective = objective;
	}

	public List<String> getDescriptors() {
		return descriptors;
	}

	public void setDescriptors(List<String> descriptors) {
		this.descriptors = descriptors;
	}

	public void addOwner(User owner) {
		if (this.owners == null) {
			this.owners = new ArrayList<User>();
		}
		this.owners.add(owner);
	}

	public List<User> getOwners() {
		return owners;
	}

	public void setOwners(List<User> owners) {
		this.owners = owners;
	}

	public List<UserRubricStatus> getUserRubricStatus() {
		return userRubricStatus;
	}

	public void setUserRubricStatus(List<UserRubricStatus> userRubricStatus) {
		this.userRubricStatus = userRubricStatus;
	}
	
	public void addUserRubricStatus(UserRubricStatus userRubricStatus) {
		if(this.userRubricStatus == null)
			this.userRubricStatus = new ArrayList<UserRubricStatus>();
		this.userRubricStatus.add(userRubricStatus);
	}
	
	private String userRubricStatusToJson() {
		String strStatus = "";
		List<String> userRubricStatus = new ArrayList<String>();
		if ( this.userRubricStatus != null) {
			for (UserRubricStatus uRS : this.userRubricStatus)
				userRubricStatus.add(uRS.toString());
			if(!this.userRubricStatus.isEmpty())
				strStatus = ",\"userRubricStatuss\":"+userRubricStatus.toString();
		}
		return strStatus;
	}

	@Override
	public String toString() {
		List<String> desc = new ArrayList<String>();
		for (String string : descriptors) {
			desc.add("\"" + string.replace('"', '\'') + "\"");
		}

		return "{ \"id\":\"" + id + "\", \"objective\":\"" + getObjective() + "\", \"descriptors\":" + desc.toString()
				+userRubricStatusToJson()+"}";
	}

}
