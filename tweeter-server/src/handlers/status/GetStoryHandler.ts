import {
  PagedUserItemRequest,
  PagedUserItemResponse,
  StatusDto,
} from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (
  request: PagedUserItemRequest<StatusDto>
): Promise<PagedUserItemResponse<StatusDto>> => {
  try {
    const serviceFactory = new ServiceFactory();
    const statusService = serviceFactory.getStatusService();
    const [items, hasMore] = await statusService.loadMoreStoryItems(
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
