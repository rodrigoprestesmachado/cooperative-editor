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
package edu.ifrs.cooperativeeditor.mail;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.ActivationConfigProperty;
import javax.ejb.MessageDriven;
import javax.jms.JMSException;
import javax.jms.MapMessage;
import javax.jms.MessageListener;
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 * @author Rodrigo Prestes Machado
 */
@MessageDriven(activationConfig = {
	    @ActivationConfigProperty(propertyName = "destinationLookup",
	            propertyValue = "java:/jms/queue/CooperativeEditorEmailQueue"),
	    @ActivationConfigProperty(propertyName = "destinationType",
	            propertyValue = "javax.jms.Queue")
	})
public class EmailService implements MessageListener {

	private static final Logger log = Logger.getLogger(EmailService.class.getName());
	
	private static final String EMAIL = "communication";
	
	private Session emailSession;
	
	private Message mailMessage;
	
	public EmailService() {}

	@Override
	public void onMessage(javax.jms.Message jmsMessage) {
	
		MapMessage map = (MapMessage) jmsMessage;

		try {
			log.log(Level.INFO, "Trying to invite users ...");
			
			InitialContext ic = new InitialContext();
			emailSession = (Session) ic.lookup("java:/CooperativeEditorEmail");
			initializeMessage(emailSession, map.getString("tile") );
			toUsers(map.getString("emails"));
			setText(map.getString("message"), map.getString("startTime"), map.getString("url"));
			send();
			
			log.log(Level.INFO, "E-mail sent to the users: " + map.getString("emails"));
		} catch (NamingException | JMSException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	private void initializeMessage(Session emailSession, String tile) {
		mailMessage = new MimeMessage(emailSession);
		try {
			mailMessage.setFrom(new InternetAddress(EMAIL));
			mailMessage.setSubject(tile);
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}
	
	public void toUsers(String address) {
		try {
			Address[] toUser = InternetAddress.parse(address.toString());
			mailMessage.setRecipients(Message.RecipientType.TO, toUser);
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}

	public void setText(String message, String startTime, String url) {
		try {
			String formatedMessage = String.format(message, startTime);
			mailMessage.setText(formatedMessage + "\n" + url);
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}

	public void send() {
		try {
			Transport.send(mailMessage);
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}
}