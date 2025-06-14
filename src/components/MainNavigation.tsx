
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, Database, Search, Home, Building } from "lucide-react";

const MainNavigation = () => {
  const location = useLocation();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      description: "Overview of all projects and payments"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Charts and financial insights"
    },
    {
      title: "Clients",
      href: "/clients",
      icon: Users,
      description: "Client summary and management"
    },
    {
      title: "Search",
      href: "/search",
      icon: Search,
      description: "Advanced search and filtering"
    },
    {
      title: "Backup",
      href: "/backup",
      icon: Database,
      description: "Data backup and security settings"
    }
  ];

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Building className="h-4 w-4 mr-2" />
            Navigation
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-4 w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {navigationItems.map((item) => (
                <NavigationMenuLink key={item.href} asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700 focus:text-slate-900 dark:focus:text-slate-100",
                      location.pathname === item.href && "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <div className="text-sm font-medium leading-none">{item.title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
