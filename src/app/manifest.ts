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
    background_color: "#fffaf3",
    theme_color: "#fffaf3",
    orientation: "portrait-primary",
    lang: "my",
    categories: ["lifestyle", "health"],
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
