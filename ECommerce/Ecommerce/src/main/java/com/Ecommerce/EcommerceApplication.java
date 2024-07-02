package com.Ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

//@SpringBootApplication(scanBasePackages="com.Ecommerce")
@SpringBootApplication
@EntityScan(basePackages ="com.Ecommerce")
public class EcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
		System.out.println("Bala");
	}

}
