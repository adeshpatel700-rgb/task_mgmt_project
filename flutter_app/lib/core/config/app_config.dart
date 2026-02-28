class AppConfig {
  // API Configuration
  static const String apiBaseUrl =
      'http://10.0.2.2:3000'; // Android emulator localhost
  // For physical device, use your machine's IP: 'http://192.168.x.x:3000'
  // For production: 'https://your-api-domain.com'

  // Environment
  static const Environment environment = Environment.development;

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
