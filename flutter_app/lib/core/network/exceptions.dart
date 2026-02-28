class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class NetworkException extends ApiException {
  NetworkException([String message = 'Network error occurred'])
      : super(message);
}

class UnauthorizedException extends ApiException {
  UnauthorizedException([String message = 'Unauthorized access'])
      : super(message, 401);
}

class NotFoundException extends ApiException {
  NotFoundException([String message = 'Resource not found'])
      : super(message, 404);
}

class ValidationException extends ApiException {
  ValidationException([String message = 'Validation failed'])
      : super(message, 400);
}

class ServerException extends ApiException {
  ServerException([String message = 'Server error occurred'])
      : super(message, 500);
}
