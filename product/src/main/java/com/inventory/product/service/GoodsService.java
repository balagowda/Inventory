package com.inventory.product.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.GoodsDTO;
import com.inventory.product.entity.Goods;
import com.inventory.product.repository.GoodsRepository;

@Service
public class GoodsService {
	@Autowired
    private GoodsRepository goodsRepository;

    // Get all products (public)
    public List<GoodsDTO> getAllGoods(String searchTerm, String categoryName) {
        List<Goods> products;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            products = goodsRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(searchTerm);
        } else if (categoryName != null) {
            products = goodsRepository.findByCategoryContainingIgnoreCase(categoryName);
        } else {
            products = goodsRepository.findAll();
        }
        return products.stream().map(this::toDTO).toList();
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
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteGoods(Long id) {
    	goodsRepository.deleteById(id);
    }

    // Convert entity to DTO
    private GoodsDTO toDTO(Goods goods) {
    	GoodsDTO dto = new GoodsDTO();
        dto.setId(goods.getId());
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
    	goods.setName(dto.getName());
    	goods.setDescription(dto.getDescription());
    	goods.setPrice(dto.getPrice());
    	goods.setStockQuantity(dto.getStockQuantity());
    	goods.setCategory(dto.getCategory());
    	goods.setGoodsStatus(Goods.GoodsStatus.valueOf(dto.getGoodsStatus()));
    	goods.setImageUrl(dto.getImageUrl());
    }
}

