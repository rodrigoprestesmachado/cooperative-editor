package edu.ifrs.cooperativeeditor.model;

import java.util.ArrayList;
import java.util.List;

public class UsersAndConfigurarion {

	private List<User> users;
	private List<UserProductionConfiguration> upcs;
	private List<UserRubricStatus> userRubricStatuss;
	private Production production;

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
	
	public void setUserRubricStatuss(List<UserRubricStatus> userRubricStatuss) {
	 	this.userRubricStatuss = userRubricStatuss;
	}

	public List<UserRubricStatus> getUserRubricStatuss() {
	 	return this.userRubricStatuss;
	}
	
	public void addUserRubricStatus(UserRubricStatus userRubricStatus) {
		this.userRubricStatuss.add(userRubricStatus);
	}

	public Production getProduction() {
		return production;
	}

	public void setProduction(Production production) {
		this.production = production;
	}
	
}
