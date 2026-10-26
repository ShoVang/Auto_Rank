export type ScreenName = "home" | "vehicles" | "compare";

type SiteNavProps = {
  current: ScreenName;
  onNavigate: (screen: ScreenName) => void;
};

const links: { id: ScreenName; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "vehicles", label: "Vehicles" },
];

export function SiteNav({ current, onNavigate }: SiteNavProps) {
  return (
    <nav className="site-nav">
      {links.map((link) => (
        <button
          key={link.id}
          type="button"
          className={link.id === current ? "nav-current" : undefined}
          onClick={() => onNavigate(link.id)}
        >
          {link.label}
        </button>
      ))}
    </nav>
  );
}
