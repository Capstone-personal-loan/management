package com.capstone.loan_management.dto;



import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentHistoryResponseDTO {
    private Long id;
    private Double paidAmount;
    private LocalDateTime paidAt;
    private String remarks;
    private Integer installmentNumber;
}