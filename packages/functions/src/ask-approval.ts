import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";

const client = new DynamoDBClient();

const APPROVAL_RECEIVER_URL = process.env.APPROVAL_RECEIVER_URL;

if (!APPROVAL_RECEIVER_URL) {
  throw new Error("APPROVAL_RECEIVER_URL is required");
}

type Event = {
  taskToken: string;
  executionArn: string;
  stateMachineArn: string;
  input: {
    title: string;
  };
};

export const handler = async (event: Event) => {
  console.log("Event: ", event);

  const { approveUrl, rejectUrl } = buildUrls(
    event.taskToken,
    event.executionArn
  );

  console.log("Approve URL: ", approveUrl.toString());
  console.log("Reject URL: ", rejectUrl.toString());

  const command = new PutItemCommand({
    TableName: process.env.REQUESTS_TABLE_NAME!,
    Item: {
      id: { S: event.executionArn },
      approveUrl: { S: approveUrl.toString() },
      rejectUrl: { S: rejectUrl.toString() },
      stateMachineArn: { S: event.stateMachineArn },
      title: { S: event.input.title },
    },
  });

  const response = await client.send(command);

  console.log("Response: ", response);

  return { response };
};

function buildUrls(taskToken: string, executionArn: string) {
  const url = new URL(APPROVAL_RECEIVER_URL!);
  url.searchParams.append("task-token", taskToken);
  url.searchParams.append("execution-arn", executionArn);
  const approveUrl = new URL(url.toString());
  approveUrl.searchParams.append("decision", "approved");
  const rejectUrl = new URL(url.toString());
  rejectUrl.searchParams.append("decision", "rejected");
  return { approveUrl, rejectUrl };
}
