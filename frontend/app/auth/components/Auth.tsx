"use client";

import { Button } from "@src/components/ui/Button";
import { Input } from "@src/components/ui/Input";
import { useState } from "react";
import { AuthCard } from "./AuthCard";

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => setIsLogin((prev) => !prev);

  return (
    <section className="flex-1 flex items-center justify-center overflow-clip">
      <AuthCard
        header={{
          title: "Bienvenido de nuevo",
          description: "Inicia sesión con tu cuenta para continuar.",
          googleActionLabel: "Iniciar sesión con Google",
        }}
        separatorText="o continua con email"
        toggleMode={toggleMode}
        footer={{ text: "¿No tienes una cuenta? ", actionLabel: "Regístrate" }}
        className={`${!isLogin && "absolute -translate-y-full opacity-0"}`}
      >
        <form action="" className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" placeholder="Escribe tu email" required />
          <Input label="Password" id="password" type="password" placeholder="Escribe tu contraseña" required />
          <a href="/forgot-password" className="text-end font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>
      </AuthCard>
      <AuthCard
        header={{
          title: "Regístrate",
          description: "Regístrate con tu cuenta para continuar.",
          googleActionLabel: "Regístrate con Google",
        }}
        separatorText="o continua con email"
        toggleMode={toggleMode}
        footer={{ text: "¿Ya tienes una cuenta? ", actionLabel: "Inicia sesión" }}
        className={`${isLogin && "absolute translate-y-full opacity-0"}`}
      >
        <form action="" className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" placeholder="Escribe tu email" required />
          <Input label="Password" id="password" type="password" placeholder="Escribe tu contraseña" required />
          <Button type="submit" className="w-full">
            Regístrate
          </Button>
        </form>
      </AuthCard>
    </section>
  );
};
