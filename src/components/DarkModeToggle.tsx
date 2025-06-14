
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="relative bg-[#F5F7FA] dark:bg-slate-800 text-[#0A2C56] dark:text-slate-300 hover:bg-[#E3E8EF] dark:hover:bg-slate-700 border border-[#E3E8EF] dark:border-slate-700 shadow-sm"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default DarkModeToggle;
