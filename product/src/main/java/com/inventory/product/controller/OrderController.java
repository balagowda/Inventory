package com.inventory.product.controller;

import java.util.List;
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

import com.inventory.product.dto.BuyItemDTO;
import com.inventory.product.dto.BuyOrderDTO;
import com.inventory.product.dto.OrderDTO;
import com.inventory.product.entity.BuyOrder;
import com.inventory.product.entity.Order;
import com.inventory.product.service.OrderService;

import jakarta.validation.Valid;

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
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        Optional<OrderDTO> orders = orderService.getOrderDetails(id);
        return orders
        .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NO_CONTENT));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('CUSTOMER','VENDOR')")
    public ResponseEntity<List<OrderDTO>> getUserOrder() {
        List<OrderDTO> updatedOrder = orderService.getUserOrders();
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PostMapping("/buyorder/{vendorId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BuyOrderDTO> buyOrder(@PathVariable Long  vendorId, @Valid @RequestBody List<BuyItemDTO> orderItems){
    	BuyOrderDTO createdBuyOrder = orderService.buyOrder(vendorId, orderItems);
    	return new ResponseEntity<>(createdBuyOrder, HttpStatus.CREATED);
    }
    
    @GetMapping("/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrder() {
        List<OrderDTO> getOrder = orderService.getAllOrders();
        return ResponseEntity.ok(getOrder);
    }
    
    @GetMapping("/buyorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BuyOrderDTO>> getAllBuyOrder() {
        List<BuyOrderDTO> buyOrder = orderService.getAllBuyOrders();
        return ResponseEntity.ok(buyOrder);
    }
    
    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<BuyOrderDTO>> getAllVendorOrder() {
        List<BuyOrderDTO> vendorOrder = orderService.getAllVendorOrders();
        return ResponseEntity.ok(vendorOrder);
    }
    
    @PutMapping("/vendorupdate/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<BuyOrderDTO> updateVendorOrderStatus(@PathVariable Long id, @RequestBody String status) {
        Optional<BuyOrderDTO> updatedOrder = orderService.updateVendorOrderStatus(id,BuyOrder.BuyOrderStatus.valueOf(status));
        return updatedOrder
                .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NO_CONTENT));
    }
    
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        Optional<OrderDTO> updatedOrder = orderService.updateOrderStatus(id,Order.OrderStatus.valueOf(status));
        return updatedOrder
                .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NO_CONTENT));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
