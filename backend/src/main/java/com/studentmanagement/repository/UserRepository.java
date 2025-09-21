package com.studentmanagement.repository;

import com.studentmanagement.entity.User;
import com.studentmanagement.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByCurrentSemester(Integer semester);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.currentSemester = :semester")
    List<User> findByRoleAndCurrentSemester(@Param("role") UserRole role, @Param("semester") Integer semester);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(@Param("role") UserRole role);
}
