import { Button } from "@src/components/ui/Button";
import { Input } from "@src/components/ui/Input";

export const Login = () => {
  return (
    <section className="flex-1 flex items-center justify-center p-8 bg-red-200">
      <article className="text-center w-[min(100%,400px)] flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">Bienvenido de nuevo</h2>
          <p>Inicia sesión con tu cuenta para continuar.</p>
        </header>
        <form action="" className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" placeholder="Escribe tu email" required />
          <Input label="Password" id="password" type="password" placeholder="Escribe tu contraseña" required />
          <Button type="submit" className="w-full mt-4">
            Iniciar sesión
          </Button>
        </form>
      </article>
    </section>
  );
};
