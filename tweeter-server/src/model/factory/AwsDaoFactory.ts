import { DaoFactory } from "./DaoFactory";
import { DynamoAuthDao } from "../dao/dynamo/DynamoAuthTokenDao";
import { DynamoFeedDao } from "../dao/dynamo/DynamoFeedDao";
import { DynamoFollowDao } from "../dao/dynamo/DynamoFollowDao";
import { DynamoStoryDao } from "../dao/dynamo/DynamoStoryDao";
import { DynamoUserDao } from "../dao/dynamo/DynamoUserDao";
import { S3ImageDao } from "../dao/s3/S3ImageDao";
import { AuthDao } from "../dao/interfaces/AuthDao";
import { FeedDao } from "../dao/interfaces/FeedDao";
import { FollowDao } from "../dao/interfaces/FollowDao";
import { S3Dao } from "../dao/interfaces/S3Dao";
import { StoryDao } from "../dao/interfaces/StoryDao";
import { UserDao } from "../dao/interfaces/UserDao";

export class AwsDaoFactory implements DaoFactory {
  private dynamoAuthDao = new DynamoAuthDao();
  private dynamoFeedDao = new DynamoFeedDao();
  private dynamoUserDao = new DynamoUserDao();
  private dynamoFollowDao = new DynamoFollowDao(this.dynamoUserDao);
  private s3ImageDao = new S3ImageDao();
  private dynamoStoryDao = new DynamoStoryDao();

  getAuthDao(): AuthDao {
    return this.dynamoAuthDao;
  }
  getFeedDao(): FeedDao {
    return this.dynamoFeedDao;
  }
  getFollowDao(): FollowDao {
    return this.dynamoFollowDao;
  }
  getS3Dao(): S3Dao {
    return this.s3ImageDao;
  }
  getStoryDao(): StoryDao {
    return this.dynamoStoryDao;
  }
  getUserDao(): UserDao {
    return this.dynamoUserDao;
  }
}
