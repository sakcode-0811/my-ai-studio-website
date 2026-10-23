import { FoodCategory, StorageCondition, FoodSafetyRule, SafetyEvaluation, SafetyRating } from '../types/donation.ts';

const DEFAULT_SAFETY_RULES: FoodSafetyRule[] = [
  {
    id: 'rule-nonveg-room',
    category: 'non-vegetarian',
    storageCondition: 'room_temperature',
    warningHours: 1.5,
    maxSafeHours: 3.0,
    title: 'Non-Vegetarian (Room Temperature)',
    guidelineDescription: 'Cooked meat, poultry, fish, and dairy at ambient temp (danger zone 20°C - 50°C). High microbial growth risk.'
  },
  {
    id: 'rule-nonveg-refrig',
    category: 'non-vegetarian',
    storageCondition: 'refrigerated',
    warningHours: 18.0,
    maxSafeHours: 24.0,
    title: 'Non-Vegetarian (Refrigerated < 4°C)',
    guidelineDescription: 'Chilled meat & dairy dishes maintain safe consumption parameters for up to 24 hours.'
  },
  {
    id: 'rule-nonveg-heated',
    category: 'non-vegetarian',
    storageCondition: 'heated_insulated',
    warningHours: 2.5,
    maxSafeHours: 4.0,
    title: 'Non-Vegetarian (Heated Insulated > 60°C)',
    guidelineDescription: 'Hot holding in thermal insulated containers or chafing pans preserves safety for up to 4 hours.'
  },
  {
    id: 'rule-veg-room',
    category: 'vegetarian',
    storageCondition: 'room_temperature',
    warningHours: 3.0,
    maxSafeHours: 5.0,
    title: 'Vegetarian (Room Temperature)',
    guidelineDescription: 'Cooked lentils, rice, gravies, and veggies stored at room temp safe for distribution up to 5 hours.'
  },
  {
    id: 'rule-veg-refrig',
    category: 'vegetarian',
    storageCondition: 'refrigerated',
    warningHours: 36.0,
    maxSafeHours: 48.0,
    title: 'Vegetarian (Refrigerated < 4°C)',
    guidelineDescription: 'Cooked vegetarian meals properly sealed and chilled safe for up to 48 hours.'
  },
  {
    id: 'rule-veg-heated',
    category: 'vegetarian',
    storageCondition: 'heated_insulated',
    warningHours: 3.5,
    maxSafeHours: 5.5,
    title: 'Vegetarian (Heated Insulated > 60°C)',
    guidelineDescription: 'Thermal hot cases and commercial warmers preserve vegetarian food safe for up to 5.5 hours.'
  }
];

const LOCAL_STORAGE_RULES_KEY = 'annapurna_food_safety_rules_v1';

export function getSafetyRules(): FoodSafetyRule[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_RULES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading safety rules from localStorage:', err);
  }
  return DEFAULT_SAFETY_RULES;
}

export function saveSafetyRules(rules: FoodSafetyRule[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_RULES_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save safety rules:', err);
  }
}

export function resetSafetyRulesToDefault(): FoodSafetyRule[] {
  try {
    localStorage.removeItem(LOCAL_STORAGE_RULES_KEY);
  } catch (e) {
    // ignore
  }
  return DEFAULT_SAFETY_RULES;
}

export function findMatchingRule(category: FoodCategory, storage: StorageCondition): FoodSafetyRule {
  const rules = getSafetyRules();
  const match = rules.find(r => r.category === category && r.storageCondition === storage);
  if (match) return match;

  const fallbackCategory = rules.find(r => r.category === category);
  if (fallbackCategory) return fallbackCategory;

  return {
    id: 'fallback-rule',
    category,
    storageCondition: storage,
    warningHours: category === 'non-vegetarian' ? 2 : 4,
    maxSafeHours: category === 'non-vegetarian' ? 3.5 : 6,
    title: `${category === 'vegetarian' ? 'Vegetarian' : 'Non-Vegetarian'} Food`,
    guidelineDescription: 'Default standard food distribution guideline.'
  };
}

/**
 * Evaluates food freshness and safety based on prep timestamp, deadline, expiry timestamp, and storage rule
 */
export function evaluateFoodSafety(
  category: FoodCategory,
  storageCondition: StorageCondition,
  prepDate: string,
  prepTime: string,
  pickupDeadlineIso: string,
  expiryTimestampIso?: string
): SafetyEvaluation {
  const rule = findMatchingRule(category, storageCondition);
  const now = new Date();

  // Combine prep date and time
  const prepDateTime = new Date(`${prepDate}T${prepTime}:00`);
  const deadlineDateTime = new Date(pickupDeadlineIso);
  const expiryDateTime = expiryTimestampIso ? new Date(expiryTimestampIso) : null;

  const warnings: string[] = [];

  // Check valid dates
  if (isNaN(prepDateTime.getTime())) {
    return {
      rating: 'warning',
      hoursElapsed: 0,
      hoursRemainingUntilSafetyLimit: rule.maxSafeHours,
      maxSafeHours: rule.maxSafeHours,
      warningHours: rule.warningHours,
      isExpiredByPrepTime: false,
      isExpiredByDeadline: false,
      isExpiredByExpiryTime: false,
      warnings: ['Invalid preparation date or time provided.'],
      recommendation: 'Please enter a valid preparation date and time.'
    };
  }

  // Future prep time check
  if (prepDateTime.getTime() > now.getTime() + 60000) { // allow 1 min clock drift
    warnings.push('Preparation time cannot be in the future. Please specify when the food was actually cooked.');
  }

  // Expiry date and time validation
  if (expiryDateTime && !isNaN(expiryDateTime.getTime())) {
    if (expiryDateTime.getTime() <= prepDateTime.getTime()) {
      warnings.push('Food expiry date and time must be later than the preparation date and time.');
    }

    if (!isNaN(deadlineDateTime.getTime()) && deadlineDateTime.getTime() > expiryDateTime.getTime()) {
      warnings.push('Pickup deadline must not be later than the food expiry time.');
    }

    // Configurable safety rule check: Do not assume food is safe merely because entered expiry has not passed
    const hoursToExpiry = (expiryDateTime.getTime() - prepDateTime.getTime()) / (1000 * 60 * 60);
    if (hoursToExpiry > rule.maxSafeHours) {
      const overHours = (hoursToExpiry - rule.maxSafeHours).toFixed(1);
      warnings.push(`Caution: The entered expiry time extends ${overHours}h beyond standard safe shelf-life (${rule.maxSafeHours}h for ${rule.title}).`);
    }
  }

  // Deadline check
  if (!isNaN(deadlineDateTime.getTime()) && deadlineDateTime.getTime() <= prepDateTime.getTime()) {
    warnings.push('Pickup deadline must be set to a time AFTER the preparation time.');
  }

  const elapsedMillis = now.getTime() - prepDateTime.getTime();
  const hoursElapsed = Math.max(0, elapsedMillis / (1000 * 60 * 60));
  const hoursRemainingUntilLimit = rule.maxSafeHours - hoursElapsed;

  const isExpiredByDeadline = !isNaN(deadlineDateTime.getTime()) && deadlineDateTime.getTime() < now.getTime();
  const isExpiredByExpiryTime = Boolean(expiryDateTime && !isNaN(expiryDateTime.getTime()) && expiryDateTime.getTime() < now.getTime());
  const isExpiredByPrepTime = hoursElapsed >= rule.maxSafeHours;

  let rating: SafetyRating = 'fresh';
  let recommendation = `Food is within the prime safety window (${rule.title}).`;

  if (isExpiredByExpiryTime) {
    rating = 'expired';
    warnings.push('Food expiry time has passed. This food is no longer safe for consumption.');
    recommendation = 'Food has reached its expiration time.';
  } else if (isExpiredByDeadline) {
    rating = 'expired';
    warnings.push('Pickup deadline has passed. This listing is no longer active.');
    recommendation = 'Pickup deadline expired.';
  } else if (isExpiredByPrepTime) {
    rating = 'expired';
    warnings.push(`Exceeded maximum safe shelf-life of ${rule.maxSafeHours} hours for ${rule.title}. Prepared ${(hoursElapsed).toFixed(1)} hours ago.`);
    recommendation = 'Not recommended for distribution due to bacterial growth hazard.';
  } else if (hoursElapsed >= rule.warningHours) {
    rating = 'warning';
    warnings.push(`Prepared ${(hoursElapsed).toFixed(1)} hours ago. Safe window closes in ~${Math.max(0, hoursRemainingUntilLimit).toFixed(1)} hours.`);
    recommendation = `Distribute promptly or transfer to refrigeration (${rule.title}).`;
  } else {
    rating = 'fresh';
    recommendation = `Freshly prepared (${(hoursElapsed).toFixed(1)} hrs ago). Safe for ~${hoursRemainingUntilLimit.toFixed(1)} more hours.`;
  }

  return {
    rating,
    hoursElapsed,
    hoursRemainingUntilSafetyLimit: hoursRemainingUntilLimit,
    maxSafeHours: rule.maxSafeHours,
    warningHours: rule.warningHours,
    isExpiredByPrepTime,
    isExpiredByDeadline,
    isExpiredByExpiryTime,
    warnings,
    recommendation
  };
}

/**
 * Format date & time into clear, consistent local format
 */
export function formatLocalDateTime(isoStringOrDate: string | Date | undefined): string {
  if (!isoStringOrDate) return 'N/A';
  try {
    const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
    if (isNaN(date.getTime())) return String(isoStringOrDate);

    return new Intl.DateTimeFormat('default', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (err) {
    return String(isoStringOrDate);
  }
}

/**
 * Format prep date & time string
 */
export function formatPrepDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const combined = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
    if (isNaN(combined.getTime())) {
      return `${dateStr} ${timeStr || ''}`.trim();
    }
    return formatLocalDateTime(combined);
  } catch {
    return `${dateStr} ${timeStr || ''}`.trim();
  }
}

/**
 * Formats relative duration (e.g. "2 hours ago", "in 45 mins", "Expired 15m ago")
 */
export function formatRelativeTime(targetIso: string, isPast: boolean = false): string {
  try {
    const target = new Date(targetIso);
    if (isNaN(target.getTime())) return '';
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffMinutes = Math.round(Math.abs(diffMs) / 60000);

    const isTargetInPast = diffMs < 0;

    let timeText = '';
    if (diffMinutes < 1) {
      timeText = 'just now';
    } else if (diffMinutes < 60) {
      timeText = `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const remainingMins = diffMinutes % 60;
      timeText = remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    }

    if (timeText === 'just now') return timeText;

    if (isTargetInPast) {
      return `${timeText} ago`;
    } else {
      return `in ${timeText}`;
    }
  } catch {
    return '';
  }
}
