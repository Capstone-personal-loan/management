package com.capstone.loan_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmiScheduleResponseDTO {
    private Long id;
    private Integer installmentNumber;
    private LocalDate dueDate;
    private Double emiAmount;
    private Double principalComponent;
    private Double interestComponent;
    private String status;
}