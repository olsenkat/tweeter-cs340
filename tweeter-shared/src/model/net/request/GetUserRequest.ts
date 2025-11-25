import { AuthenticatedTweeterRequest } from "./AuthenticatedTweeterRequest";

export interface GetUserRequest extends AuthenticatedTweeterRequest {
    readonly alias: string
}