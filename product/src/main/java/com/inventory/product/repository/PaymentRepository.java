package com.inventory.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.Payment;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payment by order ID
    Optional<Payment> findByOrderId(Long orderId);

    // Find payment by transaction ID
    Optional<Payment> findByTransactionId(String transactionId);
}
