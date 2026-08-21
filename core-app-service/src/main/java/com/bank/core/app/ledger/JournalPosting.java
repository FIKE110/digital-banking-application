package com.bank.core.app.ledger;

import java.util.List;

/**
 * A double-entry journal posting: an immutable list of legs whose
 * sum of DEBITs must equal the sum of CREDITs.
 */
public record JournalPosting(
        String reference,
        String description,
        List<LedgerLeg> legs) {

    public JournalPosting {
        legs = List.copyOf(legs);
    }
}