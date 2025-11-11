import { AuthToken, Status } from "tweeter-shared";
import { Service } from "./Service";

export class StatusService extends Service{
  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    let pagedStatusItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null
    };
    return await this.serverFacade.loadMoreFeedItems(pagedStatusItemRequest);
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    let pagedStatusItemRequest = {
      token: authToken.token,
      userAlias: userAlias,
      pageSize: pageSize,
      lastItem: lastItem ? lastItem.dto : null
    };
    return await this.serverFacade.loadMoreStoryItems(pagedStatusItemRequest);
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    let postStatusRequest = {
      token: authToken.token,
      newStatus: newStatus.dto
    };
    return await this.serverFacade.postStatus(postStatusRequest);
  }
}
