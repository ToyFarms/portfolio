import { auth } from "@/lib/auth";
import HeaderClient from "./header-client";
import { socials } from "@/lib/dataSource";

export default async function Header() {
  const links = [
    {
      name: "Home",
      href: "/",
    },
    {
      name: "About",
      href: "/about",
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

  return <HeaderClient session={session} links={links} socials={socials} />;
}
