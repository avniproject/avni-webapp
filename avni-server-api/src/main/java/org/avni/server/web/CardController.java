package org.avni.server.web;

import org.avni.server.dao.CardRepository;
import org.avni.server.domain.Card;
import org.avni.server.service.CardService;
import org.avni.server.web.request.CardContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class CardController {

    private final CardRepository cardRepository;
    private final CardService cardService;

    @Autowired
    public CardController(CardRepository cardRepository, CardService cardService) {
        this.cardRepository = cardRepository;
        this.cardService = cardService;
    }

    @GetMapping(value = "/web/card")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public List<CardContract> getAll() {
        return cardRepository.findAllByIsVoidedFalse()
                .stream().map(CardContract::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/web/card/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    @ResponseBody
    public ResponseEntity<CardContract> getById(@PathVariable Long id) {
        Optional<Card> card = cardRepository.findById(id);
        return card.map(c -> ResponseEntity.ok(CardContract.fromEntity(c)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/web/card")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<CardContract> newCard(@RequestBody CardContract cardContract) {
        Card card = cardService.saveCard(cardContract);
        return ResponseEntity.ok(CardContract.fromEntity(card));
    }

    @PutMapping(value = "/web/card/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public ResponseEntity<CardContract> editCard(@PathVariable Long id, @RequestBody CardContract cardContract) {
        Optional<Card> card = cardRepository.findById(id);
        if (!card.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Card newCard = cardService.editCard(cardContract, id);
        return ResponseEntity.ok(CardContract.fromEntity(newCard));
    }

    @DeleteMapping(value = "/web/card/{id}")
    @PreAuthorize(value = "hasAnyAuthority('admin', 'organisation_admin')")
    @ResponseBody
    @Transactional
    public void deleteCard(@PathVariable Long id) {
        Optional<Card> card = cardRepository.findById(id);
        card.ifPresent(cardService::deleteCard);
    }

}
