# Task Management System - Flutter Mobile App

Production-ready Flutter mobile application for task management with clean architecture, Riverpod state management, and secure JWT authentication.

## Features

- ✅ Clean Architecture (Domain, Data, Presentation layers)
- ✅ JWT-based authentication with automatic token refresh
- ✅ Secure token storage using FlutterSecureStorage
- ✅ Task CRUD operations
- ✅ Cursor-based pagination with infinite scroll
- ✅ Pull-to-refresh
- ✅ Filter tasks by status
- ✅ Search tasks by title
- ✅ Optimistic UI updates for task toggle
- ✅ Comprehensive error handling
- ✅ Material Design 3
- ✅ Type-safe routing with GoRouter
- ✅ Null safety enabled

## Tech Stack

- **Framework**: Flutter 3.x
- **Language**: Dart 3.x
- **State Management**: Riverpod 2.x
- **HTTP Client**: Dio
- **Secure Storage**: flutter_secure_storage
- **Navigation**: go_router
- **Code Generation**: freezed, json_serializable
- **Logging**: logger

## Prerequisites

- Flutter SDK 3.2.0 or higher
- Dart SDK 3.2.0 or higher
- Android Studio / VS Code with Flutter plugin
- Android SDK (for Android builds)
- Backend API running (see backend README)

## Installation

1. **Navigate to the Flutter app directory**

```bash
cd flutter_app
```

2. **Install dependencies**

```bash
flutter pub get
```

3. **Run code generation** (for freezed and json_serializable)

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

4. **Configure API base URL**

Edit `lib/core/config/app_config.dart`:

```dart
// For Android Emulator (points to host machine)
static const String apiBaseUrl = 'http://10.0.2.2:3000';

// For physical Android device (use your machine's IP)
static const String apiBaseUrl = 'http://192.168.x.x:3000';

// For production
static const String apiBaseUrl = 'https://your-api-domain.com';
```

## Running the App

### Development Mode

**Android Emulator:**

```bash
flutter run
```

**Physical Device:**

```bash
flutter run
```

**Select Device:**

```bash
flutter devices  # List available devices
flutter run -d <device-id>
```

### Hot Reload

Press `r` in terminal for hot reload
Press `R` in terminal for hot restart

## Project Structure

```
flutter_app/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   │   └── app_config.dart          # API URL, environment config
│   │   ├── network/
│   │   │   ├── dio_client.dart          # HTTP client with interceptors
│   │   │   └── exceptions.dart          # Custom exceptions
│   │   ├── router/
│   │   │   └── app_router.dart          # GoRouter configuration
│   │   └── storage/
│   │       └── secure_storage_service.dart  # Token storage wrapper
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── auth_models.dart     # Request/Response models
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository_impl.dart
│   │   │   │   └── services/
│   │   │   │       └── auth_api_service.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user_entity.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       └── screens/
│   │   │           ├── login_screen.dart
│   │   │           └── register_screen.dart
│   │   └── tasks/
│   │       ├── data/
│   │       │   ├── models/
│   │       │   │   └── task_models.dart
│   │       │   ├── repositories/
│   │       │   │   └── task_repository_impl.dart
│   │       │   └── services/
│   │       │       └── task_api_service.dart
│   │       ├── domain/
│   │       │   ├── entities/
│   │       │   │   └── task_entity.dart
│   │       │   └── repositories/
│   │       │       └── task_repository.dart
│   │       └── presentation/
│   │           ├── providers/
│   │           │   └── task_provider.dart
│   │           ├── screens/
│   │           │   ├── task_dashboard_screen.dart
│   │           │   └── task_form_screen.dart
│   │           └── widgets/
│   │               └── task_list_item.dart
│   ├── shared/
│   │   ├── theme/
│   │   │   └── app_theme.dart
│   │   └── widgets/
│   │       ├── empty_state.dart
│   │       ├── error_view.dart
│   │       └── loading_indicator.dart
│   └── main.dart                        # App entry point
├── android/                             # Android configuration
├── pubspec.yaml                         # Dependencies
└── README.md
```

## Key Features Implementation

### 1. Authentication Flow

- Login/Register screens with form validation
- JWT access token (short-lived, 15 minutes)
- JWT refresh token (long-lived, 7 days)
- Automatic token refresh on 401 errors
- Secure token storage using encrypted shared preferences
- Auth state management with Riverpod
- Route guards for protected screens

### 2. Task Management

- Task dashboard with infinite scroll pagination
- Pull-to-refresh functionality
- Filter by status (TODO, IN_PROGRESS, DONE)
- Search by title (debounced)
- Create/Edit/Delete tasks
- Toggle task status with optimistic updates
- Empty state and error state UI
- Loading indicators

### 3. Network Layer

- Dio HTTP client with interceptors
- Automatic access token injection
- Token refresh interceptor
- Error handling and transformation
- Request/Response logging (debug mode)
- Connection timeout handling

### 4. State Management

- Riverpod for dependency injection
- StateNotifier for complex state
- Provider for services and repositories
- Proper state disposal and cleanup

## Building for Production

### Generate Release APK

1. **Create Keystore** (first time only):

```bash
keytool -genkey -v -keystore ~/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Follow the prompts to set passwords and details.

2. **Configure Signing** (first time only):

Copy `android/key.properties.example` to `android/key.properties`:

```bash
cp android/key.properties.example android/key.properties
```

Edit `android/key.properties`:

```properties
storePassword=your-keystore-password
keyPassword=your-key-password
keyAlias=upload
storeFile=C:/Users/YourName/upload-keystore.jks
```

**Important**: Add `android/key.properties` to `.gitignore` (already included)

3. **Update API URL for Production**:

Edit `lib/core/config/app_config.dart` to use production API URL.

4. **Build Release APK**:

```bash
flutter build apk --release
```

The APK will be at: `build/app/outputs/flutter-apk/app-release.apk`

### Build App Bundle (for Play Store)

```bash
flutter build appbundle --release
```

The bundle will be at: `build/app/outputs/bundle/release/app-release.aab`

### Install APK on Device

```bash
adb install build/app/outputs/flutter-apk/app-release.apk
```

Or transfer the APK to your device and install manually.

## Testing the App

### User Flow

1. **Register** a new account
   - Email: test@example.com
   - Password: password123 (min 8 chars)

2. **Login** with credentials

3. **Create tasks** using the + button

4. **Filter tasks** by status using the filter icon

5. **Search tasks** using the search bar

6. **Toggle status** by tapping the circle icon

7. **Edit tasks** by tapping the edit icon

8. **Delete tasks** by tapping the delete icon (with confirmation)

9. **Pull to refresh** to reload tasks

10. **Scroll down** to load more tasks (pagination)

11. **Logout** using the logout icon

### Testing Scenarios

- **Offline Mode**: Disable network → See error messages
- **Token Expiry**: Wait 15+ minutes → Automatic token refresh
- **Invalid Credentials**: Wrong password → See error message
- **Form Validation**: Empty fields → See validation errors
- **Optimistic Updates**: Toggle task → Immediate UI update
- **Empty State**: Delete all tasks → See empty state UI

## Code Generation

This project uses code generation for:
- **freezed**: Immutable data classes with copyWith, equality
- **json_serializable**: JSON serialization/deserialization

**Run code generation:**

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

**Watch mode** (auto-generate on file changes):

```bash
flutter pub run build_runner watch --delete-conflicting-outputs
```

## Common Issues & Solutions

### Issue: Cannot connect to API

**Solution**: 
- For Android Emulator, use `http://10.0.2.2:3000`
- For physical device, use your machine's local IP (find with `ipconfig` or `ifconfig`)
- Ensure backend server is running
- Check firewall settings

### Issue: Build fails with signature errors

**Solution**:
- Verify `key.properties` file exists and has correct values
- Ensure keystore file path is absolute
- Check keystore password is correct

### Issue: Code generation not working

**Solution**:
```bash
flutter pub get
flutter clean
flutter pub run build_runner build --delete-conflicting-outputs
```

### Issue: Hot reload not working

**Solution**:
- Use hot restart (R) instead
- Restart the app completely
- Check for syntax errors

## Performance Optimization

- Cursor-based pagination for efficient loading
- ListView.builder for lazy rendering
- Image caching (if images added)
- Debounced search input
- Optimistic UI updates
- Efficient state management

## Security Features

- Encrypted token storage (flutter_secure_storage)
- No hardcoded secrets
- HTTPS for production API
- Input validation on all forms
- SQL injection prevention (backend)
- XSS prevention (backend)

## Deployment Checklist

- [ ] Change API base URL to production
- [ ] Generate release keystore
- [ ] Configure signing in build.gradle
- [ ] Test on multiple devices/screen sizes
- [ ] Test offline scenarios
- [ ] Test error scenarios
- [ ] Build release APK
- [ ] Test production APK thoroughly
- [ ] Prepare store listing (screenshots, description)
- [ ] Submit to Google Play Store

## API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /tasks` - Get tasks (with pagination, filter, search)
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get single task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PATCH /tasks/:id/toggle` - Toggle task status

## License

MIT

## Support

For issues or questions, please refer to the backend API documentation or create an issue in the repository.
