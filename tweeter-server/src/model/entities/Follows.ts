export class Follows {
    private _follower_handle: string;
    private follower_name: string;
    private _followee_handle: string;
    private followee_name: string;

    constructor(
        follower_handle: string,
        follower_name: string,
        followee_handle: string,
        followee_name: string
    ) {
        this._follower_handle = follower_handle;
        this.follower_name = follower_name;
        this._followee_handle = followee_handle;
        this.followee_name = followee_name;
    }
    public get followee_handle() {
        return this._followee_handle;
    }

    public get follower_handle() {
        return this._follower_handle;
    }

    toString(): string {
        return `${this.follower_name} (${this.follower_handle}) is following ${this.followee_name} (${this.followee_handle})`;
        // return `Follows(follower_handle=${this.follower_handle}, follower_name=${this.follower_name}, followee_handle=${this.followee_handle}, followee_name=${this.followee_name})`;
    }

    followerString(): string {
        return `${this.follower_name} (${this.follower_handle})`;
    }

    followeeString(): string {
        return `${this.followee_name} (${this.followee_handle})`;
    }
}