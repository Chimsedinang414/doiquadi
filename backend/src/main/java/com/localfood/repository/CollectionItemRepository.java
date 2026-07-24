package com.localfood.repository;

import com.localfood.model.CollectionItem;
import com.localfood.model.CollectionItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CollectionItemRepository extends JpaRepository<CollectionItem, CollectionItemId> {
    List<CollectionItem> findByCollection_Id(String collectionId);
}