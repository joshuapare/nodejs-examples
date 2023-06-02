import * as db from './db.js';
import { faker } from '@faker-js/faker';

const BATCHES = 100;
const BATCH_SIZE = 10_000;

/**
 * This example will seed the database with a bunch of books.
 * We'll use a stream to load the books in batches, so we don't
 * load all the books at once, and risk running out
 * of memory.
 */
export const seed = async () => {
  for (let i = 0; i < BATCHES; i++) {
    const books = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      books.push({
        title: faker.lorem.slug(),
        description: faker.lorem.paragraph(),
        author: faker.person.fullName(),
        releaseDate: faker.date.past(),
        subject: faker.word.noun(),
      });
    };
    await db.Book.bulkCreate(books);
    console.log(`Batch ${i} complete`);
  };

  return `Seeding complete - seeded ${BATCHES * BATCH_SIZE} books.`;
};
