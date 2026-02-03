'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type HabitWithLogs = {
    id: string
    title: string
    logs: { date: Date; completed: boolean }[]
}

export function MonthView({
    habits,
    currentDate,
    onDateChange
}: {
    habits: HabitWithLogs[]
    currentDate: Date
    onDateChange: (date: Date) => void
}) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getDayHabits = (date: Date) => {
        return habits.map(habit => {
            const isCompleted = habit.logs.some(log => isSameDay(new Date(log.date), date) && log.completed)
            return { ...habit, isCompleted }
        })
    }

    // Calculate completion percentage for a day
    const getDayCompletion = (date: Date) => {
        if (habits.length === 0) return 0
        const dayHabits = getDayHabits(date)
        const completed = dayHabits.filter(h => h.isCompleted).length
        return (completed / habits.length) * 100
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => onDateChange(addMonths(currentDate, -1))}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => onDateChange(addMonths(currentDate, 1))}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                    </div>
                ))}

                {/* Placeholder for days from previous month to align grid? 
            For now, just simple day mapping. 
            Ideally we should paddle start of month. 
         */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="bg-background/50 p-4 min-h-[100px]" />
                ))}

                {days.map(day => {
                    const completion = getDayCompletion(day)
                    const dayHabits = getDayHabits(day)
                    const completedCount = dayHabits.filter(h => h.isCompleted).length

                    return (
                        <TooltipProvider key={day.toString()}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            "bg-background p-2 min-h-[100px] relative hover:bg-muted/20 transition-colors",
                                            isToday(day) && "bg-primary/5"
                                        )}
                                    >
                                        <div className={cn(
                                            "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-2",
                                            isToday(day) ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {format(day, 'd')}
                                        </div>

                                        {/* Activity visualizer */}
                                        {completedCount > 0 && (
                                            <div className="space-y-1">
                                                {dayHabits.filter(h => h.isCompleted).slice(0, 3).map(h => (
                                                    <div key={h.id} className="text-[10px] truncate bg-primary/10 text-primary px-1 rounded">
                                                        {h.title}
                                                    </div>
                                                ))}
                                                {dayHabits.filter(h => h.isCompleted).length > 3 && (
                                                    <div className="text-[10px] text-muted-foreground pl-1">
                                                        + {dayHabits.filter(h => h.isCompleted).length - 3} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="text-xs">
                                        <div className="font-semibold mb-1">{format(day, 'MMM d')}</div>
                                        {dayHabits.map(h => (
                                            <div key={h.id} className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", h.isCompleted ? "bg-primary" : "bg-muted")} />
                                                <span className={h.isCompleted ? "" : "text-muted-foreground"}>{h.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </div>
        </div>
    )
}
