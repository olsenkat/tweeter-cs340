import { TweeterResponse } from "./TweeterResponse";

export interface BaseFollowResponse extends TweeterResponse {
    readonly followerCount: number,
    readonly followeeCount: number
}