import Image from "@node_modules/next/image";

export default function LoginPage() {
  return (
    <section className="grid grid-cols-5 grid-rows-2 gap-4 bg-neutral-800 rounded-2xl p-8 w-full">
      <article className="flex rounded-2xl col-span-3 row-span-2 bg-glass-light"></article>
      <article className="flex rounded-2xl col-span-2 bg-glass-light"></article>
      <article className="flex rounded-2xl bg-glass-light"></article>
      <article className="flex rounded-2xl bg-glass-light"></article>
    </section>
  );
}
