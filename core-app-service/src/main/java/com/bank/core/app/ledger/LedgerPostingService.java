package com.bank.core.app.ledger;

import com.bank.core.data.ledger.LedgerEntry;
import com.bank.core.data.ledger.LedgerEntryRepository;
import com.bank.core.data.ledger.LedgerSide;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Posts balanced double-entry journals to ledger_entries. Every movement
 * in the system (deposits, admin credits/debits, interest, transfers,
 * reversals) must call {@link #post(JournalPosting)} so that the books
 * always balance: sum(DEBIT) == sum(CREDIT).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LedgerPostingService {

    private final LedgerEntryRepository ledgerEntryRepository;

    @Transactional
    public void post(JournalPosting journal) {
        BigDecimal debits = journal.legs().stream()
                .filter(leg -> leg.side() == LedgerSide.DEBIT)
                .map(com.bank.core.app.ledger.LedgerLeg::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal credits = journal.legs().stream()
                .filter(leg -> leg.side() == LedgerSide.CREDIT)
                .map(com.bank.core.app.ledger.LedgerLeg::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (debits.compareTo(credits) != 0) {
            throw new IllegalArgumentException(
                    "Unbalanced ledger posting: debits sum " + debits
                            + " != credits sum " + credits
                            + " (reference " + journal.reference() + ")");
        }

        UUID journalId = UUID.randomUUID();
        List<LedgerEntry> entries = journal.legs().stream()
                .map(leg -> LedgerEntry.builder()
                        .journalId(journalId)
                        .accountNumber(leg.accountNumber())
                        .accountType(leg.accountType())
                        .glAccount(leg.glAccount())
                        .side(leg.side())
                        .amount(leg.amount())
                        .reference(journal.reference())
                        .description(journal.description())
                        .build())
                .toList();

        ledgerEntryRepository.saveAll(entries);
        log.info("Posted {} ledger leg(s) for reference {} (journal {})",
                entries.size(), journal.reference(), journalId);
    }
}