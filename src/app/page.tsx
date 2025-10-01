import Image from "next/image";
import Me from "@/../public/me.png";

export default async function HomePage() {
  return (
    <div>
      <hr className="pb-10" />
      <div className="text-[3rem] leading-none font-[450] indent-12">
        <p>My name is Diandra Shafar Rahman.</p>
        <span>
          I'm a <span className="text-primary">Fullstack Developer</span> based
          in Sumedang, Indonesia
        </span>
      </div>

      <button className="mt-10 text-[1.3rem] border w-fit px-2 rounded-xl">
        <a href="mailto:shafarrahman@gmail.com">shafarrahman@gmail.com</a>
      </button>
    </div>
  );
}
