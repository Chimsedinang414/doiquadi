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
public class CollectionItemId implements Serializable {
    @Column(name = "collection_id", length = 36)
    private String collectionId;

    @Column(name = "location_id", length = 36)
    private String locationId;
}