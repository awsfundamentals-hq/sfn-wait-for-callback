import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { SFNClient, SendTaskSuccessCommand } from "@aws-sdk/client-sfn";
import { ApiHandler } from "sst/node/api";
const sfn = new SFNClient();
const ddb = new DynamoDBClient();

export const handler = ApiHandler(async (_evt) => {
  console.log("Event: ", _evt);

  // Get task token and decision from url
  const taskToken = _evt.queryStringParameters?.["task-token"];
  const decision = _evt.queryStringParameters?.["decision"];
  const executionArn = _evt.queryStringParameters?.["execution-arn"];

  console.log("Task Token: ", taskToken);
  console.log("Decision: ", decision);

  if (!taskToken || !decision || !executionArn) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "task-token, decision, execution arn are required",
      }),
    };
  }

  const command = new SendTaskSuccessCommand({
    taskToken,
    output: JSON.stringify({ isApproved: decision === "approved" }),
  });

  const response = await sfn.send(command);

  console.log("Response: ", response);

  // Remove DynamoDB Item with executionArn
  const deleteCommand = new DeleteItemCommand({
    TableName: process.env.REQUESTS_TABLE_NAME,
    Key: { id: { S: executionArn } },
  });

  const deleteResult = await ddb.send(deleteCommand);

  console.log("Delete Result: ", deleteResult);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Sent task success" }),
  };
});
