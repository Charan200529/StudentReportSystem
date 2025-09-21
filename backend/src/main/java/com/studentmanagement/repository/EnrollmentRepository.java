package com.studentmanagement.repository;

import com.studentmanagement.entity.Enrollment;
import com.studentmanagement.entity.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    List<Enrollment> findByStudentId(Long studentId);
    
    List<Enrollment> findByCourseId(Long courseId);
    
    List<Enrollment> findByStatus(EnrollmentStatus status);
    
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.studentId = :studentId AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsByStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT e FROM Enrollment e WHERE e.courseId = :courseId AND e.status = 'ACTIVE'")
    List<Enrollment> findActiveEnrollmentsByCourse(@Param("courseId") Long courseId);
}
