import { AuthService } from "../service/AuthService";
import { FollowService } from "../service/FollowService";
import { StatusService } from "../service/StatusService";
import { UserService } from "../service/UserService";
import { AwsDaoFactory } from "./AwsDaoFactory";
import { DaoFactory } from "./DaoFactory";

export class ServiceFactory {
  protected daoFactory: DaoFactory;
  private authService: AuthService;
  private userService: UserService;
  private followService: FollowService;
  private statusService: StatusService;

  constructor(daoFactory?: DaoFactory) {
    this.daoFactory = daoFactory ?? new AwsDaoFactory();
    this.authService = new AuthService(this.daoFactory);
    this.userService = new UserService(this.daoFactory, this.authService);
    this.followService = new FollowService(this.daoFactory, this.authService);
    this.statusService = new StatusService(
      this.daoFactory,
      this.authService,
      this.followService
    );
  }
  getAuthService(): AuthService {
    return this.authService;
  }
  getUserService(): UserService {
    return this.userService;
  }
  getFollowService(): FollowService {
    return this.followService;
  }
  getStatusService(): StatusService {
    return this.statusService;
  }
}
