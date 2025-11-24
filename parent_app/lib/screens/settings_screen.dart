import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_provider.dart';
import '../services/notification_service.dart';
import 'login_screen.dart';
import 'manage_students_screen.dart';

class SettingsScreen extends StatelessWidget {
  final bool showAppBar;

  const SettingsScreen({super.key, this.showAppBar = true});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final notificationService = Provider.of<NotificationService>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: showAppBar ? AppBar(title: const Text('Settings')) : null,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.symmetric(vertical: 16),
          children: [
            // Header with app bar when not showing default app bar
            if (!showAppBar)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                child: Text(
                  'Settings',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

            // Account Section
            _buildSectionHeader(context, 'Account'),
            _buildAccountCard(context, authProvider),
            const SizedBox(height: 24),

            // Notifications Section
            _buildSectionHeader(context, 'Notifications'),
            _buildNotificationSettings(context, notificationService),
            const SizedBox(height: 24),

            // About Section
            _buildSectionHeader(context, 'About'),
            _buildAboutCard(context),
            const SizedBox(height: 24),

            // Logout Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: FilledButton.tonal(
                onPressed: () =>
                    _handleLogout(context, authProvider, notificationService),
                style: FilledButton.styleFrom(
                  backgroundColor: theme.colorScheme.errorContainer,
                  foregroundColor: theme.colorScheme.onErrorContainer,
                ),
                child: const Text('Logout'),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          fontWeight: FontWeight.bold,
          color: Theme.of(context).colorScheme.primary,
        ),
      ),
    );
  }

  Widget _buildAccountCard(BuildContext context, AuthProvider authProvider) {
    final theme = Theme.of(context);
    final parent = authProvider.parent;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: theme.colorScheme.primaryContainer,
                  child: Icon(
                    Icons.person,
                    size: 32,
                    color: theme.colorScheme.onPrimaryContainer,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        parent?.name ?? 'Parent',
                        style: theme.textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        parent?.email ?? '',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      if (parent?.phone != null) ...[
                        const SizedBox(height: 2),
                        Text(
                          parent!.phone!,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Divider(color: theme.colorScheme.outlineVariant),
            const SizedBox(height: 8),
            InkWell(
              onTap: () => _navigateToManageStudents(context),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Icon(
                      Icons.family_restroom,
                      size: 20,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${authProvider.students.length} Linked Student${authProvider.students.length != 1 ? 's' : ''}',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Icon(Icons.chevron_right, color: theme.colorScheme.primary),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationSettings(
    BuildContext context,
    NotificationService notificationService,
  ) {
    final theme = Theme.of(context);

    return Card(
      child: Column(
        children: [
          ListTile(
            leading: Icon(
              Icons.notifications_active,
              color: theme.colorScheme.primary,
            ),
            title: const Text('Push Notifications'),
            subtitle: Text(
              notificationService.isInitialized ? 'Enabled' : 'Disabled',
              style: TextStyle(
                color: notificationService.isInitialized
                    ? Colors.green
                    : Colors.red,
                fontWeight: FontWeight.w500,
              ),
            ),
            trailing: Icon(
              notificationService.isInitialized
                  ? Icons.check_circle
                  : Icons.error,
              color: notificationService.isInitialized
                  ? Colors.green
                  : Colors.red,
            ),
          ),
          Divider(
            height: 1,
            indent: 72,
            color: theme.colorScheme.outlineVariant,
          ),
          ListTile(
            leading: Icon(Icons.history, color: theme.colorScheme.primary),
            title: const Text('Notification History'),
            subtitle: Text(
              '${notificationService.notifications.length} total notifications',
            ),
            trailing: TextButton(
              onPressed: notificationService.notifications.isEmpty
                  ? null
                  : () => _showClearConfirmation(context, notificationService),
              child: const Text('Clear'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAboutCard(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      child: Column(
        children: [
          ListTile(
            leading: Icon(Icons.info_outline, color: theme.colorScheme.primary),
            title: const Text('App Version'),
            subtitle: const Text('1.0.0'),
          ),
          Divider(
            height: 1,
            indent: 72,
            color: theme.colorScheme.outlineVariant,
          ),
          ListTile(
            leading: Icon(Icons.school, color: theme.colorScheme.primary),
            title: const Text('School Attendance System'),
            subtitle: const Text('Parent Portal'),
          ),
        ],
      ),
    );
  }

  void _navigateToManageStudents(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const ManageStudentsScreen()),
    );
  }

  void _showClearConfirmation(
    BuildContext context,
    NotificationService notificationService,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Notification History'),
        content: const Text(
          'Are you sure you want to clear all notification history? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              notificationService.clearAll();
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('Notification history cleared'),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              );
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogout(
    BuildContext context,
    AuthProvider authProvider,
    NotificationService notificationService,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Logout'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      // Clear notification data on logout
      await notificationService.clearStoredData();
      await authProvider.logout();

      if (context.mounted) {
        // Close loading dialog
        Navigator.of(context).pop();

        // Navigate to login screen
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }
}
