import { StackContext, Table } from "sst/constructs";

export function RequestTable({ stack }: StackContext) {
  const requestsTable = new Table(stack, "RequestsTable", {
    fields: {
      id: "string",
      approvalUrl: "string",
      title: "string",
      declinedUrl: "string",
      result: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  return {
    requestsTable,
  };
}
