package com.bank.core.data.model;
import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table (name = "Transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @column (name = "id")
    private Long id;
    @column (name = "reference")
    private String reference;
    @column ( name = "amount")
    private Double amount;
    @column (name = "transactionalType")
    private String transactionType;
    @CreationTimestamp
    @Column(name = "created_date")
    LocalDateTime createdDate;
    @UpdateTimestamp
    @Column(name = "updated_date")
    LocalDateTime updatedDate;


}
