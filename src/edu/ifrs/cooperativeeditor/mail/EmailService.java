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

import java.util.Properties;

import javax.mail.Address;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

/**
 * Send e-mails to the users
 *  
 * @author Lauro Correa Junior
 */
public class EmailService {

	private static final String EMAIL = "communication";
	private static final String PASSWORD = "secret";
	
	private Message message;

	public EmailService() {
		Properties props = this.initializeProperties(new Properties());
		Session session = this.initializeSession(props);

		this.initializeMessage(session);
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

	protected Properties initializeProperties(Properties props) {
		/** Connection Parameters with Gmail Server */
		props.put("mail.smtp.host", "smtp.gmail.com");
		props.put("mail.smtp.socketFactory.port", "465");
		props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.port", "465");
		return props;
	}

	protected Session initializeSession(Properties props) {
		Session session = Session.getInstance(props, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(EMAIL, PASSWORD);
			}
		});
		return session;
	}

	protected void initializeMessage(Session session) {
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