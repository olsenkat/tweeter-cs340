import { TweeterResponse } from "./TweeterResponse";

export interface GetFollowerCountResponse extends TweeterResponse {
    readonly followerCount: number
}