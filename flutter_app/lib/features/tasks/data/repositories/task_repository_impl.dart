import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/task_entity.dart';
import '../../domain/repositories/task_repository.dart';
import '../models/task_models.dart';
import '../services/task_api_service.dart';

class TaskRepositoryImpl implements TaskRepository {
  final TaskApiService _apiService;

  TaskRepositoryImpl(this._apiService);

  @override
  Future<TaskListResult> getTasks({
    int limit = 20,
    String? cursor,
    TaskStatus? status,
    String? search,
  }) async {
    final response = await _apiService.getTasks(
      limit: limit,
      cursor: cursor,
      status: status?.value,
      search: search,
    );

    final tasks = response.tasks.map((model) => _mapToEntity(model)).toList();

    return TaskListResult(
      tasks: tasks,
      nextCursor: response.nextCursor,
      hasMore: response.hasMore,
    );
  }

  @override
  Future<TaskEntity> getTaskById(String id) async {
    final model = await _apiService.getTaskById(id);
    return _mapToEntity(model);
  }

  @override
  Future<TaskEntity> createTask({
    required String title,
    String? description,
    TaskStatus status = TaskStatus.todo,
  }) async {
    final request = CreateTaskRequest(
      title: title,
      description: description,
      status: status.value,
    );

    final model = await _apiService.createTask(request);
    return _mapToEntity(model);
  }

  @override
  Future<TaskEntity> updateTask({
    required String id,
    String? title,
    String? description,
    TaskStatus? status,
  }) async {
    final request = UpdateTaskRequest(
      title: title,
      description: description,
      status: status?.value,
    );

    final model = await _apiService.updateTask(id, request);
    return _mapToEntity(model);
  }

  @override
  Future<void> deleteTask(String id) async {
    await _apiService.deleteTask(id);
  }

  @override
  Future<TaskEntity> toggleTaskStatus(String id) async {
    final model = await _apiService.toggleTaskStatus(id);
    return _mapToEntity(model);
  }

  TaskEntity _mapToEntity(TaskModel model) {
    return TaskEntity(
      id: model.id,
      title: model.title,
      description: model.description,
      status: TaskStatus.fromString(model.status),
      userId: model.userId,
      createdAt: DateTime.parse(model.createdAt),
      updatedAt: DateTime.parse(model.updatedAt),
    );
  }
}

// Provider
final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final apiService = ref.watch(taskApiServiceProvider);
  return TaskRepositoryImpl(apiService);
});
