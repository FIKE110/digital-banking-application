-- ============================================================
-- V2: Double-entry ledger
-- Target: PostgreSQL 16 (banking_db), owner: banking
-- Adds the ledger_entries journal table backing the
-- double-entry bookkeeping. Every money movement posts a
-- balanced DEBIT/CREDIT pair: legs reference the customer
-- account (CUSTOMER) and/or internal GL codes (GL).
-- ============================================================

CREATE TABLE ledger_entries (
    id            UUID PRIMARY KEY,
    journal_id    UUID NOT NULL,
    account_number VARCHAR(10) NOT NULL,
    account_type  VARCHAR(20) NOT NULL,
    gl_account    VARCHAR(50),
    side          VARCHAR(10) NOT NULL,
    amount        NUMERIC(19, 2) NOT NULL,
    reference     VARCHAR(255) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMP(6) NOT NULL,
    CONSTRAINT chk_ledger_side CHECK (side IN ('DEBIT', 'CREDIT')),
    CONSTRAINT chk_ledger_account_type CHECK (account_type IN ('CUSTOMER', 'GL'))
);

CREATE INDEX idx_ledger_entries_account_created
    ON ledger_entries (account_number, created_at DESC);

CREATE INDEX idx_ledger_entries_journal
    ON ledger_entries (journal_id);

CREATE INDEX idx_ledger_entries_reference
    ON ledger_entries (reference);