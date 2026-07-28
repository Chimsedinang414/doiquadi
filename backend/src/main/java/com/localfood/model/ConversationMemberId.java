package com.localfood.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMemberId implements Serializable {
    @Column(name = "conversation_id", length = 36, columnDefinition = "CHAR(36)")
    private String conversationId;

    @Column(name = "user_id", length = 36, columnDefinition = "CHAR(36)")
    private String userId;
}
