import { FoodDonation, DonationFormData, DonationStatus } from '../types/donation.ts';
import {
  getAllDonations,
  createDonation,
  updateDonationStatus,
  deleteDonation,
  filterActiveFeed,
  subscribeToDonations,
  updateLiveSafetyStatus
} from './donationService.ts';

export const foodService = {
  getAll: getAllDonations,
  create: createDonation,
  updateStatus: updateDonationStatus,
  delete: deleteDonation,
  filterActive: filterActiveFeed,
  subscribe: subscribeToDonations,
  refreshSafety: updateLiveSafetyStatus
};

export {
  getAllDonations,
  createDonation,
  updateDonationStatus,
  deleteDonation,
  filterActiveFeed,
  subscribeToDonations,
  updateLiveSafetyStatus
};
