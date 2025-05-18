package com.inventory.product.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.BuyOrderItem;

@Repository
public interface BuyOrderItemRepository extends JpaRepository<BuyOrderItem, Long>{

}
