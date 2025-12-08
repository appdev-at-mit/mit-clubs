import { Event } from "../../../../types";

/**
 * Extract all unique tags from events
 */
export function extractUniqueTags(events: Event[]): string[] {
  const tagSet = new Set<string>();

  events.forEach(event => {
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagSet.add(tag);
        }
      });
    }
  });

  return Array.from(tagSet).sort();
}

/**
 * Get tag counts for display
 */
export function getTagCounts(events: Event[]): Record<string, number> {
  const tagCounts: Record<string, number> = {};

  events.forEach(event => {
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach(tag => {
        if (typeof tag === 'string') {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  return tagCounts;
}

/**
 * Auto-categorize tags based on common patterns
 * You can customize these categories based on your needs
 */
export function categorizeTags(tags: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    'Academic': [],
    'Social': [],
    'Career': [],
    'Arts & Culture': [],
    'Sports & Recreation': [],
    'Food & Dining': [],
    'Other': []
  };

  const academicKeywords = ['study', 'lecture', 'talk', 'workshop', 'research', 'academic', 'seminar'];
  const socialKeywords = ['social', 'party', 'mixer', 'networking', 'community', 'gathering'];
  const careerKeywords = ['career', 'job', 'internship', 'recruiting', 'professional', 'finance'];
  const artsKeywords = ['art', 'music', 'theater', 'performance', 'cultural', 'dance', 'film'];
  const sportsKeywords = ['sport', 'game', 'fitness', 'athletic', 'recreation', 'tournament'];
  const foodKeywords = ['food', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'snack'];

  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();

    if (academicKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Academic'].push(tag);
    } else if (socialKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Social'].push(tag);
    } else if (careerKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Career'].push(tag);
    } else if (artsKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Arts & Culture'].push(tag);
    } else if (sportsKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Sports & Recreation'].push(tag);
    } else if (foodKeywords.some(keyword => lowerTag.includes(keyword))) {
      categories['Food & Dining'].push(tag);
    } else {
      categories['Other'].push(tag);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });

  return categories;
}
