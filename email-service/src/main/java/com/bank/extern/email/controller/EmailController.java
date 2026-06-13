package com.bank.extern.email.controller;

import com.bank.extern.email.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

@RestController
@RequestMapping("/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping
    public String sendEmail(@RequestParam("email") String email) throws MessagingException {
        Random random = new Random();
        String password=Integer.toString(random.nextInt(99999));
        emailService.notify(email,"Your first email",String.format( """
                <html>
                <body>
                <h1>Rest using this password</h1>
                <p>Welcome to Email service notification</p>
                <p>Password : %s</p>
                </body>
                </html>
                
                """,password));

        return "Email has been sent";
    }
}
