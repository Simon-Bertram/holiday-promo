import LoginForm from "./login-form";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-semibold mb-10">Login Page</h1>
      <LoginForm />
    </div>
  );
}
