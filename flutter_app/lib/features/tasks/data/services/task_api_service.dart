import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/network/exceptions.dart';
import '../models/task_models.dart';

class TaskApiService {
  final Dio _dio;

  TaskApiService(this._dio);

  Future<TaskListResponse> getTasks({
    int limit = 20,
    String? cursor,
    String? status,
    String? search,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'limit': limit,
        if (cursor != null) 'cursor': cursor,
        if (status != null) 'status': status,
        if (search != null && search.isNotEmpty) 'search': search,
      };

      final response = await _dio.get(
        '/tasks',
        queryParameters: queryParams,
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TaskListResponse.fromJson(data);
      }

      throw ApiException('Failed to fetch tasks');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<TaskModel> getTaskById(String id) async {
    try {
      final response = await _dio.get('/tasks/$id');

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TaskModel.fromJson(data);
      }

      throw ApiException('Failed to fetch task');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<TaskModel> createTask(CreateTaskRequest request) async {
    try {
      final response = await _dio.post(
        '/tasks',
        data: request.toJson(),
      );

      if (response.statusCode == 201) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TaskModel.fromJson(data);
      }

      throw ApiException('Failed to create task');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<TaskModel> updateTask(String id, UpdateTaskRequest request) async {
    try {
      final response = await _dio.patch(
        '/tasks/$id',
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TaskModel.fromJson(data);
      }

      throw ApiException('Failed to update task');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      await _dio.delete('/tasks/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<TaskModel> toggleTaskStatus(String id) async {
    try {
      final response = await _dio.patch('/tasks/$id/toggle');

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TaskModel.fromJson(data);
      }

      throw ApiException('Failed to toggle task status');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  ApiException _handleError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return NetworkException('Connection timeout');
    }

    if (error.type == DioExceptionType.connectionError) {
      return NetworkException('No internet connection');
    }

    final statusCode = error.response?.statusCode;
    final message = error.response?.data?['error'] ?? error.message;

    switch (statusCode) {
      case 400:
        return ValidationException(message ?? 'Invalid request');
      case 401:
        return UnauthorizedException(message ?? 'Unauthorized');
      case 404:
        return NotFoundException(message ?? 'Task not found');
      case 500:
        return ServerException(message ?? 'Server error');
      default:
        return ApiException(message ?? 'Unknown error', statusCode);
    }
  }
}

// Provider
final taskApiServiceProvider = Provider<TaskApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return TaskApiService(dio);
});
