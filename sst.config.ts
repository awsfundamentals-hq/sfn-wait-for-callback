import { SSTConfig } from "sst";
import { Frontend } from "./stacks/Frontend";

export default {
  config(_input) {
    return {
      name: "sfn-wait-callback",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(Frontend);
  },
} satisfies SSTConfig;
