-- ============================================================
-- V3: Remove maker-checker approval queue
-- Target: PostgreSQL 16 (banking_db), owner: banking
-- Admin adjustments, reversals and refunds now execute
-- immediately. Drops the admin_approvals table and its indexes.
-- ============================================================

DROP TABLE IF EXISTS admin_approvals;