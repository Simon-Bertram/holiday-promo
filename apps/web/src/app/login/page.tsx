"use client";

import { useState } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <div className="mx-auto mt-40 max-w-md">
      <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
    </div>
  ) : (
    <div className="mx-auto mt-40 max-w-md">
      <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
    </div>
  );
}
