package com.inventory.product.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventory.product.dto.CartDTO;
import com.inventory.product.dto.CartItemDTO;
import com.inventory.product.service.CartService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/view")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> viewCart() {
    	Optional<CartDTO> availableCart = cartService.getCart();

    	return availableCart
    	        .map(cart -> new ResponseEntity<>(cart, HttpStatus.OK))
    	        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NO_CONTENT));
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> createCart(@Valid @RequestBody CartItemDTO itemDTO) {
        CartDTO updatedCart = cartService.addItemToCart(itemDTO);
        return ResponseEntity.ok(updatedCart);
    }
    
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> updateCart(@PathVariable Long id, @Valid @RequestBody CartItemDTO itemDTO) {
        CartDTO updatedCart = cartService.updateCartItem(id, itemDTO);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> deleteCart(@PathVariable Long id) {
        CartDTO updateCart = cartService.removeItemFromCart(id);
        return ResponseEntity.ok(updateCart);
    }
}