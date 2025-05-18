package com.inventory.product.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.GoodsDTO;
import com.inventory.product.entity.Goods;
import com.inventory.product.entity.User;
import com.inventory.product.repository.GoodsRepository;
import com.inventory.product.repository.UserRepository;

@Service
public class GoodsService {
	@Autowired
    private GoodsRepository goodsRepository;
	@Autowired
    private UserRepository userRepository;

    // Get all products (public)
    public List<GoodsDTO> getAllGoods() {
        Long userId = getCurrentUserId(); 
        List<Goods> goods = goodsRepository.findByVendorId(userId);
        return goods.stream().map(this::toDTO).toList();
    }
    
    //get goods for Admin.
    public List<GoodsDTO> getByVendorId(Long vendorId){
    	List<Goods> goods = goodsRepository.findByVendorId(vendorId);
    	return goods.stream().map(this::toDTO).toList();
    }
    
    @PreAuthorize("hasRole('VENDOR')")
    @Transactional
    public List<GoodsDTO> addProducts(List<GoodsDTO> productDTOs) {
        List<Goods> products = productDTOs.stream().map(this::toEntity).collect(Collectors.toList());
        List<Goods> savedProducts = goodsRepository.saveAll(products);
        return savedProducts.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Get product by ID (public)
    public Optional<GoodsDTO> getGoodsById(Long id) {
        return goodsRepository.findById(id).map(this::toDTO);
    }

    // Create product (vendor only)
//    @PreAuthorize("hasRole('VENDOR')")
//    @Transactional
//    public GoodsDTO createGoods(GoodsDTO goodsDTO) {
//        Goods goods = new Goods();
//        updateGoodsFromDTO(goods, goodsDTO);
//        goods = goodsRepository.save(goods);
//        return toDTO(goods);
//    }

    // Update product (vendor only)
    @PreAuthorize("hasRole('VENDOR')")
    @Transactional
    public Optional<GoodsDTO> updateGoods(Long id, GoodsDTO goodsDTO) {
        return goodsRepository.findById(id).map(goods -> {
        	updateGoodsFromDTO(goods, goodsDTO);
            goods = goodsRepository.save(goods);
            return toDTO(goods);
        });
    }

    // Delete product (vendor only)
    @PreAuthorize("hasRole('VENDOR')")
    @Transactional
    public void deleteGoods(Long id) {
    	goodsRepository.deleteById(id);
    }
    
 // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Convert entity to DTO
    private GoodsDTO toDTO(Goods goods) {
    	GoodsDTO dto = new GoodsDTO();
        dto.setId(goods.getId());
        dto.setVendorId(goods.getVendorId());
        dto.setName(goods.getName());
        dto.setDescription(goods.getDescription());
        dto.setPrice(goods.getPrice());
        dto.setStockQuantity(goods.getStockQuantity());
        dto.setCategory(goods.getCategory() != null ? goods.getCategory() : null);
        dto.setGoodsStatus(goods.getGoodsStatus().name());
        dto.setImageUrl(goods.getImageUrl());
        return dto;
    }
    
    private Goods toEntity(GoodsDTO dto) {
    	Goods goods = new Goods();
    	goods.setVendorId(getCurrentUserId());
    	goods.setName(dto.getName());
    	goods.setDescription(dto.getDescription());
    	goods.setPrice(dto.getPrice());
    	goods.setStockQuantity(dto.getStockQuantity());
    	goods.setCategory(dto.getCategory());
    	goods.setGoodsStatus(Goods.GoodsStatus.valueOf(dto.getGoodsStatus()));
    	goods.setImageUrl(dto.getImageUrl());
    	return goods;
    }

    // Update entity from DTO
    private void updateGoodsFromDTO(Goods goods, GoodsDTO dto) {
    	goods.setVendorId(dto.getVendorId());
    	goods.setName(dto.getName());
    	goods.setDescription(dto.getDescription());
    	goods.setPrice(dto.getPrice());
    	goods.setStockQuantity(dto.getStockQuantity());
    	goods.setCategory(dto.getCategory());
    	goods.setGoodsStatus(Goods.GoodsStatus.valueOf(dto.getGoodsStatus()));
    	goods.setImageUrl(dto.getImageUrl());
    }
}

