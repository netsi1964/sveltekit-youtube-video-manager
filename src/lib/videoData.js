import { faker } from '@faker-js/faker';

// Generate 100 sample videos with realistic data
const generateVideos = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    title: faker.lorem.sentence(3, 8).replace(/'/g, "\\'"),
    description: faker.lorem.paragraph().replace(/'/g, "\\'"),
    tags: Array.from({ length: faker.datatype.number({ min: 1, max: 5 }) }, () => faker.word.noun().replace(/'/g, "\\'")),
    views: faker.datatype.number({ min: 100, max: 1000000 }),
    likes: faker.datatype.number({ min: 10, max: 50000 }),
    uploadDate: faker.date.past(2).toISOString().split("T")[0],
    updated: faker.date.recent(30).toISOString() // Add updated field
  }));
};

export const videos = generateVideos(100);