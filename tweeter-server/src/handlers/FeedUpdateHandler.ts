import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { FeedRecord } from "../model/entities/FeedRecord";
import { ServiceFactory } from "../model/factory/ServiceFactory";

const sqsClient = new SQSClient({ region: "us-west-2" });
const queueUrl = process.env.FEED_BATCH_QUEUE_URL!;

const serviceFactory = new ServiceFactory();
const followService = serviceFactory.getFollowService();

interface FeedInitialMessage {
  authorUser: {
    alias: string;
    firstName: string;
    lastName: string;
    imageKey: string;
  };
  post: string;
  timestamp: number;
}

export const handler = async function (event: any) {
  for (const record of event.Records) {
    const status: FeedInitialMessage = JSON.parse(record.body);
    console.info("Processing status for feed update: ", status);
    if (!status) {
      console.error("Invalid status message: ", record.body);
      continue;
    }
    if (!status.authorUser || !status.authorUser.alias) {
      console.error("Invalid author user in status message: ", record.body);
      continue;
    }
    console.info("Status userAlias: ", status.authorUser.alias);
    const followers = await followService
      .getFollowers(status.authorUser.alias)
      .catch((err) => {
        console.error("Failed to load followers:", err);
        return [];
      });

    if (followers.length === 0) {
      console.info("No followers found for user: ", status.authorUser.alias);
      continue;
    }
    console.info(`${followers.length} followers retrieved in postFeed.`);

    // Create Feed Record
    const feedRecords: FeedRecord[] = followers.map(
      (followerAlias) =>
        ({
          post: status.post,
          userAlias: followerAlias,
          timestamp: status.timestamp,

          authorAlias: status.authorUser.alias,
          authorFirstName: status.authorUser.firstName,
          authorLastName: status.authorUser.lastName,
          authorImageKey: status.authorUser.imageKey,
        } as FeedRecord)
    );

    try {
      const batchSize = 25;
      const batches = [];

      for (let j = 0; j < feedRecords.length; j += batchSize) {
        const batch = feedRecords.slice(j, j + batchSize);
        batches.push(batch);
      }

      for (const batch of batches) {
        try {
          await sendWithRetry(
            new SendMessageCommand({
              MessageBody: JSON.stringify({ feedRecords: batch }),
              QueueUrl: queueUrl,
            })
          );
        } catch (err) {
          console.error("Failed to send SQS message for feed batch: ", err);
        }
      }

      console.info("SQS messages sent successfully.");
    } catch (err) {
      console.error("Failed to send feed records to SQS: ", err);
      throw err;
    }
  }
};

const sendWithRetry = async (
  command: SendMessageCommand,
  maxRetries = 3,
  delayMs = 1000
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sqsClient.send(command);
      return; // Success
    } catch (error) {
      console.error(`SQS send attempt ${attempt} failed: `, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      if (attempt === maxRetries) {
        throw error; // Rethrow after max retries
      }
    }
  }
};
