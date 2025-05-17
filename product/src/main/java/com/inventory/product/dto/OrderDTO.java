package com.inventory.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrderDTO {
	private Long id;
	
	private Long userId;

    @NotNull(message = "Order date is required")
    @PastOrPresent(message = "Order date cannot be in the future")
    private LocalDateTime orderDate;

    @NotBlank(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    private String status;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;

    @NotNull(message = "Shipping address ID is required")
    @Positive(message = "Shipping address ID must be positive")
    private Long shippingAddressId;

    @NotBlank(message = "Payment status is required")
    @Size(max = 20, message = "Payment status cannot exceed 20 characters")
    private String paymentStatus;

    @NotEmpty(message = "Order items cannot be empty")
    private List<OrderItemDTO> orderItems;
}