import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';
import '../config/app_config.dart';
import '../storage/secure_storage_service.dart';

class DioClient {
  final Dio _dio;
  final SecureStorageService _storage;
  final Logger _logger;

  DioClient(this._storage, this._logger)
      : _dio = Dio(
          BaseOptions(
            baseUrl: AppConfig.apiBaseUrl,
            connectTimeout: AppConfig.connectTimeout,
            receiveTimeout: AppConfig.receiveTimeout,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        ) {
    _setupInterceptors();
  }

  void _setupInterceptors() {
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add access token to request
          final token = await _storage.getAccessToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          // Log request
          if (AppConfig.environment == Environment.development) {
            _logger.d(
              'REQUEST[${options.method}] => PATH: ${options.path}\n'
              'Headers: ${options.headers}\n'
              'Data: ${options.data}',
            );
          }

          handler.next(options);
        },
        onResponse: (response, handler) {
          // Log response
          if (AppConfig.environment == Environment.development) {
            _logger.i(
              'RESPONSE[${response.statusCode}] => PATH: ${response.requestOptions.path}\n'
              'Data: ${response.data}',
            );
          }

          handler.next(response);
        },
        onError: (error, handler) async {
          // Log error
          _logger.e(
            'ERROR[${error.response?.statusCode}] => PATH: ${error.requestOptions.path}\n'
            'Message: ${error.message}\n'
            'Data: ${error.response?.data}',
          );

          // Handle 401 - Attempt token refresh
          if (error.response?.statusCode == 401) {
            final refreshed = await _refreshToken();

            if (refreshed) {
              // Retry original request
              final options = error.requestOptions;
              final token = await _storage.getAccessToken();
              options.headers['Authorization'] = 'Bearer $token';

              try {
                final response = await _dio.fetch(options);
                return handler.resolve(response);
              } catch (e) {
                return handler.reject(error);
              }
            } else {
              // Refresh failed, clear tokens and let error propagate
              await _storage.clearAll();
              return handler.reject(error);
            }
          }

          handler.reject(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await _storage.getRefreshToken();

      if (refreshToken == null) {
        return false;
      }

      // Create a new Dio instance without interceptors for refresh request
      final dio = Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl));

      final response = await dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String;
        final newRefreshToken = data['refreshToken'] as String;

        await _storage.saveAccessToken(newAccessToken);
        await _storage.saveRefreshToken(newRefreshToken);

        _logger.i('Token refreshed successfully');
        return true;
      }

      return false;
    } catch (e) {
      _logger.e('Token refresh failed: $e');
      return false;
    }
  }

  Dio get dio => _dio;
}

// Provider
final loggerProvider = Provider<Logger>((ref) {
  return Logger(
    printer: PrettyPrinter(
      methodCount: 0,
      errorMethodCount: 5,
      lineLength: 50,
      colors: true,
      printEmojis: true,
    ),
    level: AppConfig.environment == Environment.development
        ? Level.debug
        : Level.error,
  );
});

final dioClientProvider = Provider<DioClient>((ref) {
  final storage = ref.watch(secureStorageProvider);
  final logger = ref.watch(loggerProvider);
  return DioClient(storage, logger);
});

final dioProvider = Provider<Dio>((ref) {
  final client = ref.watch(dioClientProvider);
  return client.dio;
});
