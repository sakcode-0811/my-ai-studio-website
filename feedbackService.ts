import { FoodFeedback } from '../types/donation.ts';
import { submitFoodFeedback, getAllFeedback } from './donationService.ts';

export const feedbackService = {
  submit: submitFoodFeedback,
  getAll: getAllFeedback
};

export { submitFoodFeedback, getAllFeedback };
