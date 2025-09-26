package com.studentmanagement.controller;

import com.studentmanagement.entity.Course;
import com.studentmanagement.entity.UserRole;
import com.studentmanagement.repository.CourseRepository;
import com.studentmanagement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/courses")
public class CourseController {
    
    @Autowired
    CourseRepository courseRepository;
    
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("API is working!");
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        try {
            // For now, return all courses - we'll add authentication later
            List<Course> courses = courseRepository.findAll();
            return ResponseEntity.ok(courses);
        } catch (Exception e) {
            // If there's any error, return empty list
            return ResponseEntity.ok(List.of());
        }
    }
    
    @GetMapping("/by-semester/{semester}")
    public ResponseEntity<List<Course>> getCoursesBySemester(@PathVariable Integer semester) {
        List<Course> courses = courseRepository.findBySemester(semester);
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        Optional<Course> course = courseRepository.findById(id);
        return course.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        Course savedCourse = courseRepository.save(course);
        return ResponseEntity.ok(savedCourse);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        Optional<Course> courseOptional = courseRepository.findById(id);
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            course.setTitle(courseDetails.getTitle());
            course.setCode(courseDetails.getCode());
            course.setDescription(courseDetails.getDescription());
            course.setSemester(courseDetails.getSemester());
            course.setTeacherId(courseDetails.getTeacherId());
            
            Course updatedCourse = courseRepository.save(course);
            return ResponseEntity.ok(updatedCourse);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return ResponseEntity.ok("Course deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
