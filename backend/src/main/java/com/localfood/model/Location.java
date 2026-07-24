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
    @Column(length = 500)
    private String address;
    private Double latitude;
    private Double longitude;
    @Column(name = "open_time")
    private LocalTime openTime;
    @Column(name = "close_time")
    private LocalTime closeTime;
    @Column(length = 20)
    private String phone;
    @Column(name = "avg_price", precision = 10, scale = 2)
    private BigDecimal averagePrice;
}
