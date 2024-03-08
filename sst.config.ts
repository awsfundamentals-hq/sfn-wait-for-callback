import { SSTConfig } from "sst";
import { Frontend } from "./stacks/Frontend";
import { StepFunction } from "./stacks/StepFunction";
import { RequestTable } from "./stacks/Table";
import { Api } from "./stacks/Api";

export default {
  config(_input) {
    return {
      name: "sfn-wait-callback",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(RequestTable);
    app.stack(Api);
    app.stack(StepFunction);
    app.stack(Frontend);
  },
} satisfies SSTConfig;
