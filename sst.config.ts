import { SSTConfig } from "sst";
import { Frontend } from "./stacks/Frontend";
import { StepFunction } from "./stacks/StepFunction";

export default {
  config(_input) {
    return {
      name: "sfn-wait-callback",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(Frontend);
    app.stack(StepFunction);
  },
} satisfies SSTConfig;
