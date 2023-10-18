export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Walk-in Watcher",
  description:
    "Walk-in case manager for the Cal Poly ITS Service Desk.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Form",
      href: "/form",
    },
    {
      title: "Config",
      href: "/config"
    }
  ],
  links: {
    github: "https://github.com/shadcn/ui",
  },
}
