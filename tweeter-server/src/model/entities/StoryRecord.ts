import { StatusRecord } from "./StatusRecord";

export interface StoryRecord extends StatusRecord {
    firstName: string;
    lastName: string;
    imageKey: string;
}