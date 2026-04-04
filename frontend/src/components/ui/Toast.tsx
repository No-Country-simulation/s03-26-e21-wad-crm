import Image from "@node_modules/next/image";
import { getYear } from "../../utils/dates";

interface Props {
  title: string;
  description: string;
  date: Date;
  className?: string;
}

export const Toast = ({ title, description, date, className }: Props) => {
  const formattedTimeValue = getYear(date);

  return (
    <article className={`flex gap-4 p-4 border-b-2 rounded-lg bg-glass-light ${className}`}>
      <figure className="min-w-12">
        <Image
          src="/images/avatar.png"
          alt="Avatar"
          width={48}
          height={48}
          loading="eager"
          className="rounded-full object-cover"
        />
      </figure>
      <div className="flex flex-col gap-1">
        <header className="flex items-center justify-between flex-wrap gap-x-4">
          <h3 className="font-semibold">{title}</h3>
          <time dateTime={date.toISOString()} className="text-xs">
            {formattedTimeValue}
          </time>
        </header>
        <p className="text-sm text-gray-300 max-w-[30ch]">{description}</p>
      </div>
    </article>
  );
};
