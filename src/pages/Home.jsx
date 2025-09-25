import React from "react";
import { useUser } from "../contexts/UserContext";

export default function HomePage() {
  const { logout } = useUser();

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold">Home</h2>
   
      </header>

      <main>
        <p>Bem-vindo! Esta é uma página protegida genérica.</p>
      </main>
    </div>
  );
}