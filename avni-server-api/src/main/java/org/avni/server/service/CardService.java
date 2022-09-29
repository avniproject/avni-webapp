package org.avni.server.service;

import org.avni.server.dao.CardRepository;
import org.avni.server.dao.StandardReportCardTypeRepository;
import org.avni.server.domain.Card;
import org.avni.server.domain.StandardReportCardType;
import org.avni.server.util.BadRequestError;
import org.avni.server.web.request.CardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.joda.time.DateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardService implements NonScopeAwareService {

    private final CardRepository cardRepository;
    private final StandardReportCardTypeRepository standardReportCardTypeRepository;

    @Autowired
    public CardService(CardRepository cardRepository, StandardReportCardTypeRepository standardReportCardTypeRepository) {
        this.cardRepository = cardRepository;
        this.standardReportCardTypeRepository = standardReportCardTypeRepository;
    }

    public Card saveCard(CardContract cardContract) {
        assertNoExistingCardWithName(cardContract.getName());
        Card card = new Card();
        card.assignUUID();
        buildCard(cardContract, card);
        cardRepository.save(card);
        return card;
    }

    public void uploadCard(CardContract cardContract) {
        Card card = cardRepository.findByUuid(cardContract.getUuid());
        if (card == null) {
            card = new Card();
            card.setUuid(cardContract.getUuid());
        }
        buildCard(cardContract, card);
        cardRepository.save(card);
    }

    public Card editCard(CardContract newCard, Long cardId) {
        Card existingCard = cardRepository.findOne(cardId);
        assertNewNameIsUnique(newCard.getName(), existingCard.getName());
        buildCard(newCard, existingCard);
        cardRepository.save(existingCard);
        return existingCard;
    }

    public void deleteCard(Card card) {
        card.setVoided(true);
        cardRepository.save(card);
    }

    public List<CardContract> getAll() {
        List<Card> reportCards = cardRepository.findAll();
        return reportCards.stream().map(CardContract::fromEntity).collect(Collectors.toList());
    }

    private void buildCard(CardContract cardContract, Card card) {
        card.setName(cardContract.getName());
        card.setColour(cardContract.getColor());
        card.setDescription(cardContract.getDescription());
        card.setQuery(cardContract.getQuery());
        card.setVoided(cardContract.isVoided());
        card.setIconFileS3Key(cardContract.getIconFileS3Key());
        Long standardReportCardTypeId = cardContract.getStandardReportCardTypeId();
        if (standardReportCardTypeId != null) {
            StandardReportCardType type = standardReportCardTypeRepository.findById(standardReportCardTypeId).orElse(null);
            if (type == null) {
                throw new BadRequestError(String.format("StandardReportCardType with id %d doesn't exist", standardReportCardTypeId));
            }
            card.setStandardReportCardType(type);
        } else {
            card.setStandardReportCardType(null);
        }
    }

    private void assertNewNameIsUnique(String newName, String oldName) {
        if (!newName.equals(oldName)) {
            assertNoExistingCardWithName(newName);
        }
    }

    private void assertNoExistingCardWithName(String name) {
        Card existingCard = cardRepository.findByName(name);
        if (existingCard != null) {
            throw new BadRequestError(String.format("Card %s already exists", name));
        }
    }

    @Override
    public boolean isNonScopeEntityChanged(DateTime lastModifiedDateTime) {
        return cardRepository.existsByLastModifiedDateTimeGreaterThan(lastModifiedDateTime);
    }
}
