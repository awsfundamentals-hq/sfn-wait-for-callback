import { ChangeEvent, FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("API_URL is required");
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    // Handle the form submission here. For example, send the title somewhere.
    console.log("Sending Title:", title);

    const result = await fetch(`${API_URL}invoke`, {
      body: JSON.stringify({ title }),
      method: "POST",
    });

    console.log("Result: ", result);

    if (!result.ok) {
      console.error("Error sending title");
      setError(`Error sending title: ${result.statusText}`);
    }

    // Reset title input after sending
    setTitle("");
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input type="text" value={title} onChange={handleChange} />
        </label>
        <button type="submit">Send</button>
      </form>

      {error && (
        <div>
          <p>Error Happened!</p>

          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
