package com.Ecommerce.Entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Variant {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	private String name;
	private String sku;
	private int additionalCost;
	private int stockCount;
	
	@ManyToOne
	@JoinColumn(name="product_id")
	private Product product;
	
	// Getters and setters

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public int getAdditionalCost() {
		return additionalCost;
	}

	public void setAdditionalCost(int additionalCost) {
		this.additionalCost = additionalCost;
	}

	public int getStockCount() {
		return stockCount;
	}

	public void setStockCount(int stockCount) {
		this.stockCount = stockCount;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	@Override
	public String toString() {
		return "Variant [id=" + id + ", name=" + name + ", sku=" + sku + ", additionalCost=" + additionalCost
				+ ", stockCount=" + stockCount + ", product=" + product + "]";
	}

	public Variant(int id, String name, String sku, int additionalCost, int stockCount, Product product) {
		super();
		this.id = id;
		this.name = name;
		this.sku = sku;
		this.additionalCost = additionalCost;
		this.stockCount = stockCount;
		this.product = product;
	}

	public Variant() {
		super();
	}
	
	
}

