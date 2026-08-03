package com.bank.core.app.card;

import com.bank.common.dto.card.CardResponse;
import com.bank.common.dto.card.ChangeCardPinRequest;
import com.bank.common.dto.card.CreateCardRequest;
import com.bank.common.dto.card.UpdateCardLimitsRequest;

import java.util.List;
import java.util.UUID;

public interface CardService {

    CardResponse create(CreateCardRequest request);

    List<CardResponse> findAll();

    CardResponse freeze(UUID id);

    CardResponse unfreeze(UUID id);

    CardResponse replace(UUID id);

    CardResponse changePin(UUID id, ChangeCardPinRequest request);

    CardResponse updateLimits(UUID id, UpdateCardLimitsRequest request);
}
