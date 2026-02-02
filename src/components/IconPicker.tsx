import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Heart,
  Home,
  Users,
  MessageCircle,
  Star,
  Sparkles,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Leaf,
  TreeDeciduous,
  Bird,
  Baby,
  Smile,
  HandHeart,
  Puzzle,
  Lightbulb,
  BookOpen,
  PenLine,
  Clock,
  Calendar,
  Trophy,
  Target,
  Compass,
  Map,
  Rocket,
  Plane,
  Ship,
  Car,
  Bike,
  Coffee,
  Pizza,
  Apple,
  Cake,
  Gift,
  PartyPopper,
  Music,
  Palette,
  Camera,
  Film,
  Headphones,
  Gamepad2,
  Dumbbell,
  Medal,
  Crown,
  Diamond,
  Gem,
  Coins,
  Wallet,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';

interface IconOption {
  name: string;
  icon: LucideIcon;
}

const iconOptions: IconOption[] = [
  { name: 'Heart', icon: Heart },
  { name: 'Home', icon: Home },
  { name: 'Users', icon: Users },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'Star', icon: Star },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Sun', icon: Sun },
  { name: 'Moon', icon: Moon },
  { name: 'Cloud', icon: Cloud },
  { name: 'Flower2', icon: Flower2 },
  { name: 'Leaf', icon: Leaf },
  { name: 'TreeDeciduous', icon: TreeDeciduous },
  { name: 'Bird', icon: Bird },
  { name: 'Baby', icon: Baby },
  { name: 'Smile', icon: Smile },
  { name: 'HandHeart', icon: HandHeart },
  { name: 'Puzzle', icon: Puzzle },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'PenLine', icon: PenLine },
  { name: 'Clock', icon: Clock },
  { name: 'Calendar', icon: Calendar },
  { name: 'Trophy', icon: Trophy },
  { name: 'Target', icon: Target },
  { name: 'Compass', icon: Compass },
  { name: 'Map', icon: Map },
  { name: 'Rocket', icon: Rocket },
  { name: 'Plane', icon: Plane },
  { name: 'Ship', icon: Ship },
  { name: 'Car', icon: Car },
  { name: 'Bike', icon: Bike },
  { name: 'Coffee', icon: Coffee },
  { name: 'Pizza', icon: Pizza },
  { name: 'Apple', icon: Apple },
  { name: 'Cake', icon: Cake },
  { name: 'Gift', icon: Gift },
  { name: 'PartyPopper', icon: PartyPopper },
  { name: 'Music', icon: Music },
  { name: 'Palette', icon: Palette },
  { name: 'Camera', icon: Camera },
  { name: 'Film', icon: Film },
  { name: 'Headphones', icon: Headphones },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'Medal', icon: Medal },
  { name: 'Crown', icon: Crown },
  { name: 'Diamond', icon: Diamond },
  { name: 'Gem', icon: Gem },
  { name: 'Coins', icon: Coins },
  { name: 'Wallet', icon: Wallet },
  { name: 'ShoppingBag', icon: ShoppingBag },
];

interface IconPickerProps {
  currentIcon?: string;
  onIconChange: (iconName: string) => void;
  iconColor?: string;
}

export default function IconPicker({ currentIcon, onIconChange, iconColor }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredIcons = iconOptions.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  const CurrentIcon = iconOptions.find((opt) => opt.name === currentIcon)?.icon;

  const handleSelect = (iconName: string) => {
    onIconChange(iconName);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onIconChange('');
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          {CurrentIcon ? (
            <CurrentIcon className="h-4 w-4" style={{ color: iconColor || 'currentColor' }} />
          ) : (
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-3"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <Input
            placeholder="Sök ikon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
          <ScrollArea className="h-48">
            <div className="grid grid-cols-6 gap-1">
              {filteredIcons.map((opt) => {
                const Icon = opt.icon;
                const isSelected = currentIcon === opt.name;
                return (
                  <button
                    key={opt.name}
                    onClick={() => handleSelect(opt.name)}
                    className={`p-2 rounded-md hover:bg-muted transition-colors ${
                      isSelected ? 'bg-primary/10 ring-1 ring-primary' : ''
                    }`}
                    title={opt.name}
                  >
                    <Icon className="h-4 w-4 mx-auto" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
          {currentIcon && (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={handleClear}
            >
              Ta bort ikon
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper to get icon component by name
export function getIconByName(name: string): LucideIcon | undefined {
  return iconOptions.find((opt) => opt.name === name)?.icon;
}
