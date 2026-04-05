package com.capstone.loan_management.service;

import com.capstone.loan_management.dto.*;
import com.capstone.loan_management.model.*;
import com.capstone.loan_management.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

        private final LoanApplicationRepository loanApplicationRepository;
        private final LoanAccountRepository loanAccountRepository;
        private final EmiScheduleRepository emiScheduleRepository;
        private final PaymentHistoryRepository paymentHistoryRepository;
        private final UserRepository userRepository;

        // APPLY FOR LOAN
        public String applyForLoan(String email, LoanApplicationRequestDTO dto) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // CHECK INCOME FIRST before anything else
                if (dto.getMonthlyIncome() < 15000) {
                        throw new RuntimeException("Minimum monthly income required is 15000");
                }

                if (dto.getTenureMonths() < 6 || dto.getTenureMonths() > 60) {
                        throw new RuntimeException("Tenure must be between 6 and 60 months");
                }

                double maxLoanAmount = dto.getMonthlyIncome() * 10;
                if (dto.getRequestedAmount() > maxLoanAmount) {
                        throw new RuntimeException("Loan amount exceeds 10x your monthly income");
                }

                double emi = calculateEmi(dto.getRequestedAmount(), 12.0, dto.getTenureMonths());
                double foirLimit = dto.getMonthlyIncome() * 0.5;
                if (emi > foirLimit) {
                        throw new RuntimeException("EMI exceeds 50% of your monthly income");
                }

                LoanApplication application = new LoanApplication();
                application.setUser(user);
                application.setMonthlyIncome(dto.getMonthlyIncome());
                application.setRequestedAmount(dto.getRequestedAmount());
                application.setTenureMonths(dto.getTenureMonths());
                application.setPurpose(dto.getPurpose());

                loanApplicationRepository.save(application);
                return "Loan application submitted successfully";
        }

        // GET MY APPLICATIONS (USER)
        public List<LoanApplicationResponseDTO> getMyApplications(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return loanApplicationRepository.findByUser(user)
                                .stream()
                                .map(app -> new LoanApplicationResponseDTO(
                                                app.getId(),
                                                app.getUser().getName(),
                                                app.getMonthlyIncome(),
                                                app.getRequestedAmount(),
                                                app.getTenureMonths(),
                                                app.getPurpose(),
                                                app.getStatus(),
                                                app.getRejectionReason(),
                                                app.getAppliedAt()))
                                .collect(Collectors.toList());
        }

        // GET ALL APPLICATIONS (ADMIN)
        public List<LoanApplicationResponseDTO> getAllApplications() {
                return loanApplicationRepository.findAll()
                                .stream()
                                .map(app -> new LoanApplicationResponseDTO(
                                                app.getId(),
                                                app.getUser().getName(),
                                                app.getMonthlyIncome(),
                                                app.getRequestedAmount(),
                                                app.getTenureMonths(),
                                                app.getPurpose(),
                                                app.getStatus(),
                                                app.getRejectionReason(),
                                                app.getAppliedAt()))
                                .collect(Collectors.toList());
        }

        // APPROVE OR REJECT (ADMIN)
        public String reviewApplication(Long applicationId, String adminEmail, AdminReviewDTO dto) {
                LoanApplication application = loanApplicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                User admin = userRepository.findByEmail(adminEmail)
                                .orElseThrow(() -> new RuntimeException("Admin not found"));

                application.setStatus(dto.getStatus());
                application.setReviewedAt(LocalDateTime.now());
                application.setReviewedBy(admin);

                if (dto.getStatus().equals("REJECTED")) {
                        application.setRejectionReason(dto.getRejectionReason());
                }

                if (dto.getStatus().equals("APPROVED")) {
                        // create loan account
                        double interestRate = 12.0;
                        double emi = calculateEmi(application.getRequestedAmount(), interestRate,
                                        application.getTenureMonths());
                        double totalPayable = emi * application.getTenureMonths();

                        LoanAccount account = new LoanAccount();
                        account.setLoanApplication(application);
                        account.setPrincipalAmount(application.getRequestedAmount());
                        account.setInterestRate(interestRate);
                        account.setTenureMonths(application.getTenureMonths());
                        account.setEmiAmount(emi);
                        account.setTotalPayable(totalPayable);
                        account.setStartDate(LocalDate.now());
                        loanAccountRepository.save(account);

                        // generate emi schedule
                        generateEmiSchedule(account);
                }

                loanApplicationRepository.save(application);
                return "Application " + dto.getStatus() + " successfully";
        }

        // GET EMI SCHEDULE (USER)
        public List<EmiScheduleResponseDTO> getEmiSchedule(Long applicationId) {
                LoanApplication application = loanApplicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                LoanAccount account = loanAccountRepository.findByLoanApplication(application)
                                .orElseThrow(() -> new RuntimeException("Loan account not found"));

                return emiScheduleRepository.findByLoanAccount(account)
                                .stream()
                                .map(emi -> new EmiScheduleResponseDTO(
                                                emi.getId(),
                                                emi.getInstallmentNumber(),
                                                emi.getDueDate(),
                                                emi.getEmiAmount(),
                                                emi.getPrincipalComponent(),
                                                emi.getInterestComponent(),
                                                emi.getStatus()))
                                .collect(Collectors.toList());
        }

        // GET LOAN ACCOUNT DETAILS (USER)

        public LoanAccountResponseDTO getLoanAccount(Long applicationId) {
                LoanApplication application = loanApplicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                LoanAccount account = loanAccountRepository.findByLoanApplication(application)
                                .orElseThrow(() -> new RuntimeException("Loan account not found"));

                return new LoanAccountResponseDTO(
                                account.getId(),
                                account.getPrincipalAmount(),
                                account.getInterestRate(),
                                account.getTenureMonths(),
                                account.getEmiAmount(),
                                account.getTotalPayable(),
                                account.getOutstandingBalance(),
                                account.getStartDate(),
                                account.getStatus());
        }

        // MAKE PAYMENT (USER)
        public String makePayment(String email, PaymentRequestDTO dto) {
                EmiSchedule emiSchedule = emiScheduleRepository.findById(dto.getEmiScheduleId())
                                .orElseThrow(() -> new RuntimeException("EMI not found"));

                LoanAccount account = emiSchedule.getLoanAccount();

                // mark emi as paid
                emiSchedule.setStatus("PAID");
                emiScheduleRepository.save(emiSchedule);

                // reduce outstanding balance
                account.setOutstandingBalance(account.getOutstandingBalance() - emiSchedule.getPrincipalComponent());

                // close loan if fully paid
                if (account.getOutstandingBalance() <= 0) {
                        account.setStatus("CLOSED");
                }
                loanAccountRepository.save(account);

                // save payment history
                PaymentHistory payment = new PaymentHistory();
                payment.setLoanAccount(account);
                payment.setEmiSchedule(emiSchedule);
                payment.setPaidAmount(dto.getPaidAmount());
                payment.setRemarks(dto.getRemarks());
                paymentHistoryRepository.save(payment);

                return "Payment successful";
        }

        // GET PAYMENT HISTORY
        public List<PaymentHistoryResponseDTO> getPaymentHistory(Long applicationId) {
                LoanApplication application = loanApplicationRepository.findById(applicationId)
                                .orElseThrow(() -> new RuntimeException("Application not found"));

                LoanAccount account = loanAccountRepository.findByLoanApplication(application)
                                .orElseThrow(() -> new RuntimeException("Loan account not found"));

                return paymentHistoryRepository.findByLoanAccount(account)
                                .stream()
                                .map(p -> new PaymentHistoryResponseDTO(
                                                p.getId(),
                                                p.getPaidAmount(),
                                                p.getPaidAt(),
                                                p.getRemarks(),
                                                p.getEmiSchedule().getInstallmentNumber()))
                                .collect(Collectors.toList());
        }

        // EMI CALCULATION

        private double calculateEmi(double principal, double annualRate, int tenureMonths) {
                double monthlyRate = annualRate / 12 / 100;
                double emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths))
                                / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
                return Math.round(emi * 100.0) / 100.0;
        }

        // EMI SCHEDULE GENERATOR
        private void generateEmiSchedule(LoanAccount account) {
                double balance = account.getPrincipalAmount();
                double monthlyRate = account.getInterestRate() / 12 / 100;
                double emi = account.getEmiAmount();
                List<EmiSchedule> schedules = new ArrayList<>();

                for (int i = 1; i <= account.getTenureMonths(); i++) {
                        double interest = Math.round(balance * monthlyRate * 100.0) / 100.0;
                        double principal = Math.round((emi - interest) * 100.0) / 100.0;
                        balance = Math.round((balance - principal) * 100.0) / 100.0;

                        EmiSchedule schedule = new EmiSchedule();
                        schedule.setLoanAccount(account);
                        schedule.setInstallmentNumber(i);
                        schedule.setDueDate(account.getStartDate().plusMonths(i));
                        schedule.setEmiAmount(emi);
                        schedule.setPrincipalComponent(principal);
                        schedule.setInterestComponent(interest);
                        emiScheduleRepository.save(schedule);
                }
        }
}