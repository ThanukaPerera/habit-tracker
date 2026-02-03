'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import { toggleHabitLog } from '@/app/actions/habit'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EditHabitDialog } from './edit-dialog'

type HabitWithLogs = {
    id: string
    title: string
    icon?: string | null
    color?: string | null
    logs: { date: Date; completed: boolean }[]
}

export function WeekView({
    habits,
    currentDate,
    onDateChange
}: {
    habits: HabitWithLogs[]
    currentDate: Date
    onDateChange: (date: Date) => void
}) {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i))

    const handleToggle = async (habitId: string, date: Date) => {
        try {
            await toggleHabitLog(habitId, date)
            toast.success('Habit updated')
        } catch {
            toast.error('Failed to update habit')
        }
    }

    const isCompleted = (habit: HabitWithLogs, date: Date) => {
        return habit.logs.some(log => isSameDay(new Date(log.date), date) && log.completed)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    Week of {format(startDate, 'MMM d, yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => onDateChange(addDays(currentDate, -7))}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDateChange(addDays(currentDate, 7))}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[200px_repeat(7,1fr)] bg-muted/50 border-b">
                    <div className="p-4 font-medium">Habit</div>
                    {weekDays.map(day => (
                        <div key={day.toString()} className="p-4 text-center font-medium border-l">
                            <div className="text-sm text-muted-foreground">{format(day, 'EEE')}</div>
                            <div className={cn("text-lg", isSameDay(day, new Date()) && "text-primary font-bold")}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                {habits.map(habit => (
                    <div key={habit.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b last:border-0 hover:bg-muted/5">
                        <div className="p-4 font-medium flex items-center gap-2 group">
                            {/* Icon placeholder if we had dynamic icons */}
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                                {habit.title.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="flex-1 truncate">{habit.title}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <EditHabitDialog habit={habit} />
                            </div>
                        </div>
                        {weekDays.map(day => (
                            <div key={day.toString()} className="p-4 flex items-center justify-center border-l border-muted">
                                <Checkbox
                                    checked={isCompleted(habit, day)}
                                    onCheckedChange={() => handleToggle(habit.id, day)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                            </div>
                        ))}
                    </div>
                ))}
                {habits.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No habits added yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    )
}
