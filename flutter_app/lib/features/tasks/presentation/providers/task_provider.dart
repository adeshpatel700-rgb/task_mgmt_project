import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/task_entity.dart';
import '../../domain/repositories/task_repository.dart';
import '../../data/repositories/task_repository_impl.dart';

class TaskListState {
  final List<TaskEntity> tasks;
  final bool isLoading;
  final bool isLoadingMore;
  final String? error;
  final String? nextCursor;
  final bool hasMore;
  final TaskStatus? filterStatus;
  final String? searchQuery;

  TaskListState({
    this.tasks = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.error,
    this.nextCursor,
    this.hasMore = true,
    this.filterStatus,
    this.searchQuery,
  });

  TaskListState copyWith({
    List<TaskEntity>? tasks,
    bool? isLoading,
    bool? isLoadingMore,
    String? error,
    String? nextCursor,
    bool? hasMore,
    TaskStatus? filterStatus,
    String? searchQuery,
    bool clearError = false,
    bool clearFilter = false,
    bool clearSearch = false,
  }) {
    return TaskListState(
      tasks: tasks ?? this.tasks,
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      error: clearError ? null : (error ?? this.error),
      nextCursor: nextCursor ?? this.nextCursor,
      hasMore: hasMore ?? this.hasMore,
      filterStatus: clearFilter ? null : (filterStatus ?? this.filterStatus),
      searchQuery: clearSearch ? null : (searchQuery ?? this.searchQuery),
    );
  }
}

class TaskListNotifier extends StateNotifier<TaskListState> {
  final TaskRepository _repository;

  TaskListNotifier(this._repository) : super(TaskListState()) {
    loadTasks();
  }

  Future<void> loadTasks({bool refresh = false}) async {
    if (refresh) {
      state = state.copyWith(
        isLoading: true,
        tasks: [],
        nextCursor: null,
        hasMore: true,
        clearError: true,
      );
    } else if (state.isLoading || state.isLoadingMore) {
      return;
    } else {
      state = state.copyWith(isLoading: true, clearError: true);
    }

    try {
      final result = await _repository.getTasks(
        limit: 20,
        status: state.filterStatus,
        search: state.searchQuery,
      );

      state = state.copyWith(
        tasks: result.tasks,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  Future<void> loadMoreTasks() async {
    if (!state.hasMore || state.isLoadingMore || state.nextCursor == null) {
      return;
    }

    state = state.copyWith(isLoadingMore: true, clearError: true);

    try {
      final result = await _repository.getTasks(
        limit: 20,
        cursor: state.nextCursor,
        status: state.filterStatus,
        search: state.searchQuery,
      );

      state = state.copyWith(
        tasks: [...state.tasks, ...result.tasks],
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoadingMore: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingMore: false,
        error: e.toString(),
      );
    }
  }

  void setFilter(TaskStatus? status) {
    state = state.copyWith(
      filterStatus: status,
      clearFilter: status == null,
    );
    loadTasks(refresh: true);
  }

  void setSearch(String query) {
    state = state.copyWith(
      searchQuery: query.isEmpty ? null : query,
      clearSearch: query.isEmpty,
    );
    loadTasks(refresh: true);
  }

  Future<void> createTask({
    required String title,
    String? description,
    TaskStatus status = TaskStatus.todo,
  }) async {
    try {
      await _repository.createTask(
        title: title,
        description: description,
        status: status,
      );
      await loadTasks(refresh: true);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> updateTask({
    required String id,
    String? title,
    String? description,
    TaskStatus? status,
  }) async {
    try {
      await _repository.updateTask(
        id: id,
        title: title,
        description: description,
        status: status,
      );
      await loadTasks(refresh: true);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      await _repository.deleteTask(id);
      state = state.copyWith(
        tasks: state.tasks.where((task) => task.id != id).toList(),
      );
    } catch (e) {
      rethrow;
    }
  }

  Future<void> toggleTaskStatus(String id) async {
    // Optimistic update
    final taskIndex = state.tasks.indexWhere((task) => task.id == id);
    if (taskIndex == -1) return;

    final task = state.tasks[taskIndex];
    TaskStatus newStatus;
    switch (task.status) {
      case TaskStatus.todo:
        newStatus = TaskStatus.inProgress;
        break;
      case TaskStatus.inProgress:
        newStatus = TaskStatus.done;
        break;
      case TaskStatus.done:
        newStatus = TaskStatus.todo;
        break;
    }

    final updatedTask = TaskEntity(
      id: task.id,
      title: task.title,
      description: task.description,
      status: newStatus,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: DateTime.now(),
    );

    final updatedTasks = List<TaskEntity>.from(state.tasks);
    updatedTasks[taskIndex] = updatedTask;
    state = state.copyWith(tasks: updatedTasks);

    try {
      await _repository.toggleTaskStatus(id);
    } catch (e) {
      // Revert on error
      final revertedTasks = List<TaskEntity>.from(state.tasks);
      revertedTasks[taskIndex] = task;
      state = state.copyWith(tasks: revertedTasks, error: e.toString());
      rethrow;
    }
  }
}

// Provider
final taskListProvider =
    StateNotifierProvider<TaskListNotifier, TaskListState>((ref) {
  final repository = ref.watch(taskRepositoryProvider);
  return TaskListNotifier(repository);
});
