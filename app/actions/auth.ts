'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        console.log('Authenticating user...', formData.get('email'))
        await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/tracker'
        })
        return undefined
    } catch (error: any) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        console.error('Authentication Error:', error)
        throw error
    }
}

export async function register(
    prevState: string | null | undefined,
    formData: FormData
) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (!email || !password || password.length < 6) {
        return 'Invalid input.'
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return 'User already exists.'
        }

        const hashedPassword = await hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'USER'
            },
        })

        // Auto login after register is a bit complex with server actions redirect, 
        // so we'll just indicate success for now or try to sign in.
        // For simplicity, we'll return null (no error) and let the UI redirect to login
        return null
    } catch (error) {
        console.error('Registration failed:', error)
        return 'Failed to register.'
    }
}
