'use client'

import { useActionState, useEffect } from 'react'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function RegisterPage() {
    const router = useRouter()
    const [errorMessage, dispatch, isPending] = useActionState<string | null | undefined, FormData>(
        register,
        undefined,
    )

    useEffect(() => {
        if (errorMessage === null) {
            toast.success('Account created! Please log in.')
            router.push('/login')
        }
    }, [errorMessage, router])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-950">
            <Card className="w-full max-w-md">
                <div className="p-6 pb-2">
                    <h2 className="text-2xl font-bold">Create Account</h2>
                    <p className="text-sm text-muted-foreground">Sign up to start tracking your habits</p>
                </div>
                <form action={dispatch}>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" minLength={6} required />
                        </div>
                        {errorMessage && (
                            <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                        )}
                    </div>
                    <div className="p-6 pt-0">
                        <Button className="w-full" aria-disabled={isPending} disabled={isPending}>
                            {isPending ? 'Creating account...' : 'Sign Up'}
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="underline">
                                Log in
                            </Link>
                        </div>
                    </div>
                </form>
            </Card>
        </div>
    )
}
