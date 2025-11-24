import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  UserDto,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: PagedUserItemRequest<UserDto>
): Promise<PagedUserItemResponse<UserDto>> => {
  const serviceFactory = new ServiceFactory();
  const followService = serviceFactory.getFollowService();
  const [items, hasMore] = await followService.loadMoreFollowees(
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
};
