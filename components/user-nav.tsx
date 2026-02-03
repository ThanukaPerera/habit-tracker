'use client'

import { signOutAction } from '@/app/actions/signout'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function UserNav() {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                </div>
            </div>
            <form action={signOutAction}>
                <Button variant="outline" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                </Button>
            </form>
        </div>
    )
}
