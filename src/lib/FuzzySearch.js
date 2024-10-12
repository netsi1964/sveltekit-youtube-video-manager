import Fuse from 'fuse.js';

export function createFuzzySearch(items, options) {
  if (!Array.isArray(items) || items.length === 0) {
    console.warn('createFuzzySearch: items must be a non-empty array');
    return null;
  }

  try {
    return new Fuse(items, options);
  } catch (error) {
    console.error('Error creating Fuse instance:', error);
    return null;
  }
}