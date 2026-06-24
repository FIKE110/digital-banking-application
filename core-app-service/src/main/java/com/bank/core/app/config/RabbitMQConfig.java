package com.bank.core.app.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class RabbitMQConfig {

    public static final String EXCHANGE = "banking.events";

    @Bean
    public TopicExchange bankingExchange() {
        return new TopicExchange(EXCHANGE);
    }
}
