"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegistrationForm() {
  const [email, setEmail] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Subscribed!");
        setEmail("");
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Something went wrong. Registration failed."
        );
      }
    } catch (error) {
      console.error("Registration error: ", error);
      alert(
        `Registration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={handleChange}
      />
      <Button
        className="bg-white text-gray-800 hover:bg-blue-700 hover:text-white"
        type="submit"
      >
        Subscribe
      </Button>
    </form>
  );
}
