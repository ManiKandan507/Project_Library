package com.Ecommerce.Repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Ecommerce.Entity.Product;
import com.Ecommerce.Entity.Variant;


@Repository
public interface VariantRepository extends JpaRepository<Variant, Integer> {
	List<Variant> findByProduct(Product product);

}
