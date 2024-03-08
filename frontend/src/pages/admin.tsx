import React from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

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
      {executions.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg shadow-sm bg-white"
        >
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              {item.title || "Untitled"}
            </h2>
            <a
              href={item.link}
              className="text-blue-500 hover:text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link to Step Function
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <a
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              href={item.approveUrl}
            >
              Approve
            </a>
            <a
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              href={item.rejectUrl}
            >
              Decline
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
