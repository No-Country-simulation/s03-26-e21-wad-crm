import Image from "@node_modules/next/image";

export const Features = () => {
  return (
    <section className="flex-2 flex flex-col font-light justify-center items-center p-8">
      <Image
        src="/logo.png"
        alt="Logo"
        width={200}
        height={100}
        loading="eager"
        className="w-[min(100%,700px)] h-auto object-contain"
      />
    </section>
  );
};
