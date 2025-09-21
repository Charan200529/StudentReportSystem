package com.studentmanagement.controller;

import com.studentmanagement.dto.JwtResponse;
import com.studentmanagement.dto.LoginRequest;
import com.studentmanagement.dto.SignupRequest;
import com.studentmanagement.entity.User;
import com.studentmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    AuthService authService;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Error: Invalid credentials");
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            User user = authService.registerUser(signUpRequest);
            return ResponseEntity.ok("User registered successfully!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdminUser() {
        try {
            User admin = authService.createAdminUser();
            return ResponseEntity.ok("Admin user created successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating admin user: " + e.getMessage());
        }
    }
}
