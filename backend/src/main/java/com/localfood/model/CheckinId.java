package com.localfood.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class CheckinId implements Serializable {
    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "location_id", length = 36)
    private String locationId;

    @Column(name = "time", nullable = false)
    private LocalDateTime time;
}