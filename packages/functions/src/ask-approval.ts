import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Table } from "sst/node/table";

const client = new DynamoDBClient();

type Event = {
  taskToken: string;
  executionArn: string;
  stateMachineArn: string;
};

export const handler = async (event: Event) => {
  console.log("Event: ", event);

  const tableName = Table.RequestsTable.tableName;

  const { approveUrl, rejectUrl } = buildUrls(event.taskToken);

  console.log("Approve URL: ", approveUrl.toString());
  console.log("Reject URL: ", rejectUrl.toString());

  const command = new PutItemCommand({
    TableName: tableName,
    Item: {
      id: { S: event.executionArn },
      approveUrl: { S: approveUrl.toString() },
      rejectUrl: { S: rejectUrl.toString() },
      stateMachineArn: { S: event.stateMachineArn },
    },
  });

  const response = await client.send(command);

  console.log("Response: ", response);

  return { response };
};

function buildUrls(taskToken: string) {
  const url = new URL("APPROVAL_RECEIVER_URL");
  url.searchParams.append("task-token", taskToken);
  const approveUrl = new URL(url.toString());
  approveUrl.searchParams.append("decision", "approved");
  const rejectUrl = new URL(url.toString());
  rejectUrl.searchParams.append("decision", "rejected");
  return { approveUrl, rejectUrl };
}
