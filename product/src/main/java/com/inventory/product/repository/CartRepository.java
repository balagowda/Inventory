package com.inventory.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.Cart;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Find cart by user ID
    Optional<Cart> findByUserId(Long userId);

    // Fetch cart with items eagerly (for checkout)
    @Query("SELECT c FROM Cart c JOIN FETCH c.cartItems i JOIN FETCH i.product JOIN FETCH c.user WHERE c.user.id = :userId")
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);
}