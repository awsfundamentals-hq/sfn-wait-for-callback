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
    // logFormat: "JSON",
  });

  return { apiLambda };
}
