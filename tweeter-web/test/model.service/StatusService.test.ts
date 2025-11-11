/**
 * @jest-environment node
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "isomorphic-fetch";
import { StatusService } from "../../src/model.service/StatusService";
import { AuthToken } from "tweeter-shared";


describe("StatusService", () => {
    let statusService: StatusService;

    beforeEach(() => {
        statusService = new StatusService();
    });

    it("awaits and returns story page", async () => {
        const authToken: AuthToken = new AuthToken("testToken", Date.now());
        const userAlias = "@allen";
        const pageSize = 10;
        const lastItem = null;

        const [storyPages, moreItems] = await statusService.loadMoreStoryItems(
            authToken,
            userAlias,
            pageSize,
            lastItem
        );

        expect(storyPages).toBeDefined();

        storyPages.forEach(status => {
            expect(status).toBeDefined();
            expect(status.post).toBeDefined();
            expect(status.user).toBeDefined();
            expect(status.user.firstName).toBeDefined();
            expect(status.user.lastName).toBeDefined();
            expect(status.user.alias).toBeDefined();
            expect(status.user.imageUrl).toBeDefined();
            expect(status.timestamp).toBeDefined();
            expect(status.segments).toBeDefined();
        });

        expect(storyPages.length).toBeLessThanOrEqual(pageSize);
        expect(moreItems).toBeDefined();
    });
});