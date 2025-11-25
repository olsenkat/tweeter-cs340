import { TweeterRequest } from "./TweeterRequest";

export interface AuthenticatedTweeterRequest extends TweeterRequest {
    readonly token: string,
}