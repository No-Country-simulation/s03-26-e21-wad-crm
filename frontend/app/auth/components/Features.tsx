import Image from "@node_modules/next/image";

export const Features = () => {
  return (
    <section className="flex-1 flex flex-col font-light justify-center items-center gap-4 ">
      <Image src="/logo.png" alt="Logo" width={200} height={100} className="w-full h-auto object-contain" />
    </section>
  );
};
