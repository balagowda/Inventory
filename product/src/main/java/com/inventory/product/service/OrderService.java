package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.BuyItemDTO;
import com.inventory.product.dto.BuyOrderDTO;
import com.inventory.product.dto.BuyOrderItemDTO;
import com.inventory.product.dto.OrderDTO;
import com.inventory.product.dto.OrderItemDTO;
import com.inventory.product.entity.Address;
import com.inventory.product.entity.BuyOrder;
import com.inventory.product.entity.BuyOrderItem;
import com.inventory.product.entity.Cart;
import com.inventory.product.entity.CartItem;
import com.inventory.product.entity.Goods;
import com.inventory.product.entity.Order;
import com.inventory.product.entity.Order.OrderStatus;
import com.inventory.product.entity.OrderItem;
import com.inventory.product.entity.Product;
import com.inventory.product.entity.User;
import com.inventory.product.repository.AddressRepository;
import com.inventory.product.repository.BuyOrderRepository;
import com.inventory.product.repository.CartRepository;
import com.inventory.product.repository.GoodsRepository;
import com.inventory.product.repository.OrderRepository;
import com.inventory.product.repository.ProductRepository;
import com.inventory.product.repository.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
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
	@Autowired
	private GoodsRepository goodsRepository;
	@Autowired
	private BuyOrderRepository buyOrderRepository;

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
    
    //admin get products from vendors
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public BuyOrderDTO buyOrder(Long vendorId, List<BuyItemDTO> itemDTO) {
    	for(BuyItemDTO dto: itemDTO) {
    		Goods goods = goodsRepository.findById(dto.getProductId())
    				.orElseThrow(() -> new IllegalArgumentException("Goods not found"));
    		if (goods.getStockQuantity() < dto.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for goods: " + goods.getName());
            }
    	}
    	
    	User user = userRepository.findById(getCurrentUserId()).orElseThrow(() -> new IllegalArgumentException("User Not found"));
    	
    	BuyOrder order = new BuyOrder();
    	order.setUser(user);
    	order.setVendorId(vendorId);
    	order.setOrderDate(LocalDateTime.now());
    	order.setStatus(BuyOrder.BuyOrderStatus.PENDING);
    	order.setPaymentStatus(BuyOrder.PaymentStatus.PENDING);
    	order.setOrderItems(new ArrayList<BuyOrderItem>());
    	
    	// Add order items and update stock
        BigDecimal totalAmount = BigDecimal.ZERO;
    	for(BuyItemDTO dto: itemDTO) {
    		Goods goods = goodsRepository.findById(dto.getProductId()).get();
    		BuyOrderItem item = new BuyOrderItem();
    		item.setOrder(order);
    		item.setGoods(goods);
    		item.setQuantity(dto.getQuantity());
    		item.setUnitPrice(goods.getPrice());
    		item.setSubTotal(goods.getPrice().multiply(new BigDecimal(item.getQuantity())));
    		order.getOrderItems().add(item);
    		
    		goods.setStockQuantity(goods.getStockQuantity()-item.getQuantity());
    		goodsRepository.save(goods);
    		
    		totalAmount = totalAmount.add(item.getSubTotal());
    	}
    	
    	order.setTotalAmount(totalAmount);
    	order = buyOrderRepository.save(order);
    	
    	
    	
    	return toBuyOrderDTO(order);
    }

    // Get user orders
    public List<OrderDTO> getUserOrders() {
        Long userId = getCurrentUserId();
        return orderRepository.findByUserId(userId).stream().map(this::toDTO).toList();
    }
    
    //Delete user oder
    public void deleteOrder(Long id) {
    	Long userId = getCurrentUserId();
    	Optional<Order> userOrder = orderRepository.findById(id)
    		.filter(order->order.getUser().getId().equals(userId));
    	
    	if(userOrder.isEmpty()) throw new IllegalArgumentException("Order Not found");
    	
    	Order uOrder = userOrder.get();
    	List<OrderItem> orderItems = uOrder.getOrderItems();
    	
    	List<Product> products = productRepository.findAll();

        // Map product names to the actual product for quick lookup and update
        Map<String, Product> productMap = products.stream()
            .collect(Collectors.toMap(Product::getName, Function.identity(), (a, b) -> a));
        
        for(OrderItem item: orderItems) {
        	Product currentItem = item.getProduct();
        	Integer quantity = item.getQuantity();
        	
        	if(productMap.containsKey(currentItem.getName())) {
        		Product product = productMap.get(currentItem.getName());
        		product.setStockQuantity(product.getStockQuantity() + quantity);
        	}
        }
        uOrder.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(uOrder);
        productRepository.saveAll(productMap.values());
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
    
    @PreAuthorize("hasRole('VENDOR')")
    @Transactional
    public Optional<BuyOrderDTO> updateVendorOrderStatus(Long id, BuyOrder.BuyOrderStatus status) {
       return buyOrderRepository.findById(id).map(order -> {
            order.setStatus(status);
            order = buyOrderRepository.save(order);
            
            if (status == BuyOrder.BuyOrderStatus.DELIVERED) {
                List<Product> products = productRepository.findAll();

                // Map product names to the actual product for quick lookup and update
                Map<String, Product> productMap = products.stream()
                    .collect(Collectors.toMap(Product::getName, Function.identity(), (a, b) -> a));

                List<BuyOrderItem> items = order.getOrderItems();

                for (BuyOrderItem item : items) {
                    Goods currentItem = item.getGoods();
                    int itemQuantity = item.getQuantity();

                    if (productMap.containsKey(currentItem.getName())) {
                        // Product exists — update stock
                        Product existingProduct = productMap.get(currentItem.getName());
                        existingProduct.setStockQuantity(existingProduct.getStockQuantity() + itemQuantity);
                    } else {
                        // Product doesn't exist — create new
                        Product newProduct = new Product();
                        newProduct.setVendorId(currentItem.getVendorId());
                        newProduct.setName(currentItem.getName());
                        newProduct.setDescription(currentItem.getDescription());
                        newProduct.setPrice(currentItem.getPrice());
                        newProduct.setStockQuantity(itemQuantity);
                        newProduct.setCategory(currentItem.getCategory());
                        newProduct.setImageUrl(currentItem.getImageUrl());
                        newProduct.setProductStatus(Product.ProductStatus.AVAILABLE);
                        productMap.put(currentItem.getName(), newProduct);
                    }
                }
                productRepository.saveAll(productMap.values());
            }
            
            return toBuyOrderDTO(order);
        });
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderDTO> getAllOrders(){
    	return orderRepository.findAll().stream().map(this::toDTO).toList();
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    public List<BuyOrderDTO> getAllBuyOrders(){
    	return buyOrderRepository.findByUserId(getCurrentUserId()).stream().map(this::toBuyOrderDTO).toList();
    }
    
    @PreAuthorize("hasRole('VENDOR')")
    public List<BuyOrderDTO> getAllVendorOrders(){
    	return buyOrderRepository.findByVendorId(getCurrentUserId()).stream().map(this::toBuyOrderDTO).toList();
    }

    // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
    
    //convert into buyorderDto
    private BuyOrderDTO toBuyOrderDTO(BuyOrder order) {
    	BuyOrderDTO dto = new BuyOrderDTO();
    	
    	dto.setId(order.getId());
    	dto.setUserId(order.getUser().getId());
    	dto.setVendorId(order.getVendorId());
    	dto.setOrderDate(order.getOrderDate());
    	dto.setStatus(order.getStatus().name());
    	dto.setTotalAmount(order.getTotalAmount());
    	dto.setPaymentStatus(order.getPaymentStatus().name());
    	dto.setOrderItems(order.getOrderItems().stream().map(this::toBuyOrderItemDTO).toList());
    	
    	return dto;
    }
    
    private BuyOrderItemDTO toBuyOrderItemDTO(BuyOrderItem item) {
        BuyOrderItemDTO dto = new BuyOrderItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubTotal(item.getSubTotal());
        dto.setGoods(new Goods());
        Goods goods = item.getGoods();
        
        dto.getGoods().setId(goods.getId());
        dto.getGoods().setName(goods.getName());
        dto.getGoods().setPrice(goods.getPrice());
        dto.getGoods().setCategory(goods.getCategory());
        dto.getGoods().setCreatedAt(goods.getCreatedAt());
        dto.getGoods().setDescription(goods.getDescription());
        dto.getGoods().setImageUrl(goods.getImageUrl());
        dto.getGoods().setStockQuantity(goods.getStockQuantity());
        dto.getGoods().setGoodsStatus(goods.getGoodsStatus());
        dto.getGoods().setUpdatedAt(goods.getUpdatedAt());
        return dto;
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
        dto.getProduct().setVendorId(product.getVendorId());
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