import AuthForm from "../../components/auth/AuthForm";

export default function Home() {
  return (
    <main className="bg-powder min-h-screen flex items-center justify-center text-white text-center px-4">
      <div>
        <h1 className="text-5xl font-bold">Welcome to Oriana</h1>
        <AuthForm />
      </div>
    </main>
  );
}
