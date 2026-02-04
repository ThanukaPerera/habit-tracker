"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { getHabitsWithLogs } from "@/app/actions/habit";
import { WeekView } from "@/components/habit/week-view";
import { MonthView } from "@/components/habit/month-view";
import { StatsView } from "@/components/habit/stats-view";
import { CreateHabitDialog } from "@/components/habit/create-dialog";
import { UserNav } from "@/components/user-nav";
import { Loader } from "lucide-react";

export interface HabitLog {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  userId: string;
  createdAt: string;
  logs: HabitLog[];
}

function TrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const viewParam =
    (searchParams.get("view") as "week" | "month" | "stats") || "week";
  const date = searchParams.get("date")
    ? new Date(searchParams.get("date")!)
    : new Date();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const range = viewParam === "stats" ? "month" : viewParam;
    const res = await getHabitsWithLogs(range, date.toISOString());
    if (res.success) {
      // Deserialize dates safely
      const deserializedHabits =
        res.habits?.map((habit) => ({
          ...habit,
          logs: habit.logs.map((log: any) => ({
            ...log,
            date: new Date(log.date),
          })),
        })) || [];
      setHabits(deserializedHabits);
    }
    setLoading(false);
  }, [date.toISOString(), viewParam]);

  // Fetch data when date or view changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateChange = (newDate: Date) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", newDate.toISOString());
    router.push(`?${params.toString()}`);
  };

  const handleViewChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("view", val);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habit Tracker</h1>
          <p className="text-muted-foreground">
            Track your daily habits and consistency.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserNav />
          <CreateHabitDialog onUpdate={fetchData} />
        </div>
      </div>

      <Card className="p-1">
        <Tabs
          value={viewParam}
          onValueChange={handleViewChange}
          className="w-full"
        >
          <div className="px-4 pt-4 border-b">
            <TabsList className="mb-4">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">Month View</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 min-h-[500px] flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                <div className="flex items-center">
                  <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading...
                </div>
              </div>
            ) : (
              <>
                <TabsContent value="week" className="mt-0">
                  <WeekView
                    habits={habits}
                    currentDate={date}
                    onDateChange={handleDateChange}
                    onUpdate={fetchData}
                  />
                </TabsContent>

                <TabsContent value="month" className="mt-0">
                  <MonthView
                    habits={habits}
                    currentDate={date}
                    onDateChange={handleDateChange}
                  />
                </TabsContent>

                <TabsContent value="stats" className="mt-0">
                  <StatsView habits={habits} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8 text-center text-muted-foreground">
          Loading application...
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  );
}
