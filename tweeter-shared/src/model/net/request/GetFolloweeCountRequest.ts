import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

export interface GetFolloweeCountRequest extends TweeterRequest {
    readonly token: string,
    readonly user: UserDto
}