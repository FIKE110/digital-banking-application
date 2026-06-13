package com.bank.extern.email.model;

public record EmailMessageDto(
        String message,
        String to,
        String subject
) {
}
