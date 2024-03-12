import { Function, StackContext, use } from "sst/constructs";
import { RequestTable } from "./Table";

export function Api({ stack }: StackContext) {
  const { requestsTable } = use(RequestTable);
  const apiLambda = new Function(stack, "Api", {
    handler: "packages/functions/src/api.handler",
    url: {
      authorizer: "none",
      cors: true,
    },
    bind: [requestsTable],
    // Adding it as an .env var as well because I need to use an older SST Version and I can't import the binding rn
    environment: {
      REQUESTS_TABLE_NAME: requestsTable.tableName,
    },
  });

  stack.addOutputs({
    ApiEndpoint: apiLambda.url,
  });

  return { apiLambda };
}
