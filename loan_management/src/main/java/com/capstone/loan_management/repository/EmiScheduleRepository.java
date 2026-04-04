package com.capstone.loan_management.repository;

import com.capstone.loan_management.model.EmiSchedule;
import com.capstone.loan_management.model.LoanAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmiScheduleRepository extends JpaRepository<EmiSchedule, Long> {

    List<EmiSchedule> findByLoanAccount(LoanAccount loanAccount);

    List<EmiSchedule> findByLoanAccountAndStatus(LoanAccount loanAccount, String status);

    Optional<EmiSchedule> findByLoanAccountAndInstallmentNumber(LoanAccount loanAccount, Integer installmentNumber);
}
