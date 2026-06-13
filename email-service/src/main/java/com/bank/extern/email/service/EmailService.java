package com.bank.extern.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService implements NotificationService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void notify(String  to, String subject, String message) throws MessagingException {
        MimeMessage mailMessage = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(mailMessage, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(message, true);

        mailSender.send(mailMessage);
    }
}
