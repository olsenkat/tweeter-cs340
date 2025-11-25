import { UserDto } from "../../dto/UserDto";
import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface FollowRequest extends AuthenticatedTweeterRequest {
    readonly userToFollow: UserDto
}