import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChangeEvent, FormEvent, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL is required");
}

export default function Home() {
  // Use react-query to not do this in the future 😉
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
    setError("");
    setLink("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError("");
    setLink("");
    // @ts-ignore
    const titleFromEvent = event.target[0].value;

    const result = await fetch(`${API_URL}invoke`, {
      body: JSON.stringify({ title: titleFromEvent }),
      method: "POST",
    });

    if (!result.ok) {
      console.error("Error sending title");
      setError(`Error sending title: ${result.statusText}`);
    }

    const { executionArn } = await result.json();

    const link = `https://console.aws.amazon.com/states/home?region=us-east-1#/executions/details/${executionArn}`;
    setLink(link);
    setTitle("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center h-[400px] flex-col space-y-4">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Submit Article</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Enter a title to begin
            </p>
          </div>
          <div className="flex flex-col max-w-sm w-full space-y-2 items-center">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => handleChange(e)}
            />
            <Button className="mx-auto">Send</Button>
            {error && (
              <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>
            )}
            {link && (
              <a
                className="text-slate-500 dark:text-slate-400 text-xs underline"
                href={link}
                target="_blank"
              >
                Step Function Invoked
              </a>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This form will invoke a Step Function
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you enter forbidden the step function will be stopped and appear
            in the Content Moderation Tab
          </p>
        </div>
      </form>
    </div>
  );
}
