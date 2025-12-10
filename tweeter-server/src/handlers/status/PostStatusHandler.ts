import { PostStatusRequest, PostStatusResponse } from "tweeter-shared";
import { ServiceFactory } from "../../model/factory/ServiceFactory";
import handleError from "../BaseHandler";

export const handler = async (event: any): Promise<any> => {
  try {
    const request: PostStatusRequest = JSON.parse(event.body);

    const serviceFactory = new ServiceFactory();
    const statusService = serviceFactory.getStatusService();
    await statusService.postStatus(request.token, request.newStatus);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: null,
      }),
    };
  } catch (err) {
    const { message } = handleError(err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS for browser
      },
      body: JSON.stringify({ success: false, message }),
    };
  }
};
