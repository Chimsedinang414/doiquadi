package com.localfood.repository;
import com.localfood.model.Location;
import com.localfood.model.LocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LocationRepository extends JpaRepository<Location, String> {
    List<Location> findByStatusOrderByNameAsc(LocationStatus status);
    long countByStatus(LocationStatus status);

    @Query("""
            select l from Location l
            where (:query = '' or lower(l.id) like lower(concat('%', :query, '%'))
                   or lower(l.name) like lower(concat('%', :query, '%'))
                   or lower(coalesce(l.address, '')) like lower(concat('%', :query, '%')))
              and (:status is null or l.status = :status)
            """)
    Page<Location> searchAdmin(
            @Param("query") String query,
            @Param("status") LocationStatus status,
            Pageable pageable);
}
