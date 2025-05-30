package com.inventory.product.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserDTO {
	 private Long id;

	    @NotBlank(message = "Username is required")
	    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
	    private String username;

	    @NotBlank(message = "Password is required")
	    @Size(min = 6, message = "Password must be at least 6 characters")
	    private String password;

	    @NotBlank(message = "Email is required")
	    @Email(message = "Invalid email format")
	    @Size(max = 100, message = "Email cannot exceed 100 characters")
	    private String email;

	    @NotBlank(message = "Full name is required")
	    @Size(max = 100, message = "Full name cannot exceed 100 characters")
	    private String fullName;

	    @NotBlank(message = "Phone number is required")
	    @Size(max = 15, message = "Phone number cannot exceed 15 characters")
	    private String phoneNumber;

	    @NotBlank(message = "Role is required")
	    @Size(max = 20, message = "Role cannot exceed 20 characters")
	    private String role;
}