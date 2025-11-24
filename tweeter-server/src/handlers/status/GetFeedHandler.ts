import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  StatusDto,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";

export const handler = async (
  request: PagedUserItemRequest<StatusDto>
): Promise<PagedUserItemResponse<StatusDto>> => {
  const serviceFactory = new ServiceFactory();
  const statusService = serviceFactory.getStatusService();
  const [items, hasMore] = await statusService.loadMoreFeedItems(
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
