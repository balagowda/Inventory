package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.AddressDTO;
import com.inventory.product.entity.Address;
import com.inventory.product.entity.User;
import com.inventory.product.repository.AddressRepository;
import com.inventory.product.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AddressService {
	@Autowired
    private AddressRepository addressRepository;
	@Autowired
    private UserRepository userRepository;

    // Get addresses for current user
    public List<AddressDTO> getUserAddresses() {
        Long userId = getCurrentUserId();
        return addressRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<AddressDTO> getAddressBYId(Long id){
    	Long userId = getCurrentUserId();
    	return addressRepository.findByUserIdAndAddressId(userId,id).map(this::toDTO);
    }

    // Create address
    @Transactional
    public AddressDTO createAddress(AddressDTO addressDTO) {
        Long userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Address address = new Address();
        address.setUser(user);
        address.setStreet(addressDTO.getStreet());
        address.setCity(addressDTO.getCity());
        address.setState(addressDTO.getState());
        address.setPostalCode(addressDTO.getPostalCode());
        address.setCountry(addressDTO.getCountry());

        address = addressRepository.save(address);
        return toDTO(address);
    }

    // Update address
    @Transactional
    public Optional<AddressDTO> updateAddress(Long id, AddressDTO addressDTO) {
        Long userId = getCurrentUserId();
        return addressRepository.findById(id)
                .filter(address -> address.getUser().getId().equals(userId))
                .map(address -> {
                    address.setStreet(addressDTO.getStreet());
                    address.setCity(addressDTO.getCity());
                    address.setState(addressDTO.getState());
                    address.setPostalCode(addressDTO.getPostalCode());
                    address.setCountry(addressDTO.getCountry());
                    address = addressRepository.save(address);
                    return toDTO(address);
                });
    }

    // Delete address
    @Transactional
    public void deleteAddress(Long id) {
        Long userId = getCurrentUserId();
        addressRepository.findById(id)
                .filter(address -> address.getUser().getId().equals(userId))
                .ifPresent(addressRepository::delete);
    }

    // Get current user ID
    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    // Convert entity to DTO
    private AddressDTO toDTO(Address address) {
        AddressDTO dto = new AddressDTO();
        dto.setId(address.getId());
        dto.setUserId(address.getUser().getId());
        dto.setStreet(address.getStreet());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        return dto;
    }
}