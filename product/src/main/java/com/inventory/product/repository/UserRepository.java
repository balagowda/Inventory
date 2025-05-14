package com.inventory.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by username (for login)
    Optional<User> findByUsername(String username);

    // Find user by email (for registration checks)
    Optional<User> findByEmail(String email);

    // Find users by role (for admin dashboards)
    List<User> findByRole(User.Role role);
}
