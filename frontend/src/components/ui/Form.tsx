import { ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
}

export const Form = ({ className, children }: Props) => {
  return <form className={`flex flex-col gap-4 ${className || ""}`}>{children}</form>;
};
