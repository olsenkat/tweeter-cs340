import { PagedUserItemRequest, PagedUserItemResponse, UserDto } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: PagedUserItemRequest<UserDto>): Promise<PagedUserItemResponse<UserDto>> => {
    const followService = new FollowService();
    const [items, hasMore] = await followService.loadMoreFollowees(request.token, request.userAlias, request.pageSize, request.lastItem)

    return {
        success: true,
        message: null,
        items: items,
        hasMore: hasMore
    }
}