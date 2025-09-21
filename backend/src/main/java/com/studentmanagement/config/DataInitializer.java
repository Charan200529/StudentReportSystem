package com.studentmanagement.config;

import com.studentmanagement.entity.User;
import com.studentmanagement.entity.UserRole;
import com.studentmanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Create admin user if it doesn't exist
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = new User();
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setDisplayName("Admin");
            admin.setRole(UserRole.ADMIN);
            admin.setCurrentSemester(null); // Admin doesn't have a semester
            
            userRepository.save(admin);
            System.out.println("Admin user created successfully!");
        }
        
        // Create a sample teacher
        if (!userRepository.existsByEmail("teacher@gmail.com")) {
            User teacher = new User();
            teacher.setEmail("teacher@gmail.com");
            teacher.setPassword(passwordEncoder.encode("teacher123"));
            teacher.setDisplayName("Teacher");
            teacher.setRole(UserRole.TEACHER);
            teacher.setCurrentSemester(null); // Teacher doesn't have a semester
            
            userRepository.save(teacher);
            System.out.println("Teacher user created successfully!");
        }
        
        // Create a sample student
        if (!userRepository.existsByEmail("student@gmail.com")) {
            User student = new User();
            student.setEmail("student@gmail.com");
            student.setPassword(passwordEncoder.encode("student123"));
            student.setDisplayName("Student");
            student.setRole(UserRole.STUDENT);
            student.setCurrentSemester(1);
            
            userRepository.save(student);
            System.out.println("Student user created successfully!");
        }
    }
}
