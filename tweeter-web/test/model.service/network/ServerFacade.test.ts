/**
 * @jest-environment node
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "isomorphic-fetch";
import { ServerFacade } from "../../../src/model.service/network/ServerFacade";


describe("ServerFacade", () => {
    let serverFacade: ServerFacade;

    beforeEach(() => {
        serverFacade = new ServerFacade();
    });

    it("awaits and calls register", async () => {

        // This is my call to register
        const request = {
            firstName: "testfirstName",
            lastName: "testLastName",
            alias: "@testAlias_" + Date.now(),
            password: "testPassword",
            imageStringBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
            imageFileExtension: "png"
        }

        const [user, authToken] = await serverFacade.createUser(request);
        expect(user).toBeDefined();
        expect(user.firstName).toBeDefined();
        expect(user.lastName).toBeDefined();
        expect(user.alias).toBeDefined();
        expect(user.imageUrl).toBeDefined();
        expect(authToken).toBeDefined();
        expect(authToken.token).toBeDefined();
        expect(authToken.timestamp).toBeDefined();
    });
    it("awaits and calls getMoreFollowers", async () => {
        const request = {
            token: "testToken",
            userAlias: "@allen",
            pageSize: 10,
            lastItem: null
        }

        const [users, moreItems] = await serverFacade.getMoreFollowers(request);
        expect(users).toBeDefined();
        users.forEach(user => {
            expect(user).toBeDefined();
            expect(user.firstName).toBeDefined();
            expect(user.lastName).toBeDefined();
            expect(user.alias).toBeDefined();
            expect(user.imageUrl).toBeDefined();
        });
        expect(users.length).toBeLessThanOrEqual(10);
        expect(moreItems).toBeDefined();
    });
    it("awaits and calls getFollowersCount", async () => {
        const request = {
            token: "testToken",
            user: {
                firstName: "Allen",
                lastName: "Anderson",
                alias: "@allen",
                imageUrl: "https://tweeterbucket.s3.amazonaws.com/allen.png"
            }
        }

        const count = await serverFacade.getFollowerCount(request);
        expect(count).toBeDefined();
        expect(count).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(count)).toBe(true);
    });
})