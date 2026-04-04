import { Button, Form, Input } from "@src/components/ui";

export const Login = () => {
  return (
    <section className="flex flex-col justify-center gap-6 p-4 bg-neutral-800 w-[min(100%,400px)] text-center rounded-md sm:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl">Inicio de sesión</h1>
        <p>Inicia sesión con tu cuenta para continuar.</p>
      </header>
      <Form>
        <Input label="Email" id="email" type="email" placeholder="Escribe tu email" required />
        <Input label="Password" id="password" type="password" placeholder="Escribe tu contraseña" required />
        <Button type="submit" className="w-full mt-1">
          Iniciar sesión
        </Button>
      </Form>
    </section>
  );
};
