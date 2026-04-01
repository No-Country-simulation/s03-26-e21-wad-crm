import { GoogleIcon } from "@src/components/icons/Google";
import { Button } from "@src/components/ui/Button";
import { Input } from "@src/components/ui/Input";
import { Separator } from "@src/components/ui/Separator";

export const Auth = () => {
  return (
    <section className="flex-1 flex items-center justify-center p-8">
      <article className="bg-glass p-8 text-center w-[min(100%,500px)] flex flex-col gap-8 rounded-lg">
        <header className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Login</h1>
          <p>Ingresa con tu cuenta para continuar.</p>
          <Button variant="secondary" className="">
            <GoogleIcon className="w-6 h-6" />
            Iniciar sesión con Google
          </Button>
        </header>
        <Separator text="o continua con email" />
        <form action="" className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" required />
          <Input label="Password" id="password" type="password" required />
          <a href="/forgot-password" className="text-end font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>
        <footer>
          <p>
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="font-medium hover:underline">
              Regístrate
            </a>
          </p>
        </footer>
      </article>
      <article className="bg-glass p-8 text-center w-[min(100%,500px)] flex-col gap-8 rounded-lg hidden">
        <header className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Register</h1>
          <p>Regístrate con tu cuenta para continuar.</p>
          <Button variant="secondary" className="">
            <GoogleIcon className="w-6 h-6" />
            Iniciar sesión con Google
          </Button>
        </header>
        <Separator text="o continua con email" />
        <form action="" className="flex flex-col gap-4">
          <Input label="Email" id="email" type="email" required />
          <Input label="Password" id="password" type="password" required />
          <a href="/forgot-password" className="text-end font-medium hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
          <Button type="submit" className="w-full">
            Iniciar sesión
          </Button>
        </form>
        <footer>
          <p>
            ¿No tienes una cuenta?{" "}
            <a href="/register" className="font-medium hover:underline">
              Regístrate
            </a>
          </p>
        </footer>
      </article>
    </section>
  );
};
