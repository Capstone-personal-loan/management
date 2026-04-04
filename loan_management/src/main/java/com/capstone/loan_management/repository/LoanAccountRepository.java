
package com.capstone.loan_management.repository;

import com.capstone.loan_management.model.LoanAccount;
import com.capstone.loan_management.model.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanAccountRepository extends JpaRepository<LoanAccount, Long> {

    Optional<LoanAccount> findByLoanApplication(LoanApplication loanApplication);

    List<LoanAccount> findByStatus(String status);
}