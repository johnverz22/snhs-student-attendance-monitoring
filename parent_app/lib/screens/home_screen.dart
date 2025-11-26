import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_provider.dart';
import '../services/attendance_service.dart';
import '../models/attendance_record.dart';
import 'attendance_history_screen.dart';
import 'manage_students_screen.dart';
import 'test_fcm_screen.dart';

class HomeScreen extends StatelessWidget {
  final bool showAppBar;

  const HomeScreen({super.key, this.showAppBar = true});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sto. Rosario National High School'),
        actions: [
          // Test FCM button
          IconButton(
            icon: const Icon(Icons.bug_report),
            tooltip: 'Test FCM',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const TestFCMScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => _handleRefresh(context, authProvider),
          child: CustomScrollView(
            slivers: [
              // Header with app bar when not showing default app bar
              if (!showAppBar)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome back,',
                          style: theme.textTheme.titleLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          authProvider.parent?.name ?? 'Parent',
                          style: theme.textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: theme.colorScheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Linked Students Section Header
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 24, 24, 8),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          'Linked Students',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (authProvider.students.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.primaryContainer,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${authProvider.students.length}',
                            style: TextStyle(
                              color: theme.colorScheme.onPrimaryContainer,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      IconButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (context) =>
                                  const ManageStudentsScreen(),
                            ),
                          );
                        },
                        icon: const Icon(Icons.add_circle_outline),
                        tooltip: 'Link Student',
                        color: theme.colorScheme.primary,
                      ),
                    ],
                  ),
                ),
              ),

              // Students List or Empty State
              if (authProvider.students.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: _buildEmptyState(context, theme),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final student = authProvider.students[index];
                      return _buildStudentCard(context, theme, student);
                    }, childCount: authProvider.students.length),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.person_off_outlined,
              size: 80,
              color: theme.colorScheme.onSurfaceVariant.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 24),
            Text(
              'No Students Linked',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Link your children to monitor their attendance',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) => const ManageStudentsScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.add),
              label: const Text('Link Student'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentCard(
    BuildContext context,
    ThemeData theme,
    dynamic student,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          InkWell(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (context) =>
                      AttendanceHistoryScreen(student: student),
                ),
              );
            },
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Avatar
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: Icon(
                      Icons.person,
                      size: 28,
                      color: theme.colorScheme.onPrimaryContainer,
                    ),
                  ),
                  const SizedBox(width: 16),

                  // Student Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          student.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'ID: ${student.studentId}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        if (student.grade != null ||
                            student.section != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            [
                              if (student.grade != null)
                                'Grade: ${student.grade}',
                              if (student.section != null)
                                'Section: ${student.section}',
                            ].join(' • '),
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // Chevron
                  Icon(
                    Icons.chevron_right,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ],
              ),
            ),
          ),

          // Recent Attendance Preview
          _StudentAttendancePreview(
            key: ValueKey('attendance_${student.id}'),
            studentId: student.id,
          ),
        ],
      ),
    );
  }

  Future<void> _handleRefresh(
    BuildContext context,
    AuthProvider authProvider,
  ) async {
    try {
      // Refresh students from API
      await authProvider.refreshStudents();

      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Students refreshed'),
            duration: const Duration(seconds: 1),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to refresh: ${e.toString()}'),
            duration: const Duration(seconds: 2),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    }
  }
}

// Widget to show recent attendance preview for a student
class _StudentAttendancePreview extends StatefulWidget {
  final int studentId;

  const _StudentAttendancePreview({super.key, required this.studentId});

  @override
  State<_StudentAttendancePreview> createState() =>
      _StudentAttendancePreviewState();
}

class _StudentAttendancePreviewState extends State<_StudentAttendancePreview> {
  final AttendanceService _attendanceService = AttendanceService();
  List<AttendanceRecord>? _recentRecords;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRecentAttendance();
  }

  @override
  void didUpdateWidget(_StudentAttendancePreview oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reload if student ID changed
    if (oldWidget.studentId != widget.studentId) {
      setState(() {
        _isLoading = true;
        _error = null;
        _recentRecords = null;
      });
      _loadRecentAttendance();
    }
  }

  Future<void> _loadRecentAttendance() async {
    try {
      debugPrint('📊 Loading attendance for student ID: ${widget.studentId}');
      final records = await _attendanceService.getStudentAttendance(
        widget.studentId,
      );

      if (mounted) {
        setState(() {
          _recentRecords = records.take(3).toList();
          _isLoading = false;
        });
        debugPrint(
          '✅ Loaded ${_recentRecords?.length ?? 0} records for student ${widget.studentId}',
        );
      }
    } catch (e) {
      debugPrint(
        '❌ Error loading attendance for student ${widget.studentId}: $e',
      );
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_isLoading) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Center(
          child: SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: theme.colorScheme.primary,
            ),
          ),
        ),
      );
    }

    if (_error != null) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'Unable to load attendance',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.error,
          ),
          textAlign: TextAlign.center,
        ),
      );
    }

    if (_recentRecords == null || _recentRecords!.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Text(
          'No recent attendance records',
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.history,
                size: 16,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 4),
              Text(
                'Recent Attendance',
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ..._recentRecords!.map((record) => _buildRecordItem(theme, record)),
        ],
      ),
    );
  }

  Widget _buildRecordItem(ThemeData theme, AttendanceRecord record) {
    final isValid = record.locationValid;
    final statusColor = isValid ? Colors.green : Colors.red;
    final statusIcon = isValid ? Icons.check_circle : Icons.error;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Icon(statusIcon, size: 14, color: statusColor),
          const SizedBox(width: 6),
          Text(
            record.formattedDate,
            style: theme.textTheme.bodySmall?.copyWith(
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            record.formattedTime,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const Spacer(),
          Text(
            record.gateName,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}
