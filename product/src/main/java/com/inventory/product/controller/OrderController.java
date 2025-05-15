package com.inventory.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventory.product.dto.OrderDTO;
import com.inventory.product.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody Long shippingId) {
        OrderDTO createdOrder = orderService.placeOrder(shippingId);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    @GetMapping("/byid/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderDetails(id).get();
        return ResponseEntity.ok(order);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDTO>> updateOrder() {
        List<OrderDTO> updatedOrder = orderService.getUserOrders();
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
