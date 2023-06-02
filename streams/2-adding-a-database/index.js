import * as db from '../db.js';

import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { Sequelize } from 'sequelize';


/**
 * This example will export all the books from the database to a file.
 * It does not use a stream, so it will load all the books into memory
 * at once.
 */
export const withoutStream = async () => {
  console.time('withoutStream');

  /**
   * Fetch all the books from the database and write them to a file.
   */
  const books = await db.Book.findAll();
  fs.writeFileSync('./books_written.json', JSON.stringify(books));
  


  /** 
   * Report back our findings
   */
  const end = performance.now();
  const usage = {
    time: `${end - start}ms`,
  };
  for (const [key,value] of Object.entries(process.memoryUsage())){
    usage[key] = `${value / 1024 / 1024}MB`
  }

  return usage;
}

/**
 * This example will export all the books from the database to a file.
 * It uses a stream, so instead of loading all the books into memory
 * at once, it will load them in batches, and write them to the file
 * as they are loaded.
 */
export const withStream = async () => {
  console.time('withStream');

  const PAGE_SIZE = 100_000;
  const TOTAL_BOOKS = await db.Book.count();
  const TOTAL_PAGES = Math.ceil(TOTAL_BOOKS / PAGE_SIZE);

  /**
   * Setup the readable stream from the db. Since we can't use a stream
   * directly from sequelize, we'll have to create our own readable stream
   * that will query the database for each page.
   * 
   * We'll use a transform stream to convert the data from sequelize into
   * a JSON string, and then pipe that into the CSV stream.
   */
  let i = 0;
  let lastId = 0

  const fromDatabase = new Readable({
    objectMode: true,
    /**
     * The read function will be called by the stream when it's ready
     * to read more data. We'll use this to query the database for the
     * next page of books.
     */
    read(size) {
      console.log(`Writing page ${i} with size ${size} of ${TOTAL_PAGES}`)
      db.Book.findAll({
        where: {
          id: {
            [Sequelize.Op.gt]: lastId
          }
        },
        order: [['id', 'ASC']],
        limit: PAGE_SIZE,
      })
      .then(books => {
        if (books.length > 0) {
          lastId = books[books.length - 1].id;
        }
        this.push(books);
        i++;
      })
      .catch(err => {
        console.error('Error fetching books', err);
        this.push(null);
      });

      /**
       * When we've written all the pages, we'll push null to the stream
       * to indicate that we're done.
       */
      if (i >= TOTAL_PAGES) {
        this.push(null);
      }
    }
  });

  /**
   * Setup the writable stream to write to a file. Given the large size
   * of the data, we'll use a highWaterMark of 4MB to reduce the number
   * of times the stream needs to write to the file.
   * 
   * In a real scenario, you'd want to be handling the drain event to avoid
   * backpressure, but for this example we'll just let the stream pause.
   */
  const toFile = fs.createWriteStream('./books_stream.csv', { highWaterMark: 4000000 });

  /**
   * Now that we have our streams setup, we can use the `pipeline` function
   * to pipe the data from the database to the file. This will pull data
   * from the readable stream by calling the `read` function, and then
   * push that data to the writable stream by calling the `write` function.
   * 
   * The pipeline function will automatically close the streams when it's
   * done. Because of this coming from the promise version of the stream
   * API, we can use await to wait for the pipeline to finish.
   */
  await pipeline(
    fromDatabase,
    toFile,
  ).catch(err => console.error('Pipeline failed', err));

  /** 
   * Report back our findings
   */
  console.timeEnd('withStream');
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`
    Using a stream used approximately ${Math.round(used * 100) / 100} MB
  `);
  for (const [key,value] of Object.entries(process.memoryUsage())){
    console.log(`Memory usage by ${key}: ${value/1000000}MB `)
  }
}


// await exportBooksWithoutStream();
// await exportBooksWithStream();

// await db.sequelize.close();
// process.exit(0);

