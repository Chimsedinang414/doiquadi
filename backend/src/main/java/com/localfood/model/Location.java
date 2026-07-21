package com.localfood.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "locations")
@Getter @Setter @NoArgsConstructor
public class Location {
    @Id @GeneratedValue @UuidGenerator
    @Column(length = 36, updatable = false, nullable = false)
    private String id;
    @NotBlank @Column(nullable = false)
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    @Column(name = "open_time")
    private LocalTime openTime;
    @Column(name = "close_time")
    private LocalTime closeTime;
    private String phone;
    @Column(name = "avg_price")
    private BigDecimal averagePrice;
}
