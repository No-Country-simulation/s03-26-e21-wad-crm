type Props = {
  text?: string;
};

export const Separator = ({ text }: Props) => {
  return (
    <div className="relative flex items-center justify-center gap-2 w-full">
      <div className="flex-1 bg-neutral-50 h-px w-full"></div>
      <p className="text-neutral-50 text-sm">{text}</p>
      <div className="flex-1 bg-neutral-50 h-px w-full"></div>
    </div>
  );
};
