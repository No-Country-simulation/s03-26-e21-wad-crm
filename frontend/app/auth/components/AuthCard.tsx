import { ReactNode } from "@node_modules/@types/react";
import { GoogleIcon } from "@src/components/icons/Google";
import { Button } from "@src/components/ui/Button";
import { Separator } from "@src/components/ui/Separator";

interface Props {
  className: string;
  header: {
    title: string;
    description: string;
    googleActionLabel: string;
  };
  separatorText: string;
  children: ReactNode;
  footer: {
    text: string;
    actionLabel: string;
  };
  toggleMode: () => void;
}

export const AuthCard = ({ className, header, separatorText, toggleMode, children, footer }: Props) => {
  return (
    <article
      className={`bg-glass p-8 text-center w-[min(100%,500px)] flex flex-col gap-8 rounded-lg transition-all duration-500 ${className}`}
    >
      <header className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">{header.title}</h2>
        <p>{header.description}</p>
        <Button variant="secondary">
          <GoogleIcon className="w-6 h-6" />
          {header.googleActionLabel}
        </Button>
      </header>
      <Separator text={separatorText} />
      {children}
      <footer>
        <p>
          {footer.text}
          <button className="font-medium hover:underline" onClick={toggleMode}>
            {footer.actionLabel}
          </button>
        </p>
      </footer>
    </article>
  );
};
