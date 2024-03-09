import React from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { Label } from "@/components/ui/label";
import { CardTitle, CardHeader, CardFooter, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type Execution = {
  id: string;
  stateMachineArn: string;
  approveUrl: string;
  rejectUrl: string;
  title: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL is required");
}

export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`${API_URL}invocations`);
  const data = (await res.json()) as Execution[];
  console.log("Data: ", data);

  const executions = data;

  const executionsWithLinks = executions.map((item) => {
    const link = `https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/${item.id}`;
    return { ...item, link };
  });

  return { props: { executions: executionsWithLinks } };
}

export default function Admin({
  executions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="flex flex-col space-y-4">
      {executions.map((execution) => (
        <Card className="w-full" key={execution.id}>
          <CardHeader className="flex-col">
            <div className="space-y-1">
              <Label className="text-sm" htmlFor="title">
                Title: {execution.title}
              </Label>
              <CardTitle className="text-base">
                Workflow Step: Check if title is allowed
              </CardTitle>
            </div>
            <div className="space-y-1">
              <p className="text-xs">
                This is a step function waiting for a callback token. Approve it
                if the title looks fine. Reject it if it is not fine.
              </p>
            </div>
            <div className="space-y-1">
              <a
                className="text-sm font-medium text-cyan-700 underline dark:text-cyan-400"
                href={execution.link}
              >
                View in Step Function
              </a>
            </div>
          </CardHeader>
          <CardFooter className="flex gap-2">
            <Button
              className="button"
              onClick={() => {
                window.open(execution.approveUrl, "_blank");
              }}
            >
              Approve
            </Button>
            <Button
              className="button button-outline"
              onClick={() => {
                window.open(execution.rejectUrl, "_blank");
              }}
            >
              Reject
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
