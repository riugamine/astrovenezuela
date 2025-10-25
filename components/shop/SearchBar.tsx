'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const router = useRouter();

  // Handle keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Focus on search input or open mobile sheet
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          setIsMobileSheetOpen(true);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsMobileSheetOpen(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <form onSubmit={handleSearch} className={`hidden lg:flex items-center gap-2 ${className}`}>
        <div className="relative">
          <Input
            id="search-input"
            type="text"
            placeholder="Buscar por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64 pr-10 text-foreground dark:text-white"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={clearSearch}
            >
              <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button type="submit" size="icon" variant="ghost">
          <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
        </Button>
      </form>

      {/* Mobile Search Button */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon">
            <FontAwesomeIcon icon={faSearch} className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="h-auto">
          <SheetHeader>
            <SheetTitle>Buscar productos</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pr-10 text-foreground dark:text-white"
                autoFocus
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={clearSearch}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button type="submit" className="w-full mt-4">
              <FontAwesomeIcon icon={faSearch} className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
