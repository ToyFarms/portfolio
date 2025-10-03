import { auth } from "@/lib/auth";
import Profile from "./profile";

export default async function Header() {
  const contStyle = "flex flex-col";
  const labelStyle = "text-gray-500 text-[0.7rem] leading-none";
  const pStyle = "text-[1rem] uppercase font-[450]";
  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "About",
      href: "/about",
    },
    {
      name: "Contact",
      href: "/contact",
    },
  ];
  const session = await auth();
  if (session) {
    links.push({ name: "Profile", href: "/profile" });
    if (session.user.role === "admin") {
      links.push({ name: "Dashboard", href: "/dashboard" });
    }
  } else {
    links.push({ name: "Login", href: "/login" });
  }

  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com/shafarrahman",
    },
    {
      name: "Github",
      href: "https://github.com/ToyFarms",
    },
    {
      name: "Whatsapp",
      href: "https://wa.me/628979994344",
    },
  ];

  return (
    <div className="mb-12">
      <div className="flex justify-between mb-7">
        <div className={contStyle}>
          <p className={labelStyle}>Name</p>
          <p className={pStyle}>Diandra Shafar Rahman</p>
        </div>
        <div className={contStyle}>
          <p className={labelStyle}>Status</p>
          <p className={pStyle}>Student</p>
        </div>
        <div className={contStyle}>
          <p className={labelStyle}>Navigation</p>
          <ol className="flex max-w-64 flex-wrap gap-x-1">
            {links.map((l, i) => (
              <li key={l.name}>
                <a className={pStyle} href={l.href}>
                  {l.name}
                </a>
                <span>{i !== links.length - 1 && ","}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={contStyle}>
          <p className={labelStyle}>My Social</p>
          <ol className="flex max-w-64 flex-wrap gap-x-1">
            {socials.map((l, i) => (
              <li key={l.name}>
                <a className={pStyle} href={l.href} target="_blank">
                  {l.name}
                </a>
                <span>{i !== socials.length - 1 && ", "}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className={contStyle}>
          <p className={labelStyle}>Profile</p>
          <Profile />
        </div>
      </div>
      <hr />
    </div>
  );
}
