'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { auth } from '@/auth'

// ...
export async function createHabit(data: { title: string; description?: string; icon?: string; color?: string }) {
    console.log('createHabit called')
    const session = await auth()
    if (!session?.user?.id) {
        console.log('createHabit: Unauthorized')
        return { success: false, error: 'Unauthorized' }
    }

    try {
        const habit = await prisma.habit.create({
            data: {
                title: data.title,
                description: data.description,
                icon: data.icon,
                color: data.color,
                userId: session.user.id
            }
        })
        revalidatePath('/tracker')
        return { success: true, habit }
    } catch (error) {
        console.error('Failed to create habit:', error)
        return { success: false, error: 'Failed to create habit' }
    }
}

export async function deleteHabit(habitId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        // Ensure user owns the habit
        const count = await prisma.habit.count({
            where: { id: habitId, userId: session.user.id }
        })
        if (count === 0) return { success: false, error: 'Habit not found or unauthorized' }

        await prisma.habit.delete({
            where: { id: habitId }
        })
        revalidatePath('/tracker')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete habit:', error)
        return { success: false, error: 'Failed to delete habit' }
    }
}

export async function toggleHabitLog(habitId: string, date: Date) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        // Verify ownership
        const habit = await prisma.habit.findUnique({
            where: { id: habitId },
            select: { userId: true }
        })
        if (!habit || habit.userId !== session.user.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const existingLog = await prisma.habitLog.findUnique({
            where: {
                habitId_date: {
                    habitId,
                    date
                }
            }
        })

        if (existingLog) {
            await prisma.habitLog.delete({
                where: { id: existingLog.id }
            })
        } else {
            await prisma.habitLog.create({
                data: {
                    habitId,
                    date,
                    completed: true
                }
            })
        }
        revalidatePath('/tracker')
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle habit log:', error)
        return { success: false, error: 'Failed to toggle habit log' }
    }
}

export async function getHabitsWithLogs(range: 'week' | 'month', currentDate: Date) {
    console.log('getHabitsWithLogs started', { range, currentDate })
    try {
        const session = await auth()
        console.log('getHabitsWithLogs session:', session?.user?.id)
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

        let start: Date, end: Date

        if (range === 'week') {
            start = startOfWeek(currentDate)
            end = endOfWeek(currentDate)
        } else {
            start = startOfMonth(currentDate)
            end = endOfMonth(currentDate)
        }

        const habits = await prisma.habit.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                logs: {
                    where: {
                        date: {
                            gte: start,
                            lte: end
                        }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Serialize dates to pass to client component safely
        const serializedHabits = habits.map(habit => ({
            ...habit,
            createdAt: habit.createdAt.toISOString(),
            logs: habit.logs.map(log => ({
                ...log,
                date: log.date.toISOString() // Serialize date
            }))
        }))

        console.log('getHabitsWithLogs success, count:', habits.length)
        return { success: true, habits: serializedHabits }
    } catch (error) {
        console.error('Failed to fetch habits CRITICAL:', error)
        return { success: false, error: 'Failed to fetch habits' }
    }
}

export async function updateHabit(habitId: string, data: { title: string; description?: string }) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        const count = await prisma.habit.count({
            where: { id: habitId, userId: session.user.id }
        })
        if (count === 0) return { success: false, error: 'Habit not found' }

        const habit = await prisma.habit.update({
            where: { id: habitId },
            data: {
                title: data.title,
                description: data.description
            }
        })
        revalidatePath('/tracker')
        return { success: true, habit }
    } catch (error) {
        console.error('Failed to update habit:', error)
        return { success: false, error: 'Failed to update habit' }
    }
}
