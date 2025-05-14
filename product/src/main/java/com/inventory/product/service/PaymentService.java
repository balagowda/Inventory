package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.PaymentDTO;
import com.inventory.product.entity.Order;
import com.inventory.product.entity.Payment;
import com.inventory.product.entity.User;
import com.inventory.product.repository.OrderRepository;
import com.inventory.product.repository.PaymentRepository;
import com.inventory.product.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {
	@Autowired
    private PaymentRepository paymentRepository;
	@Autowired
    private OrderRepository orderRepository;
	@Autowired
    private UserRepository userRepository;

    // Process payment (placeholder for payment gateway integration)
    @Transactional
    public PaymentDTO processPayment(Long orderId, String paymentMethod) {
        Long userId = getCurrentUserId();
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getPaymentStatus().equals(Order.PaymentStatus.PENDING)) {
            throw new IllegalStateException("Payment already processed");
        }

        // Placeholder: Integrate with payment gateway (e.g., Stripe)
        String transactionId = initiatePaymentGateway(order.getTotalAmount(), paymentMethod);
        boolean paymentSuccess = true; // Simulate payment success

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentMethod));
        payment.setTransactionId(transactionId);
        payment.setPaymentStatus(paymentSuccess ? Payment.PaymentStatus.COMPLETED : Payment.PaymentStatus.FAILED);
        payment.setPaymentDate(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        // Update order payment status
        order.setPaymentStatus(paymentSuccess ? Order.PaymentStatus.COMPLETED : Order.PaymentStatus.FAILED);
        orderRepository.save(order);

        return toDTO(payment);
    }

    // Get payment details
    public Optional<PaymentDTO> getPaymentDetails(Long orderId) {
        Long userId = getCurrentUserId();
        return paymentRepository.findByOrderId(orderId)
                .filter(p -> p.getOrder().getUser().getId().equals(userId))
                .map(this::toDTO);
    }

    // Placeholder for payment gateway integration
    private String initiatePaymentGateway(BigDecimal amount, String paymentMethod) {
        // Implement actual payment 
        return "TXN_" + System.currentTimeMillis(); 
    }

    // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Convert entity to DTO
    private PaymentDTO toDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setOrderId(payment.getOrder().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod().name());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentStatus(payment.getPaymentStatus().name());
        dto.setPaymentDate(payment.getPaymentDate());
        return dto;
    }
}
