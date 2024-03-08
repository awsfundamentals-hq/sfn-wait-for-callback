import { ApiHandler } from "sst/node/api";
import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
const sfn = new SFNClient();

export const handler = ApiHandler(async (_evt) => {
  console.log("Event: ", _evt);

  // Get task token and decision from url
  const taskToken = _evt.queryStringParameters?.["task-token"];
  const decision = _evt.queryStringParameters?.["decision"];

  console.log("Task Token: ", taskToken);
  console.log("Decision: ", decision);

  if (!taskToken || !decision) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "task-token and decision are required" }),
    };
  }

  const command = new SendTaskSuccessCommand({
    taskToken,
    output: JSON.stringify({ isApproved: decision === "approved" }),
  });

  const response = await sfn.send(command);

  console.log("Response: ", response);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Sent task success" }),
  };
});
