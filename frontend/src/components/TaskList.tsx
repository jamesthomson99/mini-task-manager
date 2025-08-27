'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api';
import { Task } from '@/types';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  // Loading states for individual actions
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);
  const [togglingTask, setTogglingTask] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await apiClient.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    try {
      setTogglingTask(taskId);
      const updatedTask = await apiClient.toggleTaskStatus(taskId);
      setTasks(tasks.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError('Failed to update task status');
    } finally {
      setTogglingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingTask(taskId);
      await apiClient.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setDeletingTask(null);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    try {
      setUpdatingTask(true);
      const updatedTask = await apiClient.updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
      });
      setTasks(tasks.map(task =>
        task.id === editingTask.id ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      setCreatingTask(true);
      const createdTask = await apiClient.createTask({
        title: newTask.title,
        description: newTask.description,
      });
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '' });
      setShowCreateDialog(false);
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="new-description">Description</Label>
                <Textarea
                  id="new-description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
                             <Button onClick={handleCreateTask} className="w-full" disabled={creatingTask}>
                 {creatingTask ? (
                   <>
                     <Spinner size="sm" className="mr-2" />
                     Creating...
                   </>
                 ) : (
                   'Create Task'
                 )}
               </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No tasks yet. Create your first task!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card key={task.id} className={task.status === 'completed' ? 'opacity-75' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                                     <div className="flex items-start space-x-3 flex-1">
                     {togglingTask === task.id ? (
                       <div className="mt-1 w-4 h-4 flex items-center justify-center">
                         <Spinner size="sm" />
                       </div>
                     ) : (
                       <Checkbox
                         checked={task.status === 'completed'}
                         onCheckedChange={() => handleToggleStatus(task.id)}
                         className="mt-1"
                       />
                     )}
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${task.status === 'completed' ? 'line-through' : ''}`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                                                 <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setEditingTask(task)}
                           disabled={updatingTask}
                         >
                           {updatingTask ? (
                             <Spinner size="sm" />
                           ) : (
                             <Edit className="w-4 h-4" />
                           )}
                         </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={editingTask?.title || ''}
                              onChange={(e) => setEditingTask(editingTask ? { ...editingTask, title: e.target.value } : null)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                              id="edit-description"
                              value={editingTask?.description || ''}
                              onChange={(e) => setEditingTask(editingTask ? { ...editingTask, description: e.target.value } : null)}
                            />
                          </div>
                                                     <Button onClick={handleUpdateTask} className="w-full" disabled={updatingTask}>
                             {updatingTask ? (
                               <>
                                 <Spinner size="sm" className="mr-2" />
                                 Updating...
                               </>
                             ) : (
                               'Update Task'
                             )}
                           </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                                             <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleDeleteTask(task.id)}
                           disabled={deletingTask === task.id}
                         >
                           {deletingTask === task.id ? (
                             <Spinner size="sm" />
                           ) : (
                             <Trash2 className="w-4 h-4" />
                           )}
                         </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
