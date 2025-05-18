package com.inventory.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.Goods;

@Repository
public interface GoodsRepository extends JpaRepository<Goods, Long> {

    // Search products by name or description (case-insensitive)
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Goods> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            @Param("searchTerm") String searchTerm);

    // Find products by category ID
    List<Goods> findByVendorId(Long vendorId);

    // Find products with low stock (for alerts)
    List<Goods> findByStockQuantityLessThan(Integer threshold);
}