import { HomeIcon, RocketLaunchIcon } from "@heroicons/react/20/solid";

export const menu = [
  {
    title: "Home",
    href: "/",
    icon: <HomeIcon />,
    exact: true,
  },
  {
    title: "Getting started",
    href: "/getting-started",
    icon: <RocketLaunchIcon />,
  },
  {
    title: "Components",
    submenus: [
      {
        title: "Core",
      },
      {
        title: "Button",
        href: "/button",
      },
      //
      {
        title: "Input",
      },
      {
        title: "Input",
        href: "/input",
      },
      {
        title: "Autocomplete",
        href: "/autocomplete",
      },
      {
        title: "Checkbox",
        href: "/checkbox",
      },
      {
        title: "Image input",
        href: "/image-input",
      },
      {
        title: "Date input",
        href: "/date-input",
      },
      {
        title: "File select",
        href: "/file-select",
      },
      {
        title: "Multi select",
        href: "/multi-select",
      },
      {
        title: "Switch",
        href: "/switch",
      },
      {
        title: "Textarea",
        href: "/textarea",
      },
      //
      {
        title: "Feedback",
      },
      {
        title: "Alert",
        href: "/alert",
      },
      {
        title: "Loading",
        href: "/loading",
      },
      {
        title: "Error boundary",
        href: "/error-boundary",
      },
      {
        title: "Notifications",
        href: "/notifications",
      },
      //
      {
        title: "Navigation",
      },
      {
        title: "Breadcrumbs",
        href: "/breadcrumbs",
      },
      {
        title: "Pagination",
        href: "/pagination",
      },
      //
      {
        title: "Data display",
      },
      {
        title: "Badge",
        href: "/badge",
      },
      {
        title: "Data table",
        href: "/data-table",
      },
      //
      {
        title: "Layout",
      },
      {
        title: "Carousel",
        href: "/carousel",
      },
      {
        title: "Confirmation button",
        href: "/confirmation-button",
      },
      {
        title: "Grid pattern",
        href: "/grid-pattern",
      },
      {
        title: "Menu",
        href: "/menu",
      },
      {
        title: "Modal",
        href: "/modal",
      },
      {
        title: "Spotlight",
        href: "/spotlight",
      },
      {
        title: "Tooltip",
        href: "/tooltip",
      },
      //
      {
        title: "Typography",
      },
      {
        title: "Code",
        href: "/code",
      },
      {
        title: "Markdown",
        href: "/markdown",
      },
      {
        title: "Text",
        href: "/text",
        exact: true,
      },
      {
        title: "Table",
        href: "/table",
      },
    ],
  },
  {
    title: "Examples",
    submenus: [
      {
        title: "Form",
        href: "/form",
      },
      {
        title: "Big scroll",
        href: "/big-scroll",
      },
    ],
  },
];
