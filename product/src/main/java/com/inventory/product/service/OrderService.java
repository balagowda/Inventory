package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.OrderDTO;
import com.inventory.product.dto.OrderItemDTO;
import com.inventory.product.entity.Address;
import com.inventory.product.entity.Cart;
import com.inventory.product.entity.CartItem;
import com.inventory.product.entity.Order;
import com.inventory.product.entity.OrderItem;
import com.inventory.product.entity.Product;
import com.inventory.product.entity.User;
import com.inventory.product.repository.AddressRepository;
import com.inventory.product.repository.CartRepository;
import com.inventory.product.repository.OrderRepository;
import com.inventory.product.repository.ProductRepository;
import com.inventory.product.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {
	@Autowired
    private OrderRepository orderRepository;
	@Autowired
    private CartRepository cartRepository;
	@Autowired
    private ProductRepository productRepository;
	@Autowired
    private AddressRepository addressRepository;
	@Autowired
    private UserRepository userRepository;

    // Place order
    @Transactional
    public OrderDTO placeOrder(Long shippingAddressId) {
        Long userId = getCurrentUserId();
        Cart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new IllegalArgumentException("Cart is empty"));

        if (cart.getCartItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        Address address = addressRepository.findById(shippingAddressId)
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Invalid shipping address"));

        // Validate stock
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }
        }

        // Create order
        Order order = new Order();
        order.setUser(cart.getUser());
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setShippingAddress(address);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        order.setOrderItems(new ArrayList<OrderItem>());

        // Add order items and update stock
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItem.setSubTotal(product.getPrice().multiply(new BigDecimal(cartItem.getQuantity())));
            order.getOrderItems().add(orderItem);

            // Update stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            totalAmount = totalAmount.add(orderItem.getSubTotal());
        }

        order.setTotalAmount(totalAmount);
        order = orderRepository.save(order);

        return toDTO(order);
    }

    // Get user orders
    public List<OrderDTO> getUserOrders() {
        Long userId = getCurrentUserId();
        return orderRepository.findByUserId(userId).stream().map(this::toDTO).toList();
    }
    
    //Delete user oder
    public void deleteOrder(Long id) {
    	Long userId = getCurrentUserId();
    	orderRepository.findById(id)
    		.filter(order->order.getUser().getId().equals(userId))
    		.ifPresent(orderRepository::delete);
    	
    }

    // Get order details
    public Optional<OrderDTO> getOrderDetails(Long id) {
        Long userId = getCurrentUserId();
        return orderRepository.findByIdAndUserIdWithDetails(id, userId).map(this::toDTO);
    }

    // Update order status (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Optional<OrderDTO> updateOrderStatus(Long id, Order.OrderStatus status) {
        return orderRepository.findById(id).map(order -> {
            order.setStatus(status);
            order = orderRepository.save(order);
            return toDTO(order);
        });
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderDTO> getAllOrders(){
    	return orderRepository.findAll().stream().map(this::toDTO).toList();
    }

    // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Convert entity to DTO
    private OrderDTO toDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUser().getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setStatus(order.getStatus().name());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingAddressId(order.getShippingAddress().getId());
        dto.setPaymentStatus(order.getPaymentStatus().name());
        dto.setOrderItems(order.getOrderItems().stream().map(this::toOrderItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private OrderItemDTO toOrderItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubTotal(item.getSubTotal());
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