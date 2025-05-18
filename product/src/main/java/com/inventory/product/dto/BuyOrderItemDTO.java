package com.inventory.product.dto;

import java.math.BigDecimal;

import com.inventory.product.entity.Goods;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class BuyOrderItemDTO {
	private Long id;

    @NotNull(message = "Goods ID is required")
    @Positive(message = "Goods ID must be positive")
    private Goods goods;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Positive(message = "Unit price must be positive")
    private BigDecimal unitPrice;

    @NotNull(message = "Subtotal is required")
    @Positive(message = "Subtotal must be positive")
    private BigDecimal subTotal;
}
