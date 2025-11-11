import { TweeterResponse } from "./TweeterResponse";

export interface GetFolloweeCountResponse extends TweeterResponse {
    readonly followeeCount: number
}