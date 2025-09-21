package com.studentmanagement.repository;

import com.studentmanagement.entity.Submission;
import com.studentmanagement.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    List<Submission> findByAssignmentId(Long assignmentId);
    
    List<Submission> findByStudentId(Long studentId);
    
    List<Submission> findByStatus(SubmissionStatus status);
    
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignmentId = :assignmentId")
    Long countByAssignmentId(@Param("assignmentId") Long assignmentId);
    
    @Query("SELECT COUNT(s) FROM Submission s")
    Long countAllSubmissions();
}
