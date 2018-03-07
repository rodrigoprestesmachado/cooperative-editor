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

public class CooperativeEditorMail {

	Message message;

	public CooperativeEditorMail() {

		Properties props = this.initializeProperties(new Properties());

		Session session = this.initializeSession(props);

		this.initializeMessage(session);

	}

	public void toUsers(String address) {
		try {
			Address[] toUser = InternetAddress.parse(address.toString());
			message.setRecipients(Message.RecipientType.TO, toUser);
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}

	}

	public void setText(String urlActivity) {
		try {
			message.setText("You are being invited to join the activity through the Cooperative"
					+ " Editor click on this like to go to acitivade " + urlActivity);
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}

	public void send() {
		try {
			Transport.send(message);
		} catch (MessagingException e) {
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
				return new PasswordAuthentication("cooperative.editor@gmail.com", "secret");
			}
		});

		return session;
	}

	protected void initializeMessage(Session session) {
		message = new MimeMessage(session);
		try {
			message.setFrom(new InternetAddress("cooperative.editor@gmail.com"));
			message.setSubject("Invitation to participate in the activity");
		} catch (MessagingException e) {
			throw new RuntimeException(e);
		}
	}
}
