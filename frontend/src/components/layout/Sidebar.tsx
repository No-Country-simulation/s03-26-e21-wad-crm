import { HomeIcon } from "../icons/Home";
import { MenuIcon } from "../icons/Menu";
import { PeopleIcon } from "../icons/People";
import { TaskIcon } from "../icons/Task";

const navigation = [
  {
    href: "#",
    icon: HomeIcon,
  },
  {
    href: "#",
    icon: PeopleIcon,
  },
  {
    href: "#",
    icon: TaskIcon,
  },
  {
    href: "#",
    icon: PeopleIcon,
  },
];

export const Sidebar = () => {
  return (
    <aside className="col-start-1 row-span-3 bg-neutral-900 z-10">
      <nav className="sticky top-0 left-0 flex flex-col justify-between items-center gap-8 h-screen p-4 overflow-y-auto scroll">
        <a href="/dashboard" className="p-2">
          <MenuIcon className="w-6 h-6" />
        </a>
        <ul className="flex flex-col items-center gap-2">
          {navigation.map(({ href, icon: Icon }, index) => (
            <li key={index}>
              <a href={href} className="flex p-2 bg-neutral-800 rounded-full">
                <Icon className="w-6 h-6" />
              </a>
            </li>
          ))}
        </ul>
        <div></div>
      </nav>
    </aside>
  );
};
