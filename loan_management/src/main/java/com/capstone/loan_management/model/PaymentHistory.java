package com.capstone.loan_management.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "payment_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "loan_account_id", nullable = false)
    private LoanAccount loanAccount;


    @ManyToOne
    @JoinColumn(name = "emi_schedule_id", nullable = false)
    private EmiSchedule emiSchedule;

    @Column(nullable = false)
    private Double paidAmount;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @Column
    private String remarks;

    @PrePersist
    public void prePersist() {
        this.paidAt = LocalDateTime.now();
    }
}