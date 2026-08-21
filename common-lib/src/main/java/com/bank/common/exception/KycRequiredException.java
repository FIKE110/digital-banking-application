package com.bank.common.exception;

public class KycRequiredException extends RuntimeException {

    public KycRequiredException(String message) {
        super(message);
    }
}