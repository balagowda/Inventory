package com.inventory.product.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.inventory.product.entity.BuyOrder;

@Repository
public interface BuyOrderRepository extends JpaRepository<BuyOrder, Long>{
	public List<BuyOrder> findByVendorId(Long id);
	
	public List<BuyOrder> findByUserId(Long id);
}
