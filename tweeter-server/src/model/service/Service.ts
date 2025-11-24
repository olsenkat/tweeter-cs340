import { DataPage } from "../entities/DataPage";
import { AwsDaoFactory } from "../factory/AwsDaoFactory";
import { DaoFactory } from "../factory/DaoFactory";
import { AuthService } from "./AuthService";

export abstract class Service {
    protected daoFactory: DaoFactory;

    constructor(daoFactory: DaoFactory) {
        this.daoFactory = daoFactory;
    }
}