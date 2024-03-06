import { NextjsSite, StackContext } from "sst/constructs";

export function Frontend({ stack }: StackContext) {
  new NextjsSite(stack, "NextjsSite", {
    path: "frontend",
  });
}
