package com.bank.extern.email.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    public static final String EXCHANGE = "banking.events";
    public static final String QUEUE_OTP = "email.otp.queue";
    public static final String QUEUE_NOTIFICATION = "email.notification.queue";

    @Bean
    public TopicExchange bankingExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue emailOtpQueue() {
        return new Queue(QUEUE_OTP, true);
    }

    @Bean
    public Queue emailNotificationQueue() {
        return new Queue(QUEUE_NOTIFICATION, true);
    }

    @Bean
    public Binding emailOtpBinding(@Qualifier("emailOtpQueue") Queue emailOtpQueue, TopicExchange bankingExchange) {
        return BindingBuilder.bind(emailOtpQueue)
                .to(bankingExchange)
                .with("user.otp_sent");
    }

    @Bean
    public Binding emailUserRegisteredBinding(@Qualifier("emailNotificationQueue") Queue emailNotificationQueue, TopicExchange bankingExchange) {
        return BindingBuilder.bind(emailNotificationQueue)
                .to(bankingExchange)
                .with("user.user_registered");
    }

    @Bean
    public Binding emailUserPasswordResetBinding(@Qualifier("emailNotificationQueue") Queue emailNotificationQueue, TopicExchange bankingExchange) {
        return BindingBuilder.bind(emailNotificationQueue)
                .to(bankingExchange)
                .with("user.password_reset");
    }

    @Bean
    public Binding emailUserAccountLockedBinding(@Qualifier("emailNotificationQueue") Queue emailNotificationQueue, TopicExchange bankingExchange) {
        return BindingBuilder.bind(emailNotificationQueue)
                .to(bankingExchange)
                .with("user.account_locked");
    }

    @Bean
    public Binding emailTransactionBinding(@Qualifier("emailNotificationQueue") Queue emailNotificationQueue, TopicExchange bankingExchange) {
        return BindingBuilder.bind(emailNotificationQueue)
                .to(bankingExchange)
                .with("transfer.transaction_completed");
    }
}
