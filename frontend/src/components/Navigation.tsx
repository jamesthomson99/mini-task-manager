'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart3, Home, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavigationProps {
    onLogout: () => void;
}

export function Navigation({ onLogout }: NavigationProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        {
            name: 'Home',
            href: '/',
            icon: Home,
            isActive: pathname === '/'
        },
        {
            name: 'Stats',
            href: '/stats',
            icon: BarChart3,
            isActive: pathname === '/stats'
        }
    ];

    const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
        const Icon = item.icon;
        return (
            <Link href={item.href}>
                <Button
                    variant={item.isActive ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                </Button>
            </Link>
        );
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <h1 className="text-xl font-semibold text-gray-900">Task Manager</h1>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <nav className="flex items-center space-x-2">
                            {navigationItems.map((item) => (
                                <NavItem key={item.href} item={item} />
                            ))}
                        </nav>

                        <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                            <span className="text-sm text-gray-600">
                                Welcome, {user?.username}!
                            </span>
                            <Button variant="outline" size="sm" onClick={onLogout}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                            {user?.username}
                        </span>

                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Menu className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-64 px-6 pt-12">
                                <div className="flex flex-col space-y-4">
                                    {/* Navigation Items */}
                                    <nav className="flex flex-col space-y-2">
                                        {navigationItems.map((item) => (
                                            <NavItem key={item.href} item={item} />
                                        ))}
                                    </nav>

                                    <div className="pt-4 border-t border-gray-200">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                onLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full justify-start"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}
