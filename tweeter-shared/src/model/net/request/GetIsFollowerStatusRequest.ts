import { UserDto } from "../../dto/UserDto";
import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface GetIsFollowerStatusRequest extends AuthenticatedTweeterRequest {
    readonly user: UserDto,
    readonly selectedUser: UserDto
}