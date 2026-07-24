package com.localfood.repository;

import com.localfood.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CollectionRepository extends JpaRepository<Collection, String> {
    List<Collection> findByUser_Id(String userId);
}