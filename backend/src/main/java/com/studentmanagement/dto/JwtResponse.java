package com.studentmanagement.dto;

import com.studentmanagement.entity.UserRole;

public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String displayName;
    private UserRole role;
    private Integer currentSemester;
    
    // Constructors
    public JwtResponse() {}
    
    public JwtResponse(String token, Long id, String email, String displayName, UserRole role, Integer currentSemester) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.role = role;
        this.currentSemester = currentSemester;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public Integer getCurrentSemester() {
        return currentSemester;
    }
    
    public void setCurrentSemester(Integer currentSemester) {
        this.currentSemester = currentSemester;
    }
}
