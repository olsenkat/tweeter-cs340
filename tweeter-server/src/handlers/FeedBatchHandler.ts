import { DynamoFeedDao } from "../model/dao/dynamo/DynamoFeedDao";
import { FeedRecord } from "../model/entities/FeedRecord";

export const handler = async function (event: any) {
  const feedDao = new DynamoFeedDao();

  for (let i = 0; i < event.Records.length; ++i) {
    let { body } = event.Records[i];
    body = JSON.parse(body);

    const feedRecords: FeedRecord[] = body.feedRecords;

    if (feedRecords && feedRecords.length > 0) {
      await feedDao.addStatusesToFeeds(feedRecords);
    }
  }
  return null;
};
