package com.studentmanagement.controller;

import com.studentmanagement.entity.Assignment;
import com.studentmanagement.entity.UserRole;
import com.studentmanagement.repository.AssignmentRepository;
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
@RequestMapping("/assignments")
public class AssignmentController {
    
    @Autowired
    AssignmentRepository assignmentRepository;
    
    @GetMapping("/all")
    public ResponseEntity<List<Assignment>> getAllAssignments(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        if (userPrincipal.getRole() == UserRole.ADMIN || userPrincipal.getRole() == UserRole.TEACHER) {
            // Admins and teachers see all assignments
            List<Assignment> assignments = assignmentRepository.findAll();
            return ResponseEntity.ok(assignments);
        } else if (userPrincipal.getRole() == UserRole.STUDENT) {
            // Students see assignments for their semester
            List<Assignment> assignments = assignmentRepository.findAssignmentsForStudentBySemester(
                userPrincipal.getId(), userPrincipal.getCurrentSemester());
            return ResponseEntity.ok(assignments);
        }
        
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/by-course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return ResponseEntity.ok(assignments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id) {
        Optional<Assignment> assignment = assignmentRepository.findById(id);
        return assignment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return ResponseEntity.ok(savedAssignment);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable Long id, @RequestBody Assignment assignmentDetails) {
        Optional<Assignment> assignmentOptional = assignmentRepository.findById(id);
        if (assignmentOptional.isPresent()) {
            Assignment assignment = assignmentOptional.get();
            assignment.setTitle(assignmentDetails.getTitle());
            assignment.setDescription(assignmentDetails.getDescription());
            assignment.setCourseId(assignmentDetails.getCourseId());
            assignment.setMaxPoints(assignmentDetails.getMaxPoints());
            assignment.setDueDate(assignmentDetails.getDueDate());
            assignment.setInstructions(assignmentDetails.getInstructions());
            assignment.setStatus(assignmentDetails.getStatus());
            
            Assignment updatedAssignment = assignmentRepository.save(assignment);
            return ResponseEntity.ok(updatedAssignment);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return ResponseEntity.ok("Assignment deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
