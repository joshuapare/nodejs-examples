import { Transform } from 'stream';

/**
 * A Transform Stream that converts an array of same-structured objects into a CSV string.
 */
class ObjectToCsvTransform extends Transform {
  /**
   * Creates an instance of ObjectToCsvTransform.
   * @param {Object} [options] - The options to pass to the Transform constructor.
   */
  constructor(options) {
    super(options);
    this.headerWritten = false;
  }

  /**
   * Transforms a chunk of data by converting each object to a CSV row and pushing the transformed data.
   * @param {Buffer|String} chunk - The chunk of data to be transformed.
   * @param {String} encoding - The encoding of the chunk.
   * @param {Function} callback - The callback function to be called when the transformation is complete.
   * @private
   */
  _transform(chunk, encoding, callback) {
    if (!this.headerWritten) {
      const header = Object.keys(chunk[0].dataValues).join(',') + '\n';
      this.push(header);
      this.headerWritten = true;
    }
    
    const rows = [];
    for (let index = 0; index < chunk.length; index++) {
      const row = Object.values(chunk[index].dataValues)
        .map(item => item?.toString() || '')
        .join(',');
      rows.push(row);
    }
    
    this.push(rows.join('\n') + '\n');
    callback();
  }
  

  /**
   * Flushes any remaining data in the Transform stream.
   * @param {Function} callback - The callback function to be called when flushing is complete.
   * @private
   */
  _flush(callback) {
    this.headerWritten = false;
    callback();
  }
}

export default ObjectToCsvTransform;
