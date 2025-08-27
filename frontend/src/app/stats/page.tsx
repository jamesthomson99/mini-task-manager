'use client';

import { Navigation } from '@/components/Navigation';
import { StatsCard } from '@/components/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { Task } from '@/types';
import { Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DailyStats {
    date: string;
    completed: number;
    total: number;
}

export default function StatsPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        if (!user && !loading) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            loadTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        try {
            const fetchedTasks = await apiClient.getTasks();
            setTasks(fetchedTasks);
        } catch (err) {
            console.error('Failed to load tasks for stats:', err);
        } finally {
            setStatsLoading(false);
        }
    };

    const calculateStats = () => {
        const completedTasks = tasks.filter(task => task.status === 'completed');
        const pendingTasks = tasks.filter(task => task.status === 'pending');

        // Calculate daily stats for the last 30 days
        const dailyStats: DailyStats[] = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const dayTasks = tasks.filter(task => {
                const taskDate = new Date(task.created_at).toISOString().split('T')[0];
                return taskDate === dateStr;
            });

            const dayCompleted = dayTasks.filter(task => task.status === 'completed').length;

            dailyStats.push({
                date: dateStr,
                completed: dayCompleted,
                total: dayTasks.length
            });
        }

        return {
            totalTasks: tasks.length,
            completedTasks: completedTasks.length,
            pendingTasks: pendingTasks.length,
            completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
            dailyStats
        };
    };

    const stats = calculateStats();

    if (loading || statsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2">Loading stats...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation onLogout={handleLogout} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Tasks"
                            value={stats.totalTasks}
                            description="All time tasks created"
                            icon={Calendar}
                            iconColor="text-muted-foreground"
                            valueColor="text-foreground"
                        />

                        <StatsCard
                            title="Completed Tasks"
                            value={stats.completedTasks}
                            description="Successfully finished"
                            icon={CheckCircle}
                            iconColor="text-green-600"
                            valueColor="text-green-600"
                        />

                        <StatsCard
                            title="Pending Tasks"
                            value={stats.pendingTasks}
                            description="Still in progress"
                            icon={Clock}
                            iconColor="text-orange-600"
                            valueColor="text-orange-600"
                        />

                        <StatsCard
                            title="Completion Rate"
                            value={`${stats.completionRate}%`}
                            description="Tasks completed"
                            icon={TrendingUp}
                            iconColor="text-blue-600"
                            valueColor="text-blue-600"
                        />
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your latest task activities
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(() => {
                                    // Combine all tasks with their activity type and date
                                    const activities = [
                                        ...tasks.map(task => ({
                                            ...task,
                                            activityType: 'created' as const,
                                            activityDate: task.created_at,
                                            icon: Calendar,
                                            iconColor: 'text-blue-600',
                                            description: 'Created'
                                        })),
                                        ...tasks
                                            .filter(task => task.status === 'completed')
                                            .map(task => ({
                                                ...task,
                                                activityType: 'completed' as const,
                                                activityDate: task.updated_at,
                                                icon: CheckCircle,
                                                iconColor: 'text-green-600',
                                                description: 'Completed'
                                            }))
                                    ];

                                    // Sort by activity date (most recent first) and take top 8
                                    const recentActivities = activities
                                        .sort((a, b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime())
                                        .slice(0, 8);

                                    if (recentActivities.length === 0) {
                                        return (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No activity yet. Start creating tasks to see your activity here!
                                            </p>
                                        );
                                    }

                                    return recentActivities.map((activity) => {
                                        const Icon = activity.icon;
                                        return (
                                            <div key={`${activity.id}-${activity.activityType}`} className="flex items-center space-x-3">
                                                <Icon className={`h-5 w-5 ${activity.iconColor}`} />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {activity.description} on {new Date(activity.activityDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
