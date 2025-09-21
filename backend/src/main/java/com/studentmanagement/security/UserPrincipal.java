package com.studentmanagement.security;

import com.studentmanagement.entity.User;
import com.studentmanagement.entity.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {
    
    private Long id;
    private String email;
    private String password;
    private String displayName;
    private UserRole role;
    private Integer currentSemester;
    
    public UserPrincipal(Long id, String email, String password, String displayName, UserRole role, Integer currentSemester) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
        this.role = role;
        this.currentSemester = currentSemester;
    }
    
    public static UserPrincipal create(User user) {
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            user.getDisplayName(),
            user.getRole(),
            user.getCurrentSemester()
        );
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    // Getters
    public Long getId() {
        return id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public Integer getCurrentSemester() {
        return currentSemester;
    }
}
