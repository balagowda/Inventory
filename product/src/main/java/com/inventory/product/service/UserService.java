package com.inventory.product.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.inventory.product.dto.UserDTO;
import com.inventory.product.entity.User;
import com.inventory.product.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
	@Autowired
    private UserRepository userRepository;
	@Autowired
    private PasswordEncoder passwordEncoder;

    // Register new user
    @Transactional
    public UserDTO registerUser(UserDTO userDTO) {
        if (userRepository.findByUsername(userDTO.getUsername()).isPresent() ||
            userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Username or email already exists");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setFullName(userDTO.getFullName());
        user.setRole(userDTO.getRole().equals("Customer") ? User.Role.CUSTOMER:User.Role.VENDOR);
        user.setPhoneNumber(userDTO.getPhoneNumber());

        user = userRepository.save(user);
        return toDTO(user);
    }

    // Get current user's profile
    public Optional<UserDTO> getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(this::toDTO);
    }
    
    public Optional<UserDTO> getUserById(Long id){
    	return userRepository.findById(id).map(this::toDTO);
    }
    
    public List<UserDTO> getVendors(){
    	List<User> vendors = userRepository.findByRole(User.Role.VENDOR);
    	return vendors.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Update user profile
    @Transactional
    public Optional<UserDTO> updateUser(UserDTO userDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).map(user -> {
            user.setEmail(userDTO.getEmail());
            user.setFullName(userDTO.getFullName());
            user.setPhoneNumber(userDTO.getPhoneNumber());
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty() && !(userDTO.getPassword().length()==60)) {
                user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
            }
            user = userRepository.save(user);
            return toDTO(user);
        });
    }
    
    @Transactional
    public void deleteUser(Long id) {
    	userRepository.deleteById(id);
    }

    // Convert entity to DTO
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole().name());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setPassword(user.getPassword());
        return dto;
    }
}
