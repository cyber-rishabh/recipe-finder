"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChefHat, PlusCircle } from "lucide-react";
import { useState } from "react";

export function Header() {
  // Mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary">
          <ChefHat className="h-8 w-8" />
          Recipe Hub
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/add-recipe">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Recipe
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="sm:hidden">
                <Link href="/add-recipe">
                  <PlusCircle className="h-5 w-5" />
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://placehold.co/100x100" alt="User" data-ai-hint="user avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        user@example.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsAuthenticated(false)}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
