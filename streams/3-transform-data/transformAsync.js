import { Transform } from 'stream';

/**
 * A Transform Stream that converts an array of same-structured objects into a CSV string.
 * This version of the transform stream is asynchronous, and implements the async iterator 
 * protocol. This helps us avoid backpressure issues by waiting for the queue to be processed 
 * before pushing more data.
 * 
 * This version of the transform stream is also more memory efficient than the synchronous 
 * version because it does not need to store the entire array of objects in memory before 
 * transforming them. Instead, it will transform each object as it is received, and push the 
 * transformed data to the queue.
 */
class ObjectToCsvTransformAsync extends Transform {
  /**
   * Creates an instance of ObjectToCsvTransform.
   * @param {Object} [options] - The options to pass to the Transform constructor.
   */
  constructor(options) {
    super(options);
    this.headerWritten = false;
    this.processing = false;
    this.queue = [];
  }

  /**
   * Implements the async iterator protocol for the Transform Stream.
   * This will allow us to handle backpressure by waiting for the queue to be processed
   * before pushing more data. This will also allow us to avoid storing the entire array
   * of objects in memory before transforming them.
   * @returns {AsyncGenerator} - An async generator that yields chunks of transformed data.
   */
  async *[Symbol.asyncIterator]() {
    // Keep iterating until the queue is empty and processing is complete
    while (this.queue.length > 0 || this.processing) {
      // Wait for a promise to resolve before yielding the next item
      await new Promise((resolve) => {
        const checkQueue = () => {
          if (this.queue.length > 0) {
            resolve(this.queue.shift());
          } else {
            // If the queue is empty, wait for a short duration before checking again
            setTimeout(checkQueue, 10);
          }
        };
        checkQueue();
      });
    }
  }

  /**
   * Transforms a chunk of data by converting each object to a CSV row and pushing the transformed data to the queue.
   * @param {Buffer|String} chunk - The chunk of data to be transformed.
   * @param {String} encoding - The encoding of the chunk.
   * @param {Function} callback - The callback function to be called when the transformation is complete.
   * @private
   */
  _transform(chunk, encoding, callback) {
    if (!this.headerWritten) {
      const header = Object.keys(chunk[0]).join(',') + '\n';
      this.queue.push(header);
      this.headerWritten = true;
    }

    const csvRows = chunk.map((obj) => Object.values(obj).join(','));
    const csvString = csvRows.join('\n') + '\n';
    this.queue.push(csvString);

    this.processQueue();
    callback();
  }

  /**
   * Processes the queue asynchronously, pushing each item from the queue to the stream.
   * @returns {Promise} - A promise that resolves when the queue is fully processed.
   * @private
   */
  async processQueue() {
    // If already processing, return early
    if (this.processing) return;

    // Set processing flag to true
    this.processing = true;

    // Iterate over the async iterator and push each item to the stream
    for await (const item of this) {
      this.push(item);
    }

    // Set processing flag to false
    this.processing = false;
  }

  /**
   * Flushes any remaining data in the Transform stream.
   * @param {Function} callback - The callback function to be called when flushing is complete.
   * @private
   */
  _flush(callback) {
    this.headerWritten = false;
    this.processQueue().then(callback);
  }
}

export default ObjectToCsvTransformAsync;
