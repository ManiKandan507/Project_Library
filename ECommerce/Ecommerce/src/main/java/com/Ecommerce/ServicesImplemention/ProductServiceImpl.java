package com.Ecommerce.ServicesImplemention;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Ecommerce.Entity.Product;
import com.Ecommerce.Entity.Variant;
import com.Ecommerce.Repositories.ProductRepository;
import com.Ecommerce.Repositories.VariantRepository;
import com.Ecommerce.Services.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    
    private ProductRepository productRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product getProductById(int id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(int id) {
        productRepository.deleteById(id);
    }

    @Override
    public List<Variant> getVariantsByProduct(Product product) {
        return variantRepository.findByProduct(product);
    }

    @Override
    public Variant saveVariant(Variant variant) {
        return variantRepository.save(variant);
    }

    @Override
    public void deleteVariant(int id) {
       
        variantRepository.deleteById(id);
    }
}
