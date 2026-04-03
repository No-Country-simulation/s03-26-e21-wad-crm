import Image from "@node_modules/next/image";

export const Features = () => {
  return (
    <section className="flex-1 flex flex-col justify-center items-center p-8 bg-red-50">
      <Image
        src="/images/bg.jpeg"
        alt="Logo"
        width={1200}
        height={500}
        loading="eager"
        className="w-full h-full object-cover rounded-3xl"
      />
    </section>
  );
};
