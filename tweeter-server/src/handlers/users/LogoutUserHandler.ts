import { LogoutUserRequest, LogoutUserResponse } from "tweeter-shared";
import { UserService } from "../../model/service/UserService";

export const handler = async (request: LogoutUserRequest): Promise<LogoutUserResponse> => {
    const userService = new UserService();
    await userService.logoutUser(request.token)

    return {
        success: true,
        message: null,
    }
}