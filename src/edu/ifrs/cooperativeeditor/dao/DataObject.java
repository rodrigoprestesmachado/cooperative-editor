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
package edu.ifrs.cooperativeeditor.dao;

import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import edu.ifrs.cooperativeeditor.model.Contribution;
import edu.ifrs.cooperativeeditor.model.InputMessage;
import edu.ifrs.cooperativeeditor.model.Production;
import edu.ifrs.cooperativeeditor.model.Rubric;
import edu.ifrs.cooperativeeditor.model.RubricProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.SoundEffect;
import edu.ifrs.cooperativeeditor.model.TextMessage;
import edu.ifrs.cooperativeeditor.model.User;
import edu.ifrs.cooperativeeditor.model.UserProductionConfiguration;
import edu.ifrs.cooperativeeditor.model.UserRubricStatus;

/**
 * Data access object
 * 
 * @author Rodrigo Prestes Machado
 */
@Stateless
public class DataObject {

	@PersistenceContext(unitName = "CooperativeEditor")
	private EntityManager em;
	
	/**
	 * Return a user from data base
	 * 
	 * @param long: The user id
	 * @return User: the user object
	 */
	public Long countSoundEffect() {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<Long> criteria = builder.createQuery(Long.class);
		Root<SoundEffect> root = criteria.from(SoundEffect.class);
		criteria.select(builder.count(root));
		
		try {
			return em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 *  Return a user from data base
	 *  
	 * @param Object indexer : The indexer can be the user's id or e-mail
	 * @return User: the user object
	 */	
	public Contribution getLastContribution(String hashProduction) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<Contribution> criteria = builder.createQuery(Contribution.class);
		Root<Contribution> contribution = criteria.from(Contribution.class);
		Join<Contribution, Production> production = contribution.join("production");		
		criteria.where(builder.equal(production.get("url"), hashProduction));
		criteria.orderBy(builder.desc(contribution.get("id")));
		
		return em.createQuery(criteria).setMaxResults(1).getSingleResult();
	}

	/**
	 *  Return a user from data base
	 *  
	 * @param Object indexer : The indexer can be the user's id or e-mail
	 * @return User: the user object
	 */
	public User getUser(Object indexer) {
		String column = (indexer instanceof String) ? "email" : "id";
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<User> criteria = builder.createQuery(User.class);
		Root<User> root = criteria.from(User.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get(column), indexer));
		try {
			return em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return a user from data base
	 * 
	 * @param String: The user e-mail
	 * @return User: the user object
	 */
	public User getUser(String email, String password) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<User> criteria = builder.createQuery(User.class);
		Root<User> root = criteria.from(User.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("email"), email), builder.equal(root.get("password"), password));
		try {
			return em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return a user from data base
	 * 
	 * @param Long: The user userId
	 * @param String: The hash production userId
	 * @return User: the user object
	 */
	public User getUser(Long userId,String hashProduction) {
		User user = this.getUser(userId);
		UserProductionConfiguration uPC = this.getUserProductionConfigurationByidUserAndHashProduction(user.getId(), hashProduction);
		if(uPC != null)
			user.setUserProductionConfiguration(uPC);
		return user;
	}	

	/**
	 * Retrieve stored messages from the data base
	 * 
	 * @return A JSON representing a collection of stored messages
	 */
	public String getMessages(String hashProduction) {
		
		Production production = this.getProductionByUrl(hashProduction);
		
		StringBuilder json = new StringBuilder();
		json.append("[");
		
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<InputMessage> criteria = builder.createQuery(InputMessage.class);
		Root<InputMessage> inputMessage = criteria.from(InputMessage.class);
		Join<InputMessage, TextMessage> textMessage = inputMessage.join("message");		
		criteria.where(
					builder.equal(inputMessage.get("type"), "SEND_MESSAGE"),
					builder.equal(textMessage.get("production"), production.getId())
					);

		List<InputMessage> result = em.createQuery(criteria).getResultList();

		boolean flag = false;
		for (InputMessage im : result) {
			if (im.getMessage() != null) {
				json.append(im.toString());
				json.append(",");
				flag = true;
			}
		}

		StringBuilder str = new StringBuilder();
		if (flag) {
			str.append(json.substring(0, json.length() - 1));
			str.append("]");
		}
		return str.toString();
	}

	/**
	 * Return users list from data base
	 * 
	 * @param String: The user e-mail part
	 * @return List : The users list
	 */
	public List<User> getUsersByPartEmail(String partEmail) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<User> criteria = builder.createQuery(User.class);
		Root<User> root = criteria.from(User.class);
		criteria.select(root);
		criteria.where(builder.like(root.get("email"), partEmail + "%"));
		try {
			return em.createQuery(criteria).setMaxResults(5).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}

	/**
	 * Return rubrics list from data base
	 * 
	 * @param String: The rubric objective part
	 * @return List : The rubrics list
	 */
	public List<Rubric> getRubricsByPartObjctive(String partObjective) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<Rubric> criteria = builder.createQuery(Rubric.class);
		Root<Rubric> root = criteria.from(Rubric.class);
		criteria.select(root);
		criteria.where(builder.like(root.get("objective"), partObjective + "%"));
		try {
			return em.createQuery(criteria).setMaxResults(5).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return RubricProductionConfigurations list from data base
	 * 
	 * @param String: The Production id
	 * @return List : The RubricProductionConfiguration list
	 */
	public List<RubricProductionConfiguration> getRubricProductionConfigurationByProductionId(long productionId) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<RubricProductionConfiguration> criteria = builder.createQuery(RubricProductionConfiguration.class);
		Root<RubricProductionConfiguration> root = criteria.from(RubricProductionConfiguration.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("production"), productionId));
		try {
			return em.createQuery(criteria).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}

	/**
	 * Return a rubric from data base
	 * 
	 * @param long: The rubric id
	 * @return Rubric: The rubric object
	 */
	public Rubric getRubric(long id) {
		try {
			return em.find(Rubric.class, id);
		} catch (NoResultException e) {
			return null;
		}
	}

	/**
	 * Return a production from data base
	 * 
	 * @param long: The production id
	 * @return Production: The production object
	 */
	public Production getProduction(long id) {
		try {
			return em.find(Production.class, id);
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return a production from data base
	 * 
	 * @param String: The production hash
	 * @return Production: The production object
	 */
	public Production getProductionByUrl(String url) {
		
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<Production> criteria = builder.createQuery(Production.class);
		Root<Production> root = criteria.from(Production.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("url"), url));
		Production production;
		try {
			production = em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
		
		List<RubricProductionConfiguration> rPC = getRubricProductionConfigurationByProductionId(production.getId());
		
		for(RubricProductionConfiguration uPC : rPC) {
			List<UserRubricStatus> uRSs = getUserRubricStatusByRubricIdAndProductionId(uPC.getRubric().getId(),production.getId());
			uPC.getRubric().setUserRubricStatus(uRSs);
			production.setUserRubricStatus(uRSs);
		}
		
		production.setRubricProductionConfigurations(rPC);	
		
		return production;
	}

	/**
	 * Return a RubricProductionConfiguration from data base
	 * 
	 * @param long: The RubricProductionConfiguration id
	 * @return RubricProductionConfiguration: The RubricProductionConfiguration object
	 */
	public RubricProductionConfiguration getRubricProductionConfiguration(long id) {
		try {
			return em.find(RubricProductionConfiguration.class, id);
		} catch (NoResultException e) {
			return null;
		}
	}

	/**
	 * Return rubricProductionConfiguration list from data base
	 * 
	 * @param long: The Rubric id into rubricProductionConfiguration
	 * @return List: rubricProductionConfiguration object List
	 */
	public List<RubricProductionConfiguration> getRubricProductionConfigurationByRubricId(long rubricId) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<RubricProductionConfiguration> criteria = builder
				.createQuery(RubricProductionConfiguration.class);
		Root<RubricProductionConfiguration> root = criteria.from(RubricProductionConfiguration.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("rubric"), rubricId));
		try {
			return em.createQuery(criteria).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return SoundEffect  list from data base
	 * 
	 * @param long: The Production id
	 * @return List: SoundEffect object List
	 */

	@SuppressWarnings("unchecked")
	public List<SoundEffect> getSoundEffectNotInProduction(long idProduction) {
		Query query = em.createNativeQuery("SELECT se.* FROM sound_effect se WHERE se.id NOT IN ( SELECT upc.sound_effect_id "
				+ " FROM user_production_configuration upc WHERE upc.production_id = ? )",
				SoundEffect.class);
		query.setParameter(1, idProduction);
		
		try {
			return query.getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	/**
	 * Return SoundEffect from data base
	 * 
	 * @param long: The SoundEffect id
	 * @return SoundEffect: SoundEffect object 
	 */
	public SoundEffect getSoundEffect(long idSoundEffect) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<SoundEffect> criteria = builder.createQuery(SoundEffect.class);
		Root<SoundEffect> root = criteria.from(SoundEffect.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("id"), idSoundEffect));
		try {
			return em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}		
	}
	
	/**
	 * Return a production from data base
	 * 
	 * @param long: The UserProductionConfiguration id
	 * @return Production: The UserProductionConfiguration object
	 */
	public UserProductionConfiguration getUserProductionConfiguration(long id) {
		try {
			return em.find(UserProductionConfiguration.class, id);
		} catch (NoResultException e) {
			return null;
		}
	}

	public List<UserProductionConfiguration> getUserProductionConfigurationByProductionId(long productionId) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<UserProductionConfiguration> criteria = builder.createQuery(UserProductionConfiguration.class);
		Root<UserProductionConfiguration> root = criteria.from(UserProductionConfiguration.class);
		criteria.select(root);
		criteria.where(builder.equal(root.get("production"), productionId));
		try {
			return em.createQuery(criteria).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}

	public UserProductionConfiguration getUserProductionConfigurationByidUserAndHashProduction(Long idUser,
			String hashProduction) {
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<UserProductionConfiguration> criteria = builder.createQuery(UserProductionConfiguration.class);
		Root<UserProductionConfiguration> uPCs = criteria.from(UserProductionConfiguration.class);
		Join<UserProductionConfiguration,Production> production = uPCs.join("production");
		criteria.where(
					builder.equal(production.get("url"), hashProduction),
					builder.equal(uPCs.get("user"), idUser)
					);	
		try {
			return  em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	public UserRubricStatus getUserRubricStatussByHashProduction(String hashProduction){
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<UserRubricStatus> criteria = builder.createQuery(UserRubricStatus.class);
		Root<UserRubricStatus> uRS = criteria.from(UserRubricStatus.class);
		Join<UserRubricStatus,Production> production = uRS.join("production");
		criteria.where(builder.equal(production.get("url"), hashProduction));
		criteria.orderBy(builder.desc(uRS.get("id")));
		try {			
			return  em.createQuery(criteria).setMaxResults(1).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	public UserRubricStatus getUserRubricStatusByUserIdAndProductionId(Long userId,Long productionId) {
		
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<UserRubricStatus> criteria = builder.createQuery(UserRubricStatus.class);
		Root<UserRubricStatus> root = criteria.from(UserRubricStatus.class);
		criteria.select(root);
		criteria.where(
				builder.equal(root.get("user"), userId),
				builder.equal(root.get("production"), productionId)
				);
		try {
			return em.createQuery(criteria).getSingleResult();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	public List<UserRubricStatus> getUserRubricStatusByRubricIdAndProductionId(Long rubricId,Long productionId) {
		
		CriteriaBuilder builder = em.getCriteriaBuilder();
		CriteriaQuery<UserRubricStatus> criteria = builder.createQuery(UserRubricStatus.class);
		Root<UserRubricStatus> root = criteria.from(UserRubricStatus.class);
		criteria.select(root);
		criteria.where(
				builder.equal(root.get("rubric"), rubricId),
				builder.equal(root.get("production"), productionId));
		criteria.orderBy(builder.desc(root.get("id")));
		try {
			return em.createQuery(criteria).getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}

	/**
	 * Return Production list by User from data base
	 * 
	 * @param long: The user id into Production
	 * @return List: Production object List
	 */
	public List<Production> getProductionByUserId(long userId) {		
		Query query = em.createNativeQuery("SELECT DISTINCT p.* FROM production p "
				+ "LEFT JOIN user_production_configuration upc ON p.id = upc.production_id "
				+ "WHERE p.user_id = ? OR upc.user_id = ? ORDER BY p.id DESC ",
				Production.class);
		query.setParameter(1, userId);
		query.setParameter(2, userId);
		
		try {
			return query.getResultList();
		} catch (NoResultException e) {
			return null;
		}
	}
	
	public InputMessage mergeInputMessage(InputMessage input) {
		return em.merge(input);
	}

	public RubricProductionConfiguration mergeRubricProductionConfiguration(
			RubricProductionConfiguration configuration) {
		return em.merge(configuration);
	}

	public UserProductionConfiguration mergeUserProductionConfiguration(UserProductionConfiguration configuration) {
		return em.merge(configuration);
	}
	
	public UserRubricStatus mergeUserRubricStatus(UserRubricStatus userRubricStatus) {
		return em.merge(userRubricStatus);
	}
	
	public Production mergeProduction(Production production) {
		return em.merge(production);
	}
	
	public Rubric mergeRubric(Rubric rubric) {
		return em.merge(rubric);
	}
	
	public void persistContribution(Contribution contribution) {
		em.persist(contribution);
	}
	
	public User mergerUser(User user) {
		return em.merge(user);
	}
	
	public void persistUserProductionConfiguration(UserProductionConfiguration configuration) {
		em.persist(configuration);
	}
	
	public void persistUserRubricStatus(UserRubricStatus userRubricStatus) {
		em.persist(userRubricStatus);
	}

	public void persistRubricProductionConfiguration(RubricProductionConfiguration configuration) {
		em.persist(configuration);
	}
	
	public void persistProduction(Production production) {
		em.persist(production);
	}

	public void persistInputMessage(InputMessage input) {
		em.persist(input);
	}

	public void persistMessage(TextMessage message) {
		em.persist(message);
	}
	
	public void persistRubric(Rubric rubric) {
		em.persist(rubric);
	}

	public void removeRubric(Rubric rubric) {
		em.remove(rubric);
	}
	
	public void removeRubricProductionConfiguration(RubricProductionConfiguration configuration) {
		em.remove(configuration);
	}
	
	public void removeUserProductionConfiguration(UserProductionConfiguration configuration) {
		em.remove(configuration);
	}

}