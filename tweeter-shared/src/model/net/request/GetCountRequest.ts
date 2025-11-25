import { UserDto } from "../../dto/UserDto";
import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface GetCountRequest extends AuthenticatedTweeterRequest {
    readonly user: UserDto
}