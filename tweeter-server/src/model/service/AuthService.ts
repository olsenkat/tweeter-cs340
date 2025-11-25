import { UnauthorizedError } from "../errors/Error";
import { Service } from "./Service";

const TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minutes


export class AuthService extends Service {
    async validateToken(token: string): Promise<{alias: string}> {
        const authToken = await this.daoFactory.getAuthDao().getAuthToken(token);
        if (!authToken) {
            throw new UnauthorizedError("Invalid auth token")
        }
        const now = Date.now()
        if (now > authToken.timestamp + TOKEN_LIFETIME_MS) {
            await this.deleteToken(token);
            throw new UnauthorizedError("Auth token has expired")
        }

        await this.daoFactory.getAuthDao().updateTokenTimestamp(token, authToken.alias, now);
        return {alias: authToken.alias}
    }
    async deleteToken(token: string) {
        await this.daoFactory.getAuthDao().deleteAuthToken(token);
    }
}