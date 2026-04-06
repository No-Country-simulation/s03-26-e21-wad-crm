'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button, Form, Input } from "@src/components/ui";
import { LoginRequest } from '../types/auth.types';
import { loginService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginRequest>();
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const onSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginService(data);
      setAuth(response);
      router.push('/dashboard');
    } catch (error) {
      setError('root', { message: 'Invalid credentials or login failed' });
    }
  };

  return (
    <section className="flex flex-col justify-center gap-6 p-4 bg-neutral-800 w-[min(100%,400px)] text-center rounded-md sm:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl text-white">Inicio de sesión</h1>
        <p className="text-gray-300">Inicia sesión con tu cuenta para continuar.</p>
      </header>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 text-left">
        <div>
          <Input 
            label="Email" 
            id="email" 
            type="email" 
            placeholder="Escribe tu email" 
            {...register('email', { required: 'Email is required' })} 
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <Input 
            label="Password" 
            id="password" 
            type="password" 
            placeholder="Escribe tu contraseña" 
            {...register('password', { required: 'Password is required' })} 
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="mb-2 text-sm text-red-500 text-center">{errors.root.message}</p>}
        <Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>
    </section>
  );
};

