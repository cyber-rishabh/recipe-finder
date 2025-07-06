"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChefHat, PlusCircle, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-headline font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Culinary Delights
          </span>
        </Link>
        
        <nav className="flex items-center gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90 text-white">
            <Link href="/add-recipe">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Recipe
            </Link>
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">My Account</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
