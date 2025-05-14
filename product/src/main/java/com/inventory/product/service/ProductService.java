package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.ProductDTO;
import com.inventory.product.entity.Product;
import com.inventory.product.repository.ProductRepository;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
	@Autowired
    private ProductRepository productRepository;

    // Get all products (public)
    public List<ProductDTO> getAllProducts(String searchTerm, String categoryName) {
        List<Product> products;
        if (searchTerm != null && !searchTerm.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(searchTerm);
        } else if (categoryName != null) {
            products = productRepository.findByCategoryContainingIgnoreCase(categoryName);
        } else {
            products = productRepository.findAll();
        }
        return products.stream().map(this::toDTO).toList();
    }

    // Get product by ID (public)
    public Optional<ProductDTO> getProductById(Long id) {
        return productRepository.findById(id).map(this::toDTO);
    }

    // Create product (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = new Product();
        updateProductFromDTO(product, productDTO);
        product = productRepository.save(product);
        return toDTO(product);
    }

    // Update product (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public Optional<ProductDTO> updateProduct(Long id, ProductDTO productDTO) {
        return productRepository.findById(id).map(product -> {
            updateProductFromDTO(product, productDTO);
            product = productRepository.save(product);
            return toDTO(product);
        });
    }

    // Delete product (admin only)
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Convert entity to DTO
    private ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setStockQuantity(product.getStockQuantity());
        dto.setCategory(product.getCategory() != null ? product.getCategory() : null);
        dto.setImageUrl(product.getImageUrl());
        return dto;
    }

    // Update entity from DTO
    private void updateProductFromDTO(Product product, ProductDTO dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        // Note: Category setting requires CategoryRepository if categoryId is provided
        product.setImageUrl(dto.getImageUrl());
    }
}
