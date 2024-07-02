package com.Ecommerce.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Ecommerce.Entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product,Integer> {

}
