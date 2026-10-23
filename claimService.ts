import { FoodClaim, FoodDonation } from '../types/donation.ts';
import {
  claimDonation,
  verifyPickupToken,
  getAllClaims,
  getClaimsForUser
} from './donationService.ts';

export const claimService = {
  claim: claimDonation,
  verifyToken: verifyPickupToken,
  getAll: getAllClaims,
  getForUser: getClaimsForUser
};

export {
  claimDonation,
  verifyPickupToken,
  getAllClaims,
  getClaimsForUser
};
