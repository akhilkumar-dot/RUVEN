package com.founderbridge.jobs.domain;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobId(UUID jobId);
    List<Application> findByApplicantId(UUID applicantId);
    boolean existsByJobIdAndApplicantId(UUID jobId, UUID applicantId);
}
