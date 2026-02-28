import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../domain/entities/task_entity.dart';
import '../providers/task_provider.dart';
import '../widgets/task_list_item.dart';

class TaskDashboardScreen extends ConsumerStatefulWidget {
  const TaskDashboardScreen({super.key});

  @override
  ConsumerState<TaskDashboardScreen> createState() =>
      _TaskDashboardScreenState();
}

class _TaskDashboardScreenState extends ConsumerState<TaskDashboardScreen> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(taskListProvider.notifier).loadMoreTasks();
    }
  }

  Future<void> _handleRefresh() async {
    await ref.read(taskListProvider.notifier).loadTasks(refresh: true);
  }

  void _showFilterDialog() {
    final currentFilter = ref.read(taskListProvider).filterStatus;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter by Status'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            RadioListTile<TaskStatus?>(
              title: const Text('All Tasks'),
              value: null,
              groupValue: currentFilter,
              onChanged: (value) {
                ref.read(taskListProvider.notifier).setFilter(value);
                Navigator.pop(context);
              },
            ),
            RadioListTile<TaskStatus?>(
              title: const Text('To Do'),
              value: TaskStatus.todo,
              groupValue: currentFilter,
              onChanged: (value) {
                ref.read(taskListProvider.notifier).setFilter(value);
                Navigator.pop(context);
              },
            ),
            RadioListTile<TaskStatus?>(
              title: const Text('In Progress'),
              value: TaskStatus.inProgress,
              groupValue: currentFilter,
              onChanged: (value) {
                ref.read(taskListProvider.notifier).setFilter(value);
                Navigator.pop(context);
              },
            ),
            RadioListTile<TaskStatus?>(
              title: const Text('Done'),
              value: TaskStatus.done,
              groupValue: currentFilter,
              onChanged: (value) {
                ref.read(taskListProvider.notifier).setFilter(value);
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showDeleteDialog(TaskEntity task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: Text('Are you sure you want to delete "${task.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref.read(taskListProvider.notifier).deleteTask(task.id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Task deleted')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to delete task: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final taskState = ref.watch(taskListProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
            tooltip: 'Filter',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
            },
            tooltip: 'Logout',
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search tasks...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          ref.read(taskListProvider.notifier).setSearch('');
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
              onChanged: (value) {
                ref.read(taskListProvider.notifier).setSearch(value);
              },
            ),
          ),
        ),
      ),
      body: taskState.isLoading && taskState.tasks.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : taskState.error != null && taskState.tasks.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          size: 64, color: Colors.grey[400]),
                      const SizedBox(height: 16),
                      Text(
                        taskState.error!,
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _handleRefresh,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : taskState.tasks.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.task_outlined,
                              size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          Text(
                            'No tasks yet',
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(color: Colors.grey[600]),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Tap + to create your first task',
                            style: TextStyle(color: Colors.grey[500]),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _handleRefresh,
                      child: ListView.builder(
                        controller: _scrollController,
                        itemCount: taskState.tasks.length +
                            (taskState.isLoadingMore ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (index == taskState.tasks.length) {
                            return const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: CircularProgressIndicator(),
                              ),
                            );
                          }

                          final task = taskState.tasks[index];
                          return TaskListItem(
                            task: task,
                            onTap: () {
                              context.push('/task-form', extra: task);
                            },
                            onToggle: () async {
                              try {
                                await ref
                                    .read(taskListProvider.notifier)
                                    .toggleTaskStatus(task.id);
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content:
                                          Text('Failed to update task: $e'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                }
                              }
                            },
                            onEdit: () {
                              context.push('/task-form', extra: task);
                            },
                            onDelete: () {
                              _showDeleteDialog(task);
                            },
                          );
                        },
                      ),
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.push('/task-form');
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
