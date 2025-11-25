import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  UserDto,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: PagedUserItemRequest<UserDto>
): Promise<PagedUserItemResponse<UserDto>> => {
  try {
    const serviceFactory = new ServiceFactory();
    const followService = serviceFactory.getFollowService();
    const [items, hasMore] = await followService.loadMoreFollowers(
      request.token,
      request.userAlias,
      request.pageSize,
      request.lastItem
    );

    return {
      success: true,
      message: null,
      items: items,
      hasMore: hasMore,
    };
  } catch (err) {
    const { message } = handleError(err);
    return { success: false, message, items: [], hasMore: false };
  }
};
