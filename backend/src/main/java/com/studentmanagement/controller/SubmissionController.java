package com.studentmanagement.controller;

import com.studentmanagement.entity.Submission;
import com.studentmanagement.entity.SubmissionStatus;
import com.studentmanagement.entity.UserRole;
import com.studentmanagement.repository.SubmissionRepository;
import com.studentmanagement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/submissions")
public class SubmissionController {
    
    @Autowired
    SubmissionRepository submissionRepository;
    
    @GetMapping("/by-assignment/{assignmentId}")
    public ResponseEntity<List<Submission>> getSubmissionsByAssignment(@PathVariable Long assignmentId, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        if (userPrincipal.getRole() == UserRole.ADMIN || userPrincipal.getRole() == UserRole.TEACHER) {
            // Admins and teachers can see all submissions for an assignment
            List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
            return ResponseEntity.ok(submissions);
        } else if (userPrincipal.getRole() == UserRole.STUDENT) {
            // Students can only see their own submissions
            List<Submission> submissions = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, userPrincipal.getId())
                    .map(List::of).orElse(List.of());
            return ResponseEntity.ok(submissions);
        }
        
        return ResponseEntity.ok(List.of());
    }
    
    @GetMapping("/my-submissions")
    public ResponseEntity<List<Submission>> getMySubmissions(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        List<Submission> submissions = submissionRepository.findByStudentId(userPrincipal.getId());
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        Optional<Submission> submission = submissionRepository.findById(id);
        return submission.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Check if student already submitted this assignment
        Optional<Submission> existingSubmission = submissionRepository.findByAssignmentIdAndStudentId(
                submission.getAssignmentId(), userPrincipal.getId());
        
        if (existingSubmission.isPresent()) {
            return ResponseEntity.badRequest().build(); // Already submitted
        }
        
        submission.setStudentId(userPrincipal.getId());
        submission.setStudentName(userPrincipal.getDisplayName());
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        
        Submission savedSubmission = submissionRepository.save(submission);
        return ResponseEntity.ok(savedSubmission);
    }
    
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Submission> gradeSubmission(@PathVariable Long id, @RequestBody GradeRequest gradeRequest, Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        Optional<Submission> submissionOptional = submissionRepository.findById(id);
        if (submissionOptional.isPresent()) {
            Submission submission = submissionOptional.get();
            submission.setScore(gradeRequest.getScore());
            submission.setFeedback(gradeRequest.getFeedback());
            submission.setGradedBy(userPrincipal.getId());
            submission.setGradedAt(LocalDateTime.now());
            submission.setStatus(SubmissionStatus.GRADED);
            
            Submission updatedSubmission = submissionRepository.save(submission);
            return ResponseEntity.ok(updatedSubmission);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Inner class for grade request
    public static class GradeRequest {
        private Integer score;
        private String feedback;
        
        public Integer getScore() {
            return score;
        }
        
        public void setScore(Integer score) {
            this.score = score;
        }
        
        public String getFeedback() {
            return feedback;
        }
        
        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }
    }
}
