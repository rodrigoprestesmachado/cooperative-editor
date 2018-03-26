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

import java.util.ArrayList;
import java.util.List;

public class UsersAndConfigurarion {

	private List<User> users;
	private List<UserProductionConfiguration> upcs;
	private List<UserRubricStatus> userRubricStatuss;

	public UsersAndConfigurarion() {
		super();
		this.users = new ArrayList<User>();
		this.upcs = new ArrayList<UserProductionConfiguration>();
		this.userRubricStatuss = new ArrayList<UserRubricStatus>();
	}

	public List<User> getUsers() {
		return users;
	}

	public void addUser(User user) {
		this.users.add(user);
	}

	public List<UserProductionConfiguration> getUpcs() {
		return upcs;
	}

	public void addUpc(UserProductionConfiguration urc) {
		this.upcs.add(urc);
	}

	public UserProductionConfiguration getUpc(Long id) {
		for (UserProductionConfiguration up : upcs) {
			if (up.getId() == id)
				return up;
		}
		return null;
	}

	public List<UserRubricStatus> getUserRubricStatuss() {
	 	return this.userRubricStatuss;
	}
	
	public void addUserRubricStatus(UserRubricStatus userRubricStatus) {
		this.userRubricStatuss.add(userRubricStatus);
	}
	
}
