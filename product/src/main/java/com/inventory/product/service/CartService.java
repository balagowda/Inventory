package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.CartDTO;
import com.inventory.product.dto.CartItemDTO;
import com.inventory.product.entity.Cart;
import com.inventory.product.entity.CartItem;
import com.inventory.product.entity.Product;
import com.inventory.product.entity.User;
import com.inventory.product.repository.CartItemRepository;
import com.inventory.product.repository.CartRepository;
import com.inventory.product.repository.ProductRepository;
import com.inventory.product.repository.UserRepository;

import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
	@Autowired
    private CartRepository cartRepository;
	@Autowired
    private CartItemRepository cartItemRepository;
	@Autowired
    private ProductRepository productRepository;
	@Autowired
    private UserRepository userRepository;

    // Get current user's cart
    public Optional<CartDTO> getCart() {
        Long userId = getCurrentUserId();
        return cartRepository.findByUserIdWithItems(userId).map(this::toDTO);
    }

    // Add item to cart
    @Transactional
    public CartDTO addItemToCart(CartItemDTO itemDTO) {
        Long userId = getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        Product product = productRepository.findById(itemDTO.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < itemDTO.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        CartItem item;
        if (existingItem.isPresent()) {
            item = existingItem.get();
            item.setQuantity(itemDTO.getQuantity());
        } else {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
        }
        System.out.println("Hello world");
        System.out.println(item);
        cartItemRepository.save(item);
        return toDTO(cartRepository.findByUserIdWithItems(userId).orElseThrow());
    }

    // Update cart item quantity
    @Transactional
    public CartDTO updateCartItem(Long itemId, CartItemDTO itemDTO) {
        Long userId = getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        CartItem item = cartItemRepository.findById(itemId)
                .filter(ci -> ci.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));

        Product product = productRepository.findById(item.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        if (product.getStockQuantity() < itemDTO.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        item.setQuantity(itemDTO.getQuantity());
        cartItemRepository.save(item);
        return toDTO(cartRepository.findByUserIdWithItems(userId).orElseThrow());
    }

    // Remove item from cart
    @Transactional
    public CartDTO removeItemFromCart(Long itemId) {
        Long userId = getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        cartItemRepository.findById(itemId)
                .filter(ci -> ci.getCart().getId().equals(cart.getId()))
                .ifPresent(cartItemRepository::delete);

        return toDTO(cartRepository.findByUserIdWithItems(userId).orElseThrow());
    }

    // Clear cart
    @Transactional
    public void clearCart() {
        Long userId = getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));
        cartItemRepository.deleteByCartId(cart.getId());
    }

    // Create new cart for user
    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setCartItems(new ArrayList<>());
        return cartRepository.save(cart);
    }

    // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Convert entity to DTO
    private CartDTO toDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setUserId(cart.getUser().getId());
        dto.setCartItems(cart.getCartItems().stream().map(this::toCartItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private CartItemDTO toCartItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setProduct(new Product());
        Product product = item.getProduct();
        
        dto.getProduct().setId(product.getId());
        dto.getProduct().setName(product.getName());
        dto.getProduct().setPrice(product.getPrice());
        dto.getProduct().setCategory(product.getCategory());
        dto.getProduct().setCreatedAt(product.getCreatedAt());
        dto.getProduct().setDescription(product.getDescription());
        dto.getProduct().setImageUrl(product.getImageUrl());
        dto.getProduct().setStockQuantity(product.getStockQuantity());
        dto.getProduct().setProductStatus(product.getProductStatus());
        dto.getProduct().setUpdatedAt(product.getUpdatedAt());
        
        return dto;
    }
}
