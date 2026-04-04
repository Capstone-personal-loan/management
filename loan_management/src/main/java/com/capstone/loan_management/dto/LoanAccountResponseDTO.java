package com.capstone.loan_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanAccountResponseDTO {
    private Long id;
    private Double principalAmount;
    private Double interestRate;
    private Integer tenureMonths;
    private Double emiAmount;
    private Double totalPayable;
    private Double outstandingBalance;
    private LocalDate startDate;
    private String status;
}