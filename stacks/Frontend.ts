import { NextjsSite, StackContext, use } from "sst/constructs";
import { StepFunction } from "./StepFunction";
import { Api } from "./Api";

export function Frontend({ stack }: StackContext) {
  const { stateMachine } = use(StepFunction);
  const { apiLambda } = use(Api);

  if (!apiLambda.url) {
    throw new Error("Api URL is required");
  }

  new NextjsSite(stack, "NextjsSite", {
    path: "frontend",
    environment: {
      STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      // Can't bind it to the page because I also need it on client-side
      NEXT_PUBLIC_API_URL: apiLambda.url,
    },
    openNextVersion: "2.3.7",
  });
}
