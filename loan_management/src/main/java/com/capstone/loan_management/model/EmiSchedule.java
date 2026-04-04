package com.capstone.loan_management.model;

import jakarta.persistence.Column;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;


@Entity
@Table(name = "emi_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmiSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "loan_account_id", nullable = false)
    private LoanAccount loanAccount;


    @Column(nullable = false)
    private Integer installmentNumber;


    @Column(nullable = false)
    private LocalDate dueDate;


    @Column(nullable = false)
    private Double emiAmount;


    @Column(nullable = false)
    private Double principalComponent;


    @Column(nullable = false)
    private Double interestComponent;


    @Column(nullable = false)
    private String status;

    @PrePersist
    public void prePersist() {
        this.status = "PENDING";
    }
}