package com.bank.extern.email.service;

import jakarta.mail.MessagingException;

public interface NotificationService {

    public void notify( String to,
                        String subject,
                        String message) throws MessagingException;
}
