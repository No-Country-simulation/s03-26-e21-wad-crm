import Image from "@node_modules/next/image";
import { ChatIcon } from "../icons/Chat";
import { DashboardIcon } from "../icons/Dashboard";
import { PeopleIcon } from "../icons/People";
import { TaskIcon } from "../icons/Task";

const navigation = [
  {
    href: "#",
    icon: DashboardIcon,
  },

  {
    href: "#",
    icon: TaskIcon,
  },
  {
    href: "#",
    icon: ChatIcon,
  },
  {
    href: "#",
    icon: PeopleIcon,
  },
];

export const Sidebar = () => {
  return (
    <aside className="col-start-1 row-span-3 bg-neutral-900 z-10">
      <nav className="sticky top-0 left-0 flex flex-col justify-between items-center gap-8 h-screen p-2 overflow-y-auto scroll border-r border-neutral-800">
        <a href="/dashboard" className="">
          <Image src="/favicon.png" alt="Logo" width={36} height={36} className="w-9 h-9 object-contain" />
        </a>
        <ul className="flex flex-col items-center gap-2">
          {navigation.map(({ href, icon: Icon }, index) => (
            <li key={index}>
              <a href={href} className="flex p-2 bg-neutral-800 rounded-full">
                <Icon className="w-5 h-5" />
              </a>
            </li>
          ))}
        </ul>
        <div></div>
      </nav>
    </aside>
  );
};
