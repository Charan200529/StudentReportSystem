package com.studentmanagement.repository;

import com.studentmanagement.entity.Assignment;
import com.studentmanagement.entity.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    List<Assignment> findByCourseId(Long courseId);
    
    List<Assignment> findByCreatedBy(Long createdBy);
    
    List<Assignment> findByStatus(AssignmentStatus status);
    
    @Query("SELECT a FROM Assignment a WHERE a.courseId IN " +
           "(SELECT e.courseId FROM Enrollment e WHERE e.studentId = :studentId AND e.status = 'ACTIVE')")
    List<Assignment> findAssignmentsForStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT a FROM Assignment a JOIN FETCH a.course c WHERE a.courseId IN " +
           "(SELECT e.courseId FROM Enrollment e WHERE e.studentId = :studentId AND e.status = 'ACTIVE') " +
           "AND c.semester = :semester")
    List<Assignment> findAssignmentsForStudentBySemester(@Param("studentId") Long studentId, @Param("semester") Integer semester);
    
    @Query("SELECT COUNT(a) FROM Assignment a")
    Long countAllAssignments();
}
