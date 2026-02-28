import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/network/exceptions.dart';
import '../models/auth_models.dart';

class AuthApiService {
  final Dio _dio;

  AuthApiService(this._dio);

  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: request.toJson(),
      );

      if (response.statusCode == 201) {
        final data = response.data['data'] as Map<String, dynamic>;
        return AuthResponse.fromJson(data);
      }

      throw ApiException('Registration failed');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return AuthResponse.fromJson(data);
      }

      throw ApiException('Login failed');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<TokenRefreshResponse> refreshTokens(RefreshRequest request) async {
    try {
      final response = await _dio.post(
        '/auth/refresh',
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        return TokenRefreshResponse.fromJson(data);
      }

      throw ApiException('Token refresh failed');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout(String refreshToken) async {
    try {
      await _dio.post(
        '/auth/logout',
        data: {'refreshToken': refreshToken},
      );
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
        return NotFoundException(message ?? 'Not found');
      case 409:
        return ApiException(message ?? 'Conflict', 409);
      case 500:
        return ServerException(message ?? 'Server error');
      default:
        return ApiException(message ?? 'Unknown error', statusCode);
    }
  }
}

// Provider
final authApiServiceProvider = Provider<AuthApiService>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthApiService(dio);
});
