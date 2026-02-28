import '../entities/task_entity.dart';

abstract class TaskRepository {
  Future<TaskListResult> getTasks({
    int limit = 20,
    String? cursor,
    TaskStatus? status,
    String? search,
  });
  Future<TaskEntity> getTaskById(String id);
  Future<TaskEntity> createTask({
    required String title,
    String? description,
    TaskStatus status = TaskStatus.todo,
  });
  Future<TaskEntity> updateTask({
    required String id,
    String? title,
    String? description,
    TaskStatus? status,
  });
  Future<void> deleteTask(String id);
  Future<TaskEntity> toggleTaskStatus(String id);
}

class TaskListResult {
  final List<TaskEntity> tasks;
  final String? nextCursor;
  final bool hasMore;

  TaskListResult({
    required this.tasks,
    this.nextCursor,
    required this.hasMore,
  });
}
