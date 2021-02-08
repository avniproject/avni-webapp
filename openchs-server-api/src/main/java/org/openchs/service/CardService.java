package org.openchs.service;

import org.openchs.dao.CardRepository;
import org.openchs.domain.Card;
import org.openchs.util.BadRequestError;
import org.openchs.web.request.CardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CardService {

    private final CardRepository cardRepository;

    @Autowired
    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
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
        if(card == null){
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
}
