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
package edu.ifrs.cooperativeeditor.mail;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.naming.InitialContext;

/**
 * Send e-mails to the users
 *  
 * @author Lauro Correa Junior
 */
public class EmailService {

	private static final String EMAIL = "communication";
	
	private Session session;
	
	private Message message;

	public EmailService() {
		
		try {
			InitialContext ic = new InitialContext();
			this.session = (Session) ic.lookup("java:/CooperativeEditorEmail");
			this.initializeMessage(this.session);
		} catch (Exception e) {
			// TODO: handle exception
			e.printStackTrace();
		}
	}

	public void toUsers(String address) {
		try {
			Address[] toUser = InternetAddress.parse(address.toString());
			message.setRecipients(Message.RecipientType.TO, toUser);
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}

	public void setText(String urlActivity) {
		try {
			message.setText("You are being invited to join the activity through the Cooperative"
					+ " Editor, please follow this link to enter in the activity: " + urlActivity);
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}

	public void send() {
		try {
			Transport.send(message);
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}
	
	private void initializeMessage(Session session) {
		message = new MimeMessage(session);
		try {
			message.setFrom(new InternetAddress(EMAIL));
			message.setSubject("Cooperation Edition Invite");
		} catch (MessagingException e) {
			//TODO Exception
			throw new RuntimeException(e);
		}
	}
	
}