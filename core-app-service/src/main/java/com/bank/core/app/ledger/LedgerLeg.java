package com.bank.core.app.ledger;

import com.bank.core.data.ledger.LedgerAccountType;
import com.bank.core.data.ledger.LedgerSide;

import java.math.BigDecimal;

/**
 * One leg of a journal entry. Internal GL legs carry an account_code in
 * accountNumber (and glAccount); customer legs carry the 10-digit account
 * number.
 */
public record LedgerLeg(
        LedgerAccountType accountType,
        String accountNumber,
        String glAccount,
        LedgerSide side,
        BigDecimal amount) {

    public static LedgerLeg gl(String glAccountCode, LedgerSide side, BigDecimal amount) {
        return new LedgerLeg(LedgerAccountType.GL, glAccountCode, glAccountCode, side, amount);
    }

    public static LedgerLeg customer(String accountNumber, LedgerSide side, BigDecimal amount) {
        return new LedgerLeg(LedgerAccountType.CUSTOMER, accountNumber, null, side, amount);
    }
}