import { Service } from "@tsed/di";
import { MongooseDocumentMethods, MongooseMergedDocument, MongooseModel } from "@tsed/mongoose";
import type mongodb from "mongodb";
import { Document, FilterQuery, ProjectionType, QueryOptions, SaveOptions, isValidObjectId } from "mongoose";
import { Pageable } from "../models/Pageable";
import { Pagination } from "../models/Pagination";

@Service()
export abstract class Repository<T> {
  protected abstract Model: MongooseModel<T>;

  /**
   * Check whether something has already existed in the database.
   * @param filter _id or a filter query
   * @returns boolean
   */
  exists(filter?: string | FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>) {
    return this.Model.exists(typeof filter === "string" || isValidObjectId(filter) ? { _id: filter } : filter || {});
  }

  /**
   * Find a single record in the database either by id or a query.
   * @param filter _id or a filter query
   * @returns Promise<T | undefined> The object or undefined if not found
   */
  find(
    filter?: string | FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>,
    projection?: ProjectionType<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>
  ): Promise<T | null> {
    if (typeof filter === "string" || isValidObjectId(filter)) {
      return this.Model.findById(filter, projection).exec();
    }
    return this.Model.findOne(filter || {}, projection).exec();
  }

  /**
   * Find multiple records in the database by a query.
   * @param filter A filter query
   * @returns Promise<T[] | undefined> An array of objects or undefined if not found
   */
  findMany(filter?: FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>): Promise<T[]> {
    return this.Model.find(filter || {}).exec();
  }

  /**
   * Save the record into database.
   * @param model The object
   * @returns Promise<T> The object itself with _id (and other properties) populated
   */
  async save(model: T, options?: SaveOptions): Promise<T> {
    const m = new this.Model(model);
    await m.validate;
    await m.save(options);
    return m;
  }

  async saveMany(models: T[], options?: mongodb.BulkWriteOptions & { timestamps?: boolean }): Promise<T[]> {
    const mm = models.map((m) => new this.Model(m));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.Model.bulkSave(mm, options);
    return mm;
  }

  /**
   * Delete a single record from the database.
   * @param filter _id or a filter query
   * @returns Promise<any> a result indicating whether the deletion went successfully
   */
  delete(
    filter?: string | FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>,
    options?: QueryOptions
  ): Promise<any> {
    if (typeof filter === "string" || isValidObjectId(filter)) {
      filter = { _id: filter };
    }
    return this.Model.deleteOne(filter, options).exec();
  }

  /**
   * Delete multiple records from the database.
   * @param filter A filter query
   * @returns Promise<any> a result indicating the number of objects were deleted
   */
  deleteMany(
    filter?: FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>,
    options?: QueryOptions
  ): Promise<any> {
    return this.Model.deleteMany(filter, options).exec();
  }

  /**
   * Load a list of records by page.
   * @param pageable Pageable object to determine page size, page number, etc.
   * @param filter A filter query
   * @returns Promise<Pagination<T> | null> A list of objects
   */
  async paginate(
    pageable: Pageable,
    filter?: FilterQuery<MongooseMergedDocument<Document & T & MongooseDocumentMethods<T>>>
  ): Promise<Pagination<T>> {
    const total = await this.Model.count(filter || {}).exec();
    const data = await this.Model.find(filter || {})
      .skip(pageable.offset)
      .limit(pageable.limit)
      .sort(pageable.sorter)
      .exec();
    return new Pagination<T>({ data, total, pageable });
  }

  /**
   * Return the mongoose model
   */
  model(): MongooseModel<T> {
    return this.Model;
  }
}
