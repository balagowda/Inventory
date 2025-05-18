package com.inventory.product.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BuyItemDTO {
	
	@NotNull(message = "product Id is required")
	private Long productId;
	 @NotNull(message = "Quantity is required")
	private Integer quantity;
}
