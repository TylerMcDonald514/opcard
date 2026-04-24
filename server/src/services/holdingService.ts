import { cardRepo } from '../repositories/cardRepo'
import { holdingRepo } from '../repositories/holdingRepo'

export const holdingService = {
  list() {
    return holdingRepo.findAll()
  },

  create(card_id: number, quantity: number, purchase_price: number) {
    if (!cardRepo.findById(card_id)) {
      throw new Error('card not found')
    }
    return holdingRepo.create(card_id, quantity, purchase_price)
  },

  delete(id: number) {
    return holdingRepo.delete(id)
  },
}
