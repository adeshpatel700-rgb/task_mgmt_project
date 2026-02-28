import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/storage/secure_storage_service.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/auth_models.dart';
import '../services/auth_api_service.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthApiService _apiService;
  final SecureStorageService _storage;

  AuthRepositoryImpl(this._apiService, this._storage);

  @override
  Future<UserEntity> register(String email, String password) async {
    final request = RegisterRequest(email: email, password: password);
    final response = await _apiService.register(request);

    // Save tokens and user info
    await _storage.saveAccessToken(response.tokens.accessToken);
    await _storage.saveRefreshToken(response.tokens.refreshToken);
    await _storage.saveUserId(response.user.id);
    await _storage.saveUserEmail(response.user.email);

    return UserEntity(
      id: response.user.id,
      email: response.user.email,
    );
  }

  @override
  Future<UserEntity> login(String email, String password) async {
    final request = LoginRequest(email: email, password: password);
    final response = await _apiService.login(request);

    // Save tokens and user info
    await _storage.saveAccessToken(response.tokens.accessToken);
    await _storage.saveRefreshToken(response.tokens.refreshToken);
    await _storage.saveUserId(response.user.id);
    await _storage.saveUserEmail(response.user.email);

    return UserEntity(
      id: response.user.id,
      email: response.user.email,
    );
  }

  @override
  Future<void> logout() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken != null) {
      try {
        await _apiService.logout(refreshToken);
      } catch (e) {
        // Ignore logout errors, just clear local storage
      }
    }
    await _storage.clearAll();
  }

  @override
  Future<UserEntity?> getCurrentUser() async {
    final userId = await _storage.getUserId();
    final userEmail = await _storage.getUserEmail();

    if (userId != null && userEmail != null) {
      return UserEntity(id: userId, email: userEmail);
    }

    return null;
  }

  @override
  Future<bool> isAuthenticated() async {
    final accessToken = await _storage.getAccessToken();
    return accessToken != null;
  }
}

// Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiService = ref.watch(authApiServiceProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepositoryImpl(apiService, storage);
});
