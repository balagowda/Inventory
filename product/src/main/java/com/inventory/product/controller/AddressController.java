package com.inventory.product.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.inventory.product.dto.AddressDTO;
import com.inventory.product.service.AddressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/address")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PostMapping("/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO createdAddress = addressService.createAddress(addressDTO);
        System.out.println(createdAddress);
        return new ResponseEntity<>(createdAddress, HttpStatus.CREATED);
    }

    @GetMapping("/byid/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> getAddress(@PathVariable Long id) {
        AddressDTO address = addressService.getAddressBYId(id).get();
        return ResponseEntity.ok(address);
    }
    
    @GetMapping("/catalog")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<AddressDTO>> getAllAddress() {
        List<AddressDTO> address = addressService.getUserAddresses();
        return ResponseEntity.ok(address);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Long id, @Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO updatedAddress = addressService.updateAddress(id,addressDTO).get();
        return ResponseEntity.ok(updatedAddress);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }
}