import { useState, useEffect } from 'react';
import { tasksService } from '../services/api';
import { Plus, CheckCircle, Circle, Clock } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueAt: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksService.getAll();
      setTasks(response.data.content || response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        dueAt: formData.dueAt ? new Date(formData.dueAt).toISOString() : null
      };
      await tasksService.create(data);
      setFormData({ title: '', description: '', priority: 'MEDIUM', dueAt: '' });
      setShowForm(false);
      loadTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Make sure you have a contact to link to.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await tasksService.complete(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'URGENT': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border rounded-lg px-3 py-2"
                required
              />
              <input
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                className="border rounded-lg px-3 py-2"
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
            <div className="flex items-center gap-4">
              <label className="font-medium">Priority:</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="border rounded-lg px-3 py-2"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Circle size={20} className="text-blue-600" />
              Pending ({pendingTasks.length})
            </h2>
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500">No pending tasks</p>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              Completed ({completedTasks.length})
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-gray-500">No completed tasks</p>
            ) : (
              <div className="space-y-3 opacity-60">
                {completedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={handleComplete}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TaskCard({ task, onComplete, getPriorityColor, formatDate }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-start gap-4">
      <button
        onClick={() => !task.isCompleted && onComplete(task.id)}
        className={`mt-1 ${task.isCompleted ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
        disabled={task.isCompleted}
      >
        {task.isCompleted ? <CheckCircle size={24} /> : <Circle size={24} />}
      </button>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        {task.description && (
          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>Due: {formatDate(task.dueAt)}</span>
        </div>
      </div>
    </div>
  );
}
