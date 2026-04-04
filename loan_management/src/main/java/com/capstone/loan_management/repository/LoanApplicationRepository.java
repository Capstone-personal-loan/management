package com.capstone.loan_management.repository;

import com.capstone.loan_management.model.LoanApplication;
import com.capstone.loan_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    List<LoanApplication> findByUser(User user);

    List<LoanApplication> findByStatus(String status);
}
