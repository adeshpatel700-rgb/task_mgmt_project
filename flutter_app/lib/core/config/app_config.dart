class AppConfig {
  // API Configuration
  static const String apiBaseUrl =
      'https://task-management-backend-8bvu.onrender.com';

  // Environment
  static const Environment environment = Environment.production;

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String userEmailKey = 'user_email';
}

enum Environment {
  development,
  production,
}
