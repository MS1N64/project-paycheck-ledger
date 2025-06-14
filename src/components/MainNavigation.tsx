
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Users, Database, Search, Home, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const MainNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

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

  const NavigationLinks = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="grid gap-3 p-4">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onItemClick}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#F5F7FA] dark:hover:bg-slate-700 hover:text-[#0A2C56] dark:hover:text-slate-100 focus:bg-[#F5F7FA] dark:focus:bg-slate-700 focus:text-[#0A2C56] dark:focus:text-slate-100",
            location.pathname === item.href && "bg-[#F5F7FA] dark:bg-slate-700 text-[#0A2C56] dark:text-slate-100"
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
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden bg-[#F5F7FA] border-[#F5F7FA] text-[#0A2C56] hover:bg-[#F5F7FA]/80">
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png"
                alt="Dass & Sons Ltd"
                className="h-5 w-5 object-contain"
              />
              Navigation
            </SheetTitle>
            <SheetDescription>
              Navigate to different sections of your project dashboard
            </SheetDescription>
          </SheetHeader>
          <NavigationLinks onItemClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-[#F5F7FA] dark:bg-slate-800 text-[#0A2C56] dark:text-slate-300 hover:bg-[#F5F7FA]/80">
            <img 
              src="/lovable-uploads/66268146-2321-41b8-880e-efc8cb74bbfb.png"
              alt="Dass & Sons Ltd"
              className="h-4 w-4 mr-2 object-contain"
            />
            Navigation
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[400px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <NavigationLinks />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default MainNavigation;
