package com.capstone.loan_management.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplicationResponseDTO {
    private Long id;
    private String applicantName;
    private Double monthlyIncome;
    private Double requestedAmount;
    private Integer tenureMonths;
    private String purpose;
    private String status;
    private String rejectionReason;
    private LocalDateTime appliedAt;
}