import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ApiHandler } from "sst/node/api";

const sfn = new SFNClient({});
const ddb = new DynamoDBClient({});

const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN;
if (!STATE_MACHINE_ARN) {
  throw new Error("STATE_MACHINE_ARN is required");
}

export const handler = ApiHandler(async (_evt) => {
  console.log("Event: ", _evt);

  const path = _evt.requestContext.http.path;

  switch (path) {
    case "/invoke":
      // Get Body
      const body = JSON.parse(_evt.body || "{}");
      if (!body.title) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Title is required" }),
        };
      }

      return await invokeNewStepFunction(body.title);
    case "/invocations":
      return await getStepFunctionInvocations();
    default:
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Not Found" }),
      };
  }
});

async function invokeNewStepFunction(title: string) {
  console.log("Invoking new Step Function");

  const command = new StartExecutionCommand({
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify({ title }),
  });

  const response = await sfn.send(command);

  console.log("Response: ", response);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Invoked new Step Function",
      executionArn: response.executionArn,
    }),
  };
}

async function getStepFunctionInvocations() {
  console.log("Getting Step Function Invocations");

  // Scan DynamoDB Table
  const command = new ScanCommand({
    TableName: process.env.REQUESTS_TABLE_NAME!,
  });

  const response = await ddb.send(command);

  console.log("Response: ", response);

  const unmarshalledItems = response.Items?.map((item) => unmarshall(item));

  return {
    statusCode: 200,
    body: JSON.stringify(unmarshalledItems),
  };
}
