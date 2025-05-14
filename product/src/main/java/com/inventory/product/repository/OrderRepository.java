package com.inventory.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.Order;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by user ID (for order history)
    List<Order> findByUserId(Long userId);

    // Find orders by status (for admin dashboards)
    List<Order> findByStatus(Order.OrderStatus status);

    // Find specific order for a user
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    // Fetch order with items and payment eagerly
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems oi JOIN FETCH oi.product " +
           "JOIN FETCH o.payment WHERE o.id = :id AND o.user.id = :userId")
    Optional<Order> findByIdAndUserIdWithDetails(@Param("id") Long id, @Param("userId") Long userId);
}