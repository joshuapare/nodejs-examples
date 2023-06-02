import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { performance } from 'node:perf_hooks';
import { Transform } from 'node:stream';

/**
 * Make sure we cleanup after ourselves
 */
export const cleanup = () => {
  try {
      fs.rmSync('./books_written.json');
      fs.rmSync('./books_stream.json');
  } catch (err) {
      console.error('Error cleaning up files', err);
  }
}

/**
 * This example will export all the books from the database to a file.
 * It does not use a stream, so it will load all the books into memory
 * at once.
 */
export const withoutStream = async () => {
  const start = performance.now();

  /**
   * Fetch all the books from a file, and simply write them to another file.
   */
  const books = fs.readFileSync('./books.json')
  const booksJson = books.toString();
  const booksCapitalize = booksJson.toUpperCase();
  fs.writeFileSync('./books_written.json', booksCapitalize);
  

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
 * This example will export 
 * It uses a stream, so instead of loading all the books into memory
 * at once, it will load them batches, and write them to the file
 * as they are loaded.
 */
export const withStream = async () => {
  const start = performance.now();
  
  /**
 * This is a simple transform stream that will convert all
 * of the alphanumeric characters in a chunk to uppercase.
 * 
 * This is just an example of a transform stream. You could
 * use this to do any kind of transformation you want.
 */
  const capitalize = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });

  /**
   * Setup the readable stream from the file. We'll use the built-in
   * readable stream from the fs module to read the file.
   */
  const fromFile = fs.createReadStream('./books.json');


  /**
   * Setup the writable stream to write from the file. We'll use the
   * built-in writable stream from the fs module to write to the file.
   */
  const toFile = fs.createWriteStream('./books_stream.json');

  /**
   * Now that we have our streams setup, we can use the `pipeline` function
   * to pipe the data from one file to another. This will pull data
   * from the readable stream by calling the `read` function, and then
   * push that data to the writable stream by calling the `write` function.
   * 
   * The pipeline function will automatically close the streams when it's
   * done. Because of this coming from the promise version of the stream
   * API, we can use await to wait for the pipeline to finish.
   * 
   * The pipeline function being used here is from the promises version
   * of the stream API, which gives us that nice async/await syntax.
   */
  await pipeline(
    fromFile,
    capitalize,
    toFile,
  ).catch(err => console.error('Pipeline failed', err));

  /**
   * If you didn't want to use the pipeline function, you could also
   * setup the streams manually. This is what the pipeline function
   * is doing under the hood.
   * 
   * fromFile.pipe(toFile);
   * 
   * Or, if you didn't want to use async/await syntax, you could use
   * the callback version of the pipeline function.
   */


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


// await withoutStream();
// await withStream();

// await db.sequelize.close();
// process.exit(0);

