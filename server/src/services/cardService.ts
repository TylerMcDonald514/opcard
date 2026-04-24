import { cardRepo, type Card } from '../repositories/cardRepo'

export const cardService = {
  list(q?: string): Card[] {
    return cardRepo.findAll(q)
  },

  create(card_code: string, name: string): Card {
    const existing = cardRepo.findByCode(card_code)
    if (existing) return existing
    return cardRepo.create(card_code, name)
  },
}
