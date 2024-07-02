package com.Ecommerce.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.Ecommerce.Entity.Product;
import com.Ecommerce.Entity.Variant;
import com.Ecommerce.Services.ProductService;

@Controller
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable int id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public Product saveProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable int id) {
        productService.deleteProduct(id);
    }

    // Additional methods for variants

    @GetMapping("/{productId}/variants")
    public List<Variant> getVariantsByProduct(@PathVariable int productId) {
        Product product = productService.getProductById(productId);
        return productService.getVariantsByProduct(product);
    }

    @PostMapping("/{productId}/variants")
    public Variant saveVariant(@PathVariable int productId, @RequestBody Variant variant) {
        Product product = productService.getProductById(productId);
        variant.setProduct(product);
        return productService.saveVariant(variant);
    }

    @DeleteMapping("/variants/{id}")
    public void deleteVariant(@PathVariable int id) {
        productService.deleteVariant(id);
    }
}
