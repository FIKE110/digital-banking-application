package com.bank.extern.audit.config;

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
    public static final String QUEUE = "audit.event.queue";

    @Bean
    public TopicExchange bankingExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue auditEventQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Binding auditAllBinding(@Qualifier("auditEventQueue") Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue)
                .to(exchange)
                .with("#");
    }
}