import { AuthDao } from "../dao/interfaces/AuthDao";
import { FeedDao } from "../dao/interfaces/FeedDao";
import { FollowDao } from "../dao/interfaces/FollowDao";
import { S3Dao } from "../dao/interfaces/S3Dao";
import { StoryDao } from "../dao/interfaces/StoryDao";
import { UserDao } from "../dao/interfaces/UserDao";

export interface DaoFactory {
  getAuthDao(): AuthDao;
  getFeedDao(): FeedDao;
  getFollowDao(): FollowDao;
  getS3Dao(): S3Dao;
  getStoryDao(): StoryDao;
  getUserDao(): UserDao;
}
