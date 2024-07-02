package com.Ecommerce.Services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Ecommerce.Entity.Product;
import com.Ecommerce.Entity.Variant;

public interface ProductService {
	 List<Product> getAllProducts();
	    Product getProductById(int id);
	    Product saveProduct(Product product);
	    void deleteProduct(int id);

	    // Additional methods for variants
	    List<Variant> getVariantsByProduct(Product product);
	    Variant saveVariant(Variant variant);
	    void deleteVariant(int id);
}
