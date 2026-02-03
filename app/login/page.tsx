'use client'

import { useActionState } from 'react'
import { authenticate } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    )

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <Card className="w-full max-w-md">
                <div className="p-6 pb-2">
                    <h2 className="text-2xl font-bold">Login</h2>
                    <p className="text-sm text-muted-foreground">Enter your credentials to access your tracker</p>
                </div>
                <form action={dispatch}>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" required />
                        </div>
                        {errorMessage && (
                            <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                        )}
                    </div>
                    <div className="p-6 pt-0">
                        <Button className="w-full" aria-disabled={isPending} disabled={isPending}>
                            {isPending ? 'Logging in...' : 'Log in'}
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    )
}
