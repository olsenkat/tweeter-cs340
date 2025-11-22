import { StatusRecord } from "./StatusRecord";

export interface FeedRecord extends StatusRecord {
    authorAlias: string;
    authorFirstName: string;
    authorLastName: string;
    authorImageKey: string;
}