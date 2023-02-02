import cx from "classnames";
import { hsla } from "@lib/utils";
import { useEffect, useState } from "react";

type NavProps = {
  modules: Module[];
  initialPath: string;
  bgColor: string;
};

const Nav = ({ modules, initialPath, bgColor }: NavProps) => {
  const [activePath, setActivePath] = useState(initialPath);

  useEffect(() => {
    if (window) {
      (window as any).swup.on("contentReplaced", () => {
        setActivePath(window.location.pathname);
      });
    }
  }, []);

  return (
    <nav
      className="z-30 fixed md:relative shadow-[0_0_8px_#0005,0_0_2px_#000a] bottom-0 inset-x-0 pt-1 md:pt-0 md:pr-1 md:h-auto backdrop-blur-sm flex md:flex-col items-center justify-center text-white uppercase tracking-widest text-xs font-bold overflow-auto"
      style={{
        backgroundColor: bgColor || "#333",
        backgroundImage:
          "linear-gradient(to right, hsla(0, 100%, 0%, 0.1), #0000 40%, #0000 60% ,hsla(0, 100%, 100%, 0.05))",
      }}
    >
      <div className="absolute z-0 inset-0 shadow-[inset_0_2px_0_#fff3] md:shadow-[inset_2px_0_0_#fff3,inset_-2px_0_0_#fff3]"></div>
      <ul
        className="relative z-10 contents"
        role="navigation"
        aria-label="Main"
      >
        {modules.map(({ path, name, color }) => (
          <NavItem key={path} activePath={activePath} href={path} color={color}>
            {name}
          </NavItem>
        ))}
      </ul>
    </nav>
  );
};

const NavItem = ({
  activePath,
  href,
  color,
  children,
}: {
  activePath: string | undefined;
  href: string;
  color: number;
  children: any;
}) => {
  const activeClass = `md:-ml-[2px]`;
  const isActive = activePath === href;

  return (
    <li className="relative list-none h-full md:w-full md:h-auto md:py-0.5 py-0 px-0.5 md:px-0 group">
      <a
        className={cx(
          `relative py-4 px-4 md:px-4 h-full md:mx-0 cursor-pointer flex items-center justify-center focus:bg-white/10 group-hover:bg-white/10 rounded-[0.5rem_0.5rem_0_0] md:rounded-[0_0.5rem_0.5rem_0] `,
          { [activeClass]: isActive }
        )}
        style={isActive ? { backgroundColor: hsla(color) } : {}}
        href={href}
        tabIndex={0}
      >
        <span
          className="link-span drop-shadow-[0_1px_0_#000] border-b border-solid whitespace-nowrap"
          style={isActive ? {} : { borderColor: hsla(color) }}
          data-style-active
        >
          {children}
        </span>
      </a>
    </li>
  );
};

export default Nav;
