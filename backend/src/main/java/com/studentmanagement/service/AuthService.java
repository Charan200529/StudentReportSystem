package com.studentmanagement.service;

import com.studentmanagement.dto.JwtResponse;
import com.studentmanagement.dto.LoginRequest;
import com.studentmanagement.dto.SignupRequest;
import com.studentmanagement.entity.User;
import com.studentmanagement.entity.UserRole;
import com.studentmanagement.repository.UserRepository;
import com.studentmanagement.security.JwtUtils;
import com.studentmanagement.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return new JwtResponse(jwt,
                userPrincipal.getId(),
                userPrincipal.getEmail(),
                userPrincipal.getDisplayName(),
                userPrincipal.getRole(),
                userPrincipal.getCurrentSemester());
    }
    
    public User registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        
        // Create new user's account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getDisplayName(),
                UserRole.STUDENT); // Default role is STUDENT
        
        user.setCurrentSemester(1); // Default semester
        
        return userRepository.save(user);
    }
    
    public User createAdminUser() {
        String adminEmail = "admin@gmail.com";
        String adminPassword = "admin123";
        
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User(adminEmail,
                    encoder.encode(adminPassword),
                    "Admin",
                    UserRole.ADMIN);
            
            return userRepository.save(admin);
        }
        
        return userRepository.findByEmail(adminEmail).orElse(null);
    }
}
