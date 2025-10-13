import { auth } from "@/lib/auth";
import HeaderClient from "./header-client";

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

  return <HeaderClient session={session} links={links} socials={socials} />;
}
