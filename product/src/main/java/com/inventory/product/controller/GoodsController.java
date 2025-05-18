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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventory.product.dto.GoodsDTO;
import com.inventory.product.service.GoodsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/goods")
public class GoodsController {

    @Autowired
    private GoodsService goodsService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<GoodsDTO>> createGoods(@Valid @RequestBody List<GoodsDTO> goodsDTO) {
    	List<GoodsDTO> createdGoods = goodsService.addProducts(goodsDTO);
        return new ResponseEntity<>(createdGoods, HttpStatus.CREATED);
    }

    @GetMapping("/byid/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<GoodsDTO> getGoods(@PathVariable Long id) {
        GoodsDTO goods = goodsService.getGoodsById(id).get();
        return ResponseEntity.ok(goods);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<GoodsDTO> updateGoods(@PathVariable Long id, @Valid @RequestBody GoodsDTO goodsDTO) {
        GoodsDTO updatedGoods = goodsService.updateGoods(id,goodsDTO).get();
        return ResponseEntity.ok(updatedGoods);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Void> deleteGoods(@PathVariable Long id) {
    	goodsService.deleteGoods(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/vendor/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GoodsDTO>> getByVendor(@PathVariable Long id){
    	List<GoodsDTO> goods = goodsService.getByVendorId(id);
    	return ResponseEntity.ok(goods);
    }

    @GetMapping("/catalog")
    @PreAuthorize("hasAnyRole('VENDOR')")
    public ResponseEntity<List<GoodsDTO>> getAllProducts() {
        List<GoodsDTO> goods = goodsService.getAllGoods();
        return ResponseEntity.ok(goods);
    }
}