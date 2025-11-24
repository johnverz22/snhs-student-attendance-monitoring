import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../services/notification_service.dart';
import 'home_screen.dart';
import 'notifications_screen.dart';
import 'settings_screen.dart';

/// Main navigation screen with bottom navigation bar
/// Provides consistent navigation structure across the Parent App
class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _currentIndex = 0;
  bool _notificationInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeNotifications();
  }

  Future<void> _initializeNotifications() async {
    if (_notificationInitialized) return;

    try {
      final notificationService = Provider.of<NotificationService>(
        context,
        listen: false,
      );

      // Initialize Pushy SDK
      await notificationService.initialize();

      // Register device token with backend
      final authService = AuthService();
      final token = await authService.getToken();

      if (token != null) {
        await notificationService.registerDeviceToken(token);
      }

      _notificationInitialized = true;
    } catch (e) {
      // Silently fail - notifications are not critical
      debugPrint('Error initializing notifications: $e');
      // Mark as initialized to prevent repeated attempts
      _notificationInitialized = true;
    }
  }

  // Navigation screens
  late final List<Widget> _screens = [
    const HomeScreen(showAppBar: false),
    const NotificationsScreen(showAppBar: false),
    const SettingsScreen(showAppBar: false),
  ];

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final notificationService = Provider.of<NotificationService>(context);

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 300),
        switchInCurve: Curves.easeInOut,
        switchOutCurve: Curves.easeInOut,
        transitionBuilder: (Widget child, Animation<double> animation) {
          return FadeTransition(opacity: animation, child: child);
        },
        child: IndexedStack(
          key: ValueKey<int>(_currentIndex),
          index: _currentIndex,
          children: _screens,
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        elevation: 8,
        child: SizedBox(
          height: 60,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context: context,
                icon: Icons.home_outlined,
                selectedIcon: Icons.home,
                label: 'Home',
                index: 0,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.notifications_outlined,
                selectedIcon: Icons.notifications,
                label: 'Notifications',
                index: 1,
                badge: notificationService.unreadCount > 0
                    ? notificationService.unreadCount
                    : null,
              ),
              _buildNavItem(
                context: context,
                icon: Icons.settings_outlined,
                selectedIcon: Icons.settings,
                label: 'Settings',
                index: 2,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    required int index,
    int? badge,
  }) {
    final theme = Theme.of(context);
    final isSelected = _currentIndex == index;
    final color = isSelected
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurfaceVariant;

    return Expanded(
      child: InkWell(
        onTap: () => _onTabTapped(index),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            badge != null
                ? Badge(
                    label: Text('$badge'),
                    child: Icon(
                      isSelected ? selectedIcon : icon,
                      color: color,
                      size: 24,
                    ),
                  )
                : Icon(
                    isSelected ? selectedIcon : icon,
                    color: color,
                    size: 24,
                  ),
            const SizedBox(height: 4),
            Text(
              label,
              style: theme.textTheme.labelSmall?.copyWith(
                color: color,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
