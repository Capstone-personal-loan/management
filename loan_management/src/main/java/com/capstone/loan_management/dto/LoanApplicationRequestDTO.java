package com.capstone.loan_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplicationRequestDTO {
    private Double monthlyIncome;
    private Double requestedAmount;
    private Integer tenureMonths;
    private String purpose;
}