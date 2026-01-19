// Tutorials data model
//
// - Categories: footwork, rope manipulation, releases, power, gymnastics
// - Levels: 0, 0.5, 1..8
// - Videos: add your URLs (YouTube/Vimeo/MP4) to each level array

export const TUTORIAL_LEVELS = ['0', '0.5', '1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * @typedef {{ id: string; title: string; url: string; notes?: string; }} TutorialVideo
 * @typedef {{ id: string; title: string; subtitle: string; levels: Record<string, TutorialVideo[]> }} TutorialCategory
 */

/** @type {TutorialCategory[]} */
export const TUTORIAL_CATEGORIES = [
  {
    id: 'footwork',
    title: 'Footwork',
    subtitle: 'General movement, rhythm, and step patterns',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
  {
    id: 'rope-manipulation',
    title: 'Rope manipulation',
    subtitle: 'Wraps, crosses, and handle/rope control',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
  {
    id: 'multiples',
    title: 'Multiple skill',
    subtitle: 'Double-unders, triple-unders, and higher multiples',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
  {
    id: 'power',
    title: 'Power skill',
    subtitle: 'Power entries, frogs, push-ups, and dynamic power',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
  {
    id: 'releases',
    title: 'Release skill',
    subtitle: 'Mic releases, lasso releases, and catches',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
  {
    id: 'gymnastics',
    title: 'Gymnastics',
    subtitle: 'Acrobatics performed with the rope',
    levels: Object.fromEntries(TUTORIAL_LEVELS.map((lv) => [lv, []])),
  },
];

export function getTutorialCategory(categoryId) {
  return TUTORIAL_CATEGORIES.find((c) => c.id === categoryId) || null;
}

