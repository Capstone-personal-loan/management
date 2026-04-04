package com.capstone.loan_management.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@Table(name="loan_Accounts")
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class LoanAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "loan_application_id", nullable = false)
    private LoanApplication loanApplication;

    @Column(nullable = false)
    private Double principalAmount;

    @Column(nullable = false)
    private Double interestRate;

    @Column(nullable = false)
    private Integer tenureMonths;


    @Column(nullable = false)
    private Double emiAmount;


    @Column(nullable = false)
    private Double totalPayable;


    @Column(nullable = false)
    private Double outstandingBalance;


    @Column(nullable = false)
    private LocalDate startDate;


    @Column(nullable = false)
    private String status;

    @PrePersist
    public void prePersist() {
        this.status = "ACTIVE";
        this.outstandingBalance = this.principalAmount;

    }
}
