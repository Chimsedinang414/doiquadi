package com.localfood.admin.report;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, String> {
    boolean existsByReporter_IdAndTargetTypeAndTargetIdAndStatusIn(
            String reporterId,
            ReportTargetType targetType,
            String targetId,
            Collection<ReportStatus> statuses);

    long countByStatus(ReportStatus status);

    long countByTargetTypeAndTargetId(ReportTargetType targetType, String targetId);

    @Query("select r.reason, count(r) from Report r group by r.reason order by count(r) desc")
    List<Object[]> countGroupedByReason();

    @Query("""
            select r from Report r
            where (:status is null or r.status = :status)
              and (:targetType is null or r.targetType = :targetType)
              and (:query = '' or lower(r.targetId) like lower(concat('%', :query, '%'))
                   or lower(r.reporter.userName) like lower(concat('%', :query, '%'))
                   or lower(coalesce(r.description, '')) like lower(concat('%', :query, '%')))
            """)
    Page<Report> search(
            @Param("query") String query,
            @Param("status") ReportStatus status,
            @Param("targetType") ReportTargetType targetType,
            Pageable pageable);
}
