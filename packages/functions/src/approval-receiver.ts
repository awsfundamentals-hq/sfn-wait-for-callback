import { SFNClient } from "@aws-sdk/client-sfn";
import { ApiHandler } from "sst/node/api";

const sfn = new SFNClient({});

const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN;
if (!STATE_MACHINE_ARN) {
  throw new Error("STATE_MACHINE_ARN is required");
}

export const handler = ApiHandler(async (_evt) => {
  console.log("Event: ", _evt);
});
