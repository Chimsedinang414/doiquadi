package com.localfood.service;

import com.localfood.config.PasswordResetProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class PasswordResetMailService {
    private static final Logger log = LoggerFactory.getLogger(PasswordResetMailService.class);

    private final JavaMailSender mailSender;
    private final PasswordResetProperties properties;

    @Async("passwordResetExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void send(PasswordResetRequestedEvent event) {
        String resetUrl = UriComponentsBuilder.fromUriString(properties.getFrontendResetUri())
                // A URL fragment is not sent to the frontend server or included in its access logs.
                .fragment("token=" + event.rawToken())
                .build()
                .encode()
                .toUriString();

        SimpleMailMessage message = new SimpleMailMessage();
        if (properties.getMailFrom() != null && !properties.getMailFrom().isBlank()) {
            message.setFrom(properties.getMailFrom());
        }
        message.setTo(event.email());
        message.setSubject("Đặt lại mật khẩu LocalFood");
        message.setText("Xin chào " + event.userName() + ",\n\n"
                + "Bạn vừa yêu cầu đặt lại mật khẩu LocalFood. Mở liên kết sau trong vòng "
                + properties.getTokenTtl().toMinutes() + " phút:\n\n"
                + resetUrl + "\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email. Liên kết chỉ dùng được một lần.");
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            // Never log the recipient or raw reset token.
            log.error("Password-reset email delivery failed ({})", ex.getClass().getSimpleName());
        }
    }
}
