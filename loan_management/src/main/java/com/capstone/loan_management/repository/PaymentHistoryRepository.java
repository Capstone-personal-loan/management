package com.capstone.loan_management.repository;

import com.capstone.loan_management.model.LoanAccount;
import com.capstone.loan_management.model.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {

    List<PaymentHistory> findByLoanAccount(LoanAccount loanAccount);
}
