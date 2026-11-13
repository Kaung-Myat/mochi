import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Mochi — နူးညံ့တဲ့ သူငယ်ချင်းလေး",
    short_name: "Mochi",
    description:
      "ရေသောက်ချိန်၊ စားချိန်နဲ့ အိပ်ချိန်ကို နူးညံ့စွာ သတိပေးပေးမယ့် ကိုယ်ပိုင် app လေး။",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f4dfd4",
    theme_color: "#f4dfd4",
    orientation: "portrait-primary",
    lang: "my",
    categories: ["lifestyle", "health"],
    icons: [
      {
        src: "/icons/mochi-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/mochi-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/mochi-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
