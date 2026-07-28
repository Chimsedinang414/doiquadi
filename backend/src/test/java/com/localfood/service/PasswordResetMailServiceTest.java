package com.localfood.service;

import com.localfood.config.PasswordResetProperties;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class PasswordResetMailServiceTest {

    @Test
    void resetTokenIsPutInUrlFragmentSoFrontendAccessLogsCannotCaptureIt() {
        JavaMailSender mailSender = mock(JavaMailSender.class);
        PasswordResetProperties properties = new PasswordResetProperties();
        properties.setFrontendResetUri("https://localfood.example/reset-password");
        properties.setMailFrom("no-reply@localfood.example");
        properties.setTokenTtl(Duration.ofMinutes(15));
        PasswordResetMailService service = new PasswordResetMailService(mailSender, properties);

        service.send(new PasswordResetRequestedEvent(
                "person@example.com", "local-user", "safe_url-token"));

        ArgumentCaptor<SimpleMailMessage> messageCaptor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();
        assertThat(message.getFrom()).isEqualTo("no-reply@localfood.example");
        assertThat(message.getTo()).containsExactly("person@example.com");
        assertThat(message.getText())
                .contains("https://localfood.example/reset-password#token=safe_url-token")
                .doesNotContain("?token=");
    }
}
