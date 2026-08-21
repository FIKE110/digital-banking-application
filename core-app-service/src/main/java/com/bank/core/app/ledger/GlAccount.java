package com.bank.core.app.ledger;

/**
 * Internal general-ledger account codes used as the balancing
 * (DEBIT) leg for customer credits. Stored in ledger_entries.gl_account
 * with account_type = GL. Codes must be &lt;= 10 characters.
 */
public final class GlAccount {

    private GlAccount() {
    }

    /** Cash on hand for teller/cash deposits. */
    public static final String CASH = "GL-CASH";

    /** Float/suspense account offsetting admin manual credits. */
    public static final String FLOAT = "GL-FLOAT";

    /** Interest expense offsetting interest credited to customers. */
    public static final String INTEREST_EXPENSE = "GL-INTEX";
}