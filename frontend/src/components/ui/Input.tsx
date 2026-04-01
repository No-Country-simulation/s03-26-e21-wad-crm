import type { ComponentProps } from "react";

interface Props extends ComponentProps<"input"> {
  label: string;
  id: string;
}

export const Input = ({ label, id, ...rest }: Props) => {
  return (
    <div className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-start font-semibold">
        {label}
      </label>
      <input id={id} className="p-2 border border-neutral-50 rounded-sm focus:outline-none" placeholder="" {...rest} />
    </div>
  );
};
