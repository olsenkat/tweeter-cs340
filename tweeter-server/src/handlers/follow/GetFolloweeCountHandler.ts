import { GetFolloweeCountRequest, GetFolloweeCountResponse } from "tweeter-shared";
import { FollowService } from "../../model/service/FollowService";

export const handler = async (request: GetFolloweeCountRequest): Promise<GetFolloweeCountResponse> => {
    const followService = new FollowService();
    const followeeCount = await followService.getFolloweeCount(request.token, request.user)

    return {
        success: true,
        message: null,
        followeeCount: followeeCount
    }
}