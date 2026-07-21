package com.localfood.repository;
import com.localfood.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LocationRepository extends JpaRepository<Location, String> {}
