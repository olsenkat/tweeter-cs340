/**
 * A page of data returned by the database.
 *
 * @param <T> type of data objects being returned.
 */
export class DataPage<T, K = any> {
  values: T[]; // page of values returned by the database
  hasMorePages: boolean; // Indicates whether there are more pages of data available to be retrieved
  LastEvaluatedKeyHandle: K | undefined; // The last evaluated key for pagination

  constructor(values: T[], hasMorePages: boolean, LastEvaluatedKey: K | undefined) {
    this.values = values;
    this.hasMorePages = hasMorePages;
    this.LastEvaluatedKeyHandle = LastEvaluatedKey
  }
}