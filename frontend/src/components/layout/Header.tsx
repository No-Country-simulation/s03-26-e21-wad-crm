import Image from "@node_modules/next/image";
import { SearchIcon } from "../icons/Search";
import { NotificationIcon } from "../icons/Notification";

const actions = [
  {
    icon: SearchIcon,
  },
  {
    icon: NotificationIcon,
  },
];

export const Header = () => {
  return (
    <header className="sticky top-0 col-start-2 row-start-1 flex items-center justify-end gap-8 py-2 px-4 bg-neutral-900 border-b border-neutral-800 z-10">
      <ul className="flex items-center gap-2">
        {actions.map(({ icon: Icon }, index) => (
          <li key={index} className="flex">
            <button className="p-2 bg-neutral-800 rounded-full">
              <Icon className="w-5 h-5" />
            </button>
          </li>
        ))}
        <li className="flex">
          <button>
            <Image
              src="/images/avatar.png"
              alt="Avatar"
              width={36}
              height={36}
              loading="eager"
              className="rounded-full object-cover"
            />
          </button>
        </li>
      </ul>
    </header>
  );
};
