import { PagedUserItemRequest, PagedUserItemResponse, StatusDto } from "tweeter-shared";
import { StatusService } from "../../model/service/StatusService";

export const handler = async (request: PagedUserItemRequest<StatusDto>): Promise<PagedUserItemResponse<StatusDto>> => {
    const followService = new StatusService();
    const [items, hasMore] = await followService.loadMoreFeedItems(request.token, request.userAlias, request.pageSize, request.lastItem)

    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    }
}