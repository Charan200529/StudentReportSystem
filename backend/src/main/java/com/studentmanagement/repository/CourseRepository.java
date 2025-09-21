package com.studentmanagement.repository;

import com.studentmanagement.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findBySemester(Integer semester);
    
    List<Course> findByTeacherId(Long teacherId);
    
    @Query("SELECT c FROM Course c WHERE c.semester = :semester AND c.id IN " +
           "(SELECT e.courseId FROM Enrollment e WHERE e.studentId = :studentId AND e.status = 'ACTIVE')")
    List<Course> findEnrolledCoursesByStudentAndSemester(@Param("studentId") Long studentId, @Param("semester") Integer semester);
    
    @Query("SELECT COUNT(c) FROM Course c")
    Long countAllCourses();
}
