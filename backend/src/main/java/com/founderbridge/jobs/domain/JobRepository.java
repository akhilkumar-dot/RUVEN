package com.founderbridge.jobs.domain;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByCompanyIdAndStatus(UUID companyId, Job.JobStatus status);
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
}
