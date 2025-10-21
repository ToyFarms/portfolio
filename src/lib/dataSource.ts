import { TimelineObject } from "@/components/timeline";
import SD from "@/../public/sdn_cibiru_09.png";
import SMP from "@/../public/smp_ykm.jpg";
import SMK from "@/../public/smk_ybm.png";

export const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com/shafarrahman",
    display: "instagram:@shafarrahman",
  },
  {
    name: "Gmail",
    href: "mailto:shafarrahman@gmail.com",
    display: "shafarrahman@gmail.com",
  },
  {
    name: "Github",
    href: "https://github.com/ToyFarms",
    display: "github:ToyFarms",
  },
  {
    name: "Whatsapp",
    href: "https://wa.me/628979994344",
    display: "whatsapp:08979994344",
  },
];

export const timelineObjects: TimelineObject[] = [
  {
    image: SD.src,
    fromDate: "2015",
    toDate: "2021",
    title: "SD Negeri Cibiru 09",
    loc: "No Jl. Pendidikan No.12, Cibiru Hilir, Kec. Cileunyi, Kabupaten Bandung, Jawa Barat 40626",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2424.2246230964934!2d107.72093898448027!3d-6.940580446713439!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c3215962905b%3A0x62e3d31105701123!2sSD%20Cibiru%2009!5e0!3m2!1sen!2sid!4v1760325125427!5m2!1sen!2sid",
  },
  {
    image: SMP.src,
    fromDate: "2021",
    toDate: "2024",
    title: "SMP YKM Tanjungsari",
    loc: "Jl. Raya Tanjungsari No.396, Gudang, Kec. Tanjungsari, Kabupaten Sumedang, Jawa Barat 45362",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9487434162324!2d107.80701377598417!3d-6.896734393102452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68db1e381217cb%3A0xcde593c9466a0e3e!2sSMP%20Ykm!5e0!3m2!1sen!2sid!4v1760308054759!5m2!1sen!2sid",
  },
  {
    image: SMK.src,
    fromDate: "2024",
    toDate: "Now",
    title: "SMP YBM Tanjungsari",
    loc: "Jl. Kutamandiri No.9, Kutamandiri, Kec. Tanjungsari, Kabupaten Sumedang, Jawa Barat 45362",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.8780159629296!2d107.79299507598415!3d-6.9051875930941575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68db39f5d77063%3A0xcd7bf1a395871346!2sSMK%20Budi%20Mandiri!5e0!3m2!1sen!2sid!4v1760305144658!5m2!1sen!2sid",
  },
];

export interface ProjectType {
  title: string;
  url: string;
  description: string;
  imageKey: string;
  technologies: string[];
}

export const projects: ProjectType[] = [
  {
    title: "aplayer",
    url: "https://github.com/ToyFarms/aplayer",
    description: "Cross platform music player using TUI written purely in C",
    imageKey: "project,aplayer",
    technologies: ["C", "FFmpeg"],
  },
  {
    title: "youtube-tui",
    url: "https://github.com/ToyFarms/youtube-tui",
    description:
      "TUI application to interface with youtube with thumbnail view, and audio player",
    imageKey: "project,youtube-tui",
    technologies: ["Python"],
  },
  {
    title: "GTProxy",
    url: "https://github.com/ToyFarms/GTProxy",
    description:
      "Reverse proxy with packet sniffing, modification, fabrication for the game Growtopia",
    imageKey: "project,gtproxy",
    technologies: ["C++", "Enet"],
  },
  {
    title: "gtworld",
    url: "https://github.com/ToyFarms/gtworld",
    description: "World rendering engine for the game Growtopia",
    imageKey: "project,gtworld",
    technologies: ["Python"],
  },
  {
    title: "gtnote",
    url: "https://github.com/ToyFarms/gtnote",
    description: "Note simulation for the game Growtopia",
    imageKey: "project,gtnote",
    technologies: ["C", "FFmpeg", "Raylib"],
  },
  {
    title: "VKBD",
    url: "",
    description:
      "Custom keyboard and mouse driver for windows with userspace hook built for external botting",
    imageKey: "project,vkbd",
    technologies: ["C++", "WDK", "ImGui"],
  },
  {
    title: "spotify-dl",
    url: "https://github.com/ToyFarms/spotify-dl",
    description:
      "Custom built Spotify client written from scratch to download music and bypass Spotify DRM",
    imageKey: "project,spotify-dl",
    technologies: ["Python", "Socket", "ProtoBuf"],
  },
  {
    title: "spotify-sync",
    url: "https://github.com/ToyFarms/spotify-sync",
    description: "Tool to sync local playlist with Spotify playlist",
    imageKey: "project,spotify-sync",
    technologies: ["Python", "Flask"],
  },
  {
    title: "ig-mapper",
    url: "https://github.com/ToyFarms/ig-mapper",
    description: "Map your social network from Instagram followers",
    imageKey: "project,ig-mapper",
    technologies: ["Python"],
  },
  {
    title: "Youtube-Storage",
    url: "https://github.com/ToyFarms/Youtube_Storage",
    description: "Tool to convert arbitrary data into encodable video",
    imageKey: "project,youtube-storage",
    technologies: ["Python"],
  },
  {
    title: "CLI",
    url: "https://github.com/ToyFarms/CLI",
    description: "Unix tools written in python for Windows",
    imageKey: "project,cli",
    technologies: ["Python"],
  },
];
