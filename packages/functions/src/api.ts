import { ApiHandler } from "sst/node/api";
import {
  StartExecutionCommand,
  SFNClient,
  ListExecutionsCommand,
} from "@aws-sdk/client-sfn";

const sfn = new SFNClient({});

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

      await invokeNewStepFunction(body.title);
    case "/continue":
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Continued Step Function" }),
      };
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

  const command = new ListExecutionsCommand({
    stateMachineArn: STATE_MACHINE_ARN,
    statusFilter: "RUNNING",
  });

  const response = await sfn.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Got Step Function Invocations",
      executions: response.executions,
    }),
  };
}
