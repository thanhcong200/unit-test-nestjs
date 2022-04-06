import { Logger } from '@nestjs/common';
import ObjectID from 'bson-objectid';
import { Types } from 'mongoose';
const CryptoJS = require('crypto-js');
import BigNumber from 'bignumber.js';
export class Utils {
  private static readonly logger = new Logger(Utils.name);

  /**
   * Check string is Mongo ObjectId
   * @param {string} str
   * @return {boolean}
   */
  public static isObjectId(str: string) {
    try {
      new Types.ObjectId(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert string to Mongo ObjectId
   * @param {any} str
   * @return {Types.ObjectId}
   */
  public static toObjectId(str: any) {
    return new Types.ObjectId(str);
  }

  /**
   * Create mongodb id
   * @return {Types.ObjectId}
   */
  public static createObjectId() {
    return new Types.ObjectId(new ObjectID());
  }

  /**
   * Convert array string to array Mongo ObjectId
   * @param {string[]} strs
   * @return {Types.ObjectId[]}
   */
  public static toObjectIds(strs: string[]) {
    return strs.map((str) => this.toObjectId(str));
  }

  /**
   * Convert price
   * @param {any} value
   * @param {number} coinDecimal
   * @return {string}
   */
  public static convertPrice(value: any, coinDecimal = 18) {
    BigNumber.config({
      EXPONENTIAL_AT: 100,
    });
    return new BigNumber(value)
      .multipliedBy(new BigNumber(Math.pow(10, coinDecimal)))
      .toString();
  }

  /**
   * Get random element from array
   * @param {any[]} array
   * @return {any}
   */
  public static getRandom(array: any[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Wait
   * @param {number} ms
   * @return {Promise}
   */
  public static wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Retry a promoise function
   * @param {any} operation
   * @param {number} retries
   * @param {number} delay
   * @return {Promise<any>}
   */
  public static retryFn(operation, retries = 3, delay = 500) {
    return new Promise((resolve, reject) => {
      return operation()
        .then(resolve)
        .catch((reason) => {
          if (retries > 0) {
            return Utils.wait(delay)
              .then(this.retryFn.bind(null, operation, retries - 1, delay))
              .then(resolve)
              .catch(reject);
          }
          return reject(reason);
        });
    });
  }

  /**
   * Encrypt
   * @param {string} str
   * @return {string}
   */
  public static encrypt(str) {
    return CryptoJS.AES.encrypt(str, process.env.CRYPTO_SECRET).toString();
  }

  /**
   * Decrypt
   * @param {string} ciphertext
   * @return {string}
   */
  public static decrypt(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.CRYPTO_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Paginate
   * @param {any} model
   * @param {any} match
   * @param {any} query
   * @return {Promise<any>}
   */
  public static paginate(model: any, match: any, query: any) {
    this.logger.debug('paginate(): match', JSON.stringify(match));
    const pagingOptions: any = {
      page: query.page,
      limit: query.limit,
      sort: query.sort ? query.sort : { createdAt: 'desc' },
    };
    if (query.projection) {
      pagingOptions.projection = {};
      for (const [key, value] of Object.entries(query.projection)) {
        if (value !== '0' && value !== '1') {
          continue;
        }
        pagingOptions.projection[key] = Number(value);
      }
    }
    this.logger.debug(
      'paginate(): pagingOptions',
      JSON.stringify(pagingOptions),
    );
    return model.paginate(match, pagingOptions);
  }

  /**
   * Paginate
   * @param {any} model
   * @param {any} pipe
   * @param {any} query
   * @return {Promise<any>}
   */
  public static aggregatePaginate(model: any, pipe: any, query: any) {
    this.logger.debug('aggregatePaginate(): match', JSON.stringify(pipe));
    const pagingOptions: any = {
      page: query.page,
      limit: query.limit,
      sort: query.sort ? query.sort : { createdAt: 'desc' },
    };
    if (query.projection) {
      pagingOptions.projection = query.projection;
    }
    return model.aggregatePaginate(model.aggregate(pipe), pagingOptions);
  }
}
