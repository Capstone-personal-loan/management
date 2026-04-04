package com.capstone.loan_management.controller;

import com.capstone.loan_management.dto.*;
import com.capstone.loan_management.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;

    // USER ENDPOINTS

    @PostMapping("/loans/apply")
    public ResponseEntity<String> applyForLoan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody LoanApplicationRequestDTO dto) {
        String response = loanService.applyForLoan(userDetails.getUsername(), dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/loans/my")
    public ResponseEntity<List<LoanApplicationResponseDTO>> getMyApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.getMyApplications(userDetails.getUsername()));
    }

    @GetMapping("/loans/{applicationId}/emi")
    public ResponseEntity<List<EmiScheduleResponseDTO>> getEmiSchedule(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(loanService.getEmiSchedule(applicationId));
    }

    @GetMapping("/loans/{applicationId}/account")
    public ResponseEntity<LoanAccountResponseDTO> getLoanAccount(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(loanService.getLoanAccount(applicationId));
    }

    @PostMapping("/loans/pay")
    public ResponseEntity<String> makePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody PaymentRequestDTO dto) {
        String response = loanService.makePayment(userDetails.getUsername(), dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/loans/{applicationId}/payments")
    public ResponseEntity<List<PaymentHistoryResponseDTO>> getPaymentHistory(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(loanService.getPaymentHistory(applicationId));
    }

    // ADMIN ENDPOINTS

    @GetMapping("/admin/applications")
    public ResponseEntity<List<LoanApplicationResponseDTO>> getAllApplications() {
        return ResponseEntity.ok(loanService.getAllApplications());
    }

    @PutMapping("/admin/applications/{applicationId}/review")
    public ResponseEntity<String> reviewApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AdminReviewDTO dto) {
        String response = loanService.reviewApplication(applicationId, userDetails.getUsername(), dto);
        return ResponseEntity.ok(response);
    }
}