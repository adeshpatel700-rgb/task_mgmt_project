import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/tasks/presentation/screens/task_dashboard_screen.dart';
import '../../features/tasks/presentation/screens/task_form_screen.dart';
import '../../features/tasks/domain/entities/task_entity.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isAuthenticated = authState.status == AuthStatus.authenticated;
      final isLoading = authState.status == AuthStatus.initial ||
          authState.status == AuthStatus.loading;

      // Wait for auth check to complete
      if (isLoading) {
        return null;
      }

      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';

      // Redirect authenticated users away from auth pages
      if (isAuthenticated && isAuthRoute) {
        return '/dashboard';
      }

      // Redirect unauthenticated users to login
      if (!isAuthenticated && !isAuthRoute) {
        return '/login';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const TaskDashboardScreen(),
      ),
      GoRoute(
        path: '/task-form',
        builder: (context, state) {
          final task = state.extra as TaskEntity?;
          return TaskFormScreen(task: task);
        },
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              state.uri.toString(),
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/dashboard'),
              child: const Text('Go to Dashboard'),
            ),
          ],
        ),
      ),
    ),
  );
});
