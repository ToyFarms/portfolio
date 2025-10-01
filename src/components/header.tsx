export default function Header() {
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
  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com/shafarrahman",
    },
  ];

  return (
    <div className="flex justify-between mb-7">
      <div className={contStyle}>
        <p className={labelStyle}>Name</p>
        <p className={pStyle}>Diandra Shafar Rahman</p>
      </div>
      <div className={contStyle}>
        <p className={labelStyle}>Status</p>
        <p className={pStyle}>Hireable</p>
      </div>
      <div className={contStyle}>
        <p className={labelStyle}>Navigation</p>
        <ol className="flex">
          {links.map((l, i) => (
            <li key={l.name}>
              {i !== 0 && ", "}
              <a className={pStyle} href={l.href}>
                {l.name}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className={contStyle}>
        <p className={labelStyle}>My Social</p>
        <ol className="flex">
          {socials.map((l, i) => (
            <li key={l.name}>
              {i !== 0 && ", "}
              <a className={pStyle} href={l.href}>
                {l.name}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
