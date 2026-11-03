package com.founderbridge.companies.domain;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    Optional<Company> findBySlug(String slug);
    List<Company> findByOwnerId(UUID ownerId);
    boolean existsBySlug(String slug);
    Page<Company> findByStatusAndNameContainingIgnoreCase(
        Company.CompanyStatus status, String query, Pageable pageable);
}
