import { NextjsSite, StackContext, use } from "sst/constructs";
import { StepFunction } from "./StepFunction";
import { Api } from "./Api";

export function Frontend({ stack }: StackContext) {
  const { stateMachine } = use(StepFunction);
  const { apiLambda } = use(Api);

  if (!apiLambda.url) {
    throw new Error("Api URL is required");
  }

  const site = new NextjsSite(stack, "NextjsSite", {
    path: "packages/frontend",
    environment: {
      STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      NEXT_PUBLIC_API_URL: apiLambda.url,
    },
  });

  stack.addOutputs({
    FrontendUrl: site.url,
  });
}
