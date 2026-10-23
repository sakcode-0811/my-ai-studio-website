import { AppNotification } from '../types/donation.ts';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from './donationService.ts';

export const notificationService = {
  getForUser: getNotificationsForUser,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead
};

export {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
