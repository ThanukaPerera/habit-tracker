'use client'

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    CartesianGrid
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subDays, isSameDay } from 'date-fns'

type HabitWithLogs = {
    id: string
    title: string
    logs: { date: Date | string; completed: boolean }[]
}

export function StatsView({ habits }: { habits: HabitWithLogs[] }) {
    // --- 1. Completion Overview (Bar Chart) ---
    const completionData = habits.map(habit => {
        const completedCount = habit.logs.filter(l => l.completed).length
        return {
            name: habit.title,
            completed: completedCount,
        }
    })
    completionData.sort((a, b) => b.completed - a.completed)

    // --- 2. Current Streaks Calculation ---
    const getStreak = (habit: HabitWithLogs) => {
        let streak = 0
        const today = new Date()
        // Check backwards from yesterday (or today if completed)
        // For simplicity, let's just check consecutive days present in logs
        // A better approach requires querying continuous ranges, but we'll approximate 
        // by checking last 30 days.

        for (let i = 0; i < 365; i++) {
            const checkDate = subDays(today, i)
            const hasLog = habit.logs.some(l => isSameDay(new Date(l.date), checkDate) && l.completed)

            if (i === 0 && !hasLog) continue; // Allow today to be skipped if not done yet
            if (hasLog) {
                streak++
            } else {
                break
            }
        }
        return streak
    }

    const streaks = habits.map(h => ({
        name: h.title,
        streak: getStreak(h)
    })).sort((a, b) => b.streak - a.streak)


    // --- 3. 30-Day Trend (Line Chart) ---
    const trendData = []
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        let completedTotal = 0
        habits.forEach(h => {
            if (h.logs.some(l => isSameDay(new Date(l.date), date) && l.completed)) {
                completedTotal++
            }
        })
        // Completion rate for the day
        const rate = habits.length > 0 ? (completedTotal / habits.length) * 100 : 0
        trendData.push({
            date: format(date, 'MMM d'),
            rate: Math.round(rate)
        })
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Habits Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{habits.length}</div>
                </CardContent>
            </Card>

            {/* Top Streak Card */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Longest Current Streak</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {streaks.length > 0 ? streaks[0].streak : 0} <span className="text-sm font-normal text-muted-foreground">days</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {streaks.length > 0 ? streaks[0].name : '-'}
                    </p>
                </CardContent>
            </Card>

            {/* Completion Rate Card (Average of today) */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Completion</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {trendData[trendData.length - 1]?.rate}%
                    </div>
                </CardContent>
            </Card>

            {/* Completion Overview Chart */}
            <Card className="col-span-full md:col-span-1">
                <CardHeader>
                    <CardTitle>Total Completions</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={completionData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar dataKey="completed" radius={[0, 4, 4, 0]} barSize={20}>
                                {completionData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card className="col-span-full md:col-span-2">
                <CardHeader>
                    <CardTitle>30-Day Consistency Trend</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval={6}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                unit="%"
                            />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="rate"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
