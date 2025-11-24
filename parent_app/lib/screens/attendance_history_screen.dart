import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/linked_student.dart';
import '../models/attendance_record.dart';
import '../services/attendance_service.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/error_view.dart';

class AttendanceHistoryScreen extends StatefulWidget {
  final LinkedStudent student;

  const AttendanceHistoryScreen({super.key, required this.student});

  @override
  State<AttendanceHistoryScreen> createState() =>
      _AttendanceHistoryScreenState();
}

class _AttendanceHistoryScreenState extends State<AttendanceHistoryScreen> {
  final AttendanceService _attendanceService = AttendanceService();
  List<AttendanceRecord> _records = [];
  bool _isLoading = true;
  String? _errorMessage;
  DateTime? _startDate;
  DateTime? _endDate;
  Map<String, dynamic>? _stats;

  @override
  void initState() {
    super.initState();
    _loadAttendance();
  }

  Future<void> _loadAttendance() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final records = await _attendanceService.getStudentAttendance(
        widget.student.id,
        startDate: _startDate,
        endDate: _endDate,
      );

      final stats = await _attendanceService.getAttendanceStats(
        widget.student.id,
        startDate: _startDate,
        endDate: _endDate,
      );

      setState(() {
        _records = records;
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: _startDate != null && _endDate != null
          ? DateTimeRange(start: _startDate!, end: _endDate!)
          : null,
      builder: (context, child) {
        return Theme(
          data: Theme.of(
            context,
          ).copyWith(colorScheme: Theme.of(context).colorScheme),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _loadAttendance();
    }
  }

  void _clearDateFilter() {
    setState(() {
      _startDate = null;
      _endDate = null;
    });
    _loadAttendance();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text('${widget.student.name}\'s Attendance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _selectDateRange,
            tooltip: 'Filter by date range',
          ),
          if (_startDate != null || _endDate != null)
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: _clearDateFilter,
              tooltip: 'Clear filter',
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadAttendance,
        child: _isLoading
            ? const LoadingIndicator(message: 'Loading attendance records...')
            : _errorMessage != null
            ? ErrorView(
                title: 'Error Loading Attendance',
                message: _errorMessage!,
                onRetry: _loadAttendance,
              )
            : _buildContent(theme),
      ),
    );
  }

  Widget _buildContent(ThemeData theme) {
    return Column(
      children: [
        // Date filter indicator
        if (_startDate != null || _endDate != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            color: theme.colorScheme.primaryContainer,
            child: Row(
              children: [
                Icon(
                  Icons.date_range,
                  size: 20,
                  color: theme.colorScheme.onPrimaryContainer,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Showing: ${_formatDate(_startDate)} - ${_formatDate(_endDate)}',
                    style: TextStyle(
                      color: theme.colorScheme.onPrimaryContainer,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

        // Statistics card
        if (_stats != null) _buildStatsCard(theme),

        // Attendance list
        Expanded(
          child: _records.isEmpty
              ? _buildEmptyState()
              : _buildAttendanceList(theme),
        ),
      ],
    );
  }

  Widget _buildStatsCard(ThemeData theme) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Attendance Summary',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  theme,
                  'Total Entries',
                  _stats!['totalEntries'].toString(),
                  Icons.calendar_today,
                  theme.colorScheme.primary,
                ),
                _buildStatItem(
                  theme,
                  'Valid Location',
                  _stats!['validLocation'].toString(),
                  Icons.check_circle,
                  Colors.green,
                ),
                _buildStatItem(
                  theme,
                  'Invalid Location',
                  _stats!['invalidLocation'].toString(),
                  Icons.error,
                  Colors.red,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
    ThemeData theme,
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Column(
      children: [
        Icon(icon, color: color, size: 32),
        const SizedBox(height: 8),
        Text(
          value,
          style: theme.textTheme.headlineSmall?.copyWith(
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return EmptyStateView(
      title: 'No Attendance Records',
      message: _startDate != null || _endDate != null
          ? 'No records found for the selected date range'
          : 'No attendance records available yet',
      icon: Icons.event_busy,
    );
  }

  Widget _buildAttendanceList(ThemeData theme) {
    // Group records by date
    final groupedRecords = <String, List<AttendanceRecord>>{};
    for (var record in _records) {
      final dateKey = record.formattedDate;
      if (!groupedRecords.containsKey(dateKey)) {
        groupedRecords[dateKey] = [];
      }
      groupedRecords[dateKey]!.add(record);
    }

    // Sort dates in descending order (most recent first)
    final sortedDates = groupedRecords.keys.toList()
      ..sort((a, b) {
        final dateA = _parseFormattedDate(a);
        final dateB = _parseFormattedDate(b);
        return dateB.compareTo(dateA);
      });

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: sortedDates.length,
      itemBuilder: (context, index) {
        final date = sortedDates[index];
        final records = groupedRecords[date]!;

        return _buildDateGroup(theme, date, records);
      },
    );
  }

  Widget _buildDateGroup(
    ThemeData theme,
    String date,
    List<AttendanceRecord> records,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(
            date,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
            ),
          ),
        ),
        ...records.map((record) => _buildAttendanceCard(theme, record)),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildAttendanceCard(ThemeData theme, AttendanceRecord record) {
    final isValid = record.locationValid;
    final statusColor = isValid ? Colors.green : Colors.red;
    final statusIcon = isValid ? Icons.check_circle : Icons.error;
    final statusText = isValid ? 'Valid Location' : 'Invalid Location';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline indicator
            Column(
              children: [
                Container(
                  width: 12,
                  height: 12,
                  decoration: BoxDecoration(
                    color: statusColor,
                    shape: BoxShape.circle,
                  ),
                ),
                Container(
                  width: 2,
                  height: 40,
                  color: theme.colorScheme.outlineVariant,
                ),
              ],
            ),
            const SizedBox(width: 16),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.access_time,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        record.formattedTime,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 16,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                      const SizedBox(width: 4),
                      Text(record.gateName, style: theme.textTheme.bodyMedium),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Location validation status
                  Row(
                    children: [
                      Icon(statusIcon, size: 16, color: statusColor),
                      const SizedBox(width: 4),
                      Text(
                        statusText,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: statusColor,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),

                  // Show coordinates if available
                  if (record.latitude != null && record.longitude != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: Text(
                        'Lat: ${record.latitude!.toStringAsFixed(6)}, '
                        'Lng: ${record.longitude!.toStringAsFixed(6)}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime? date) {
    if (date == null) return 'All';
    return DateFormat('MMM dd, yyyy').format(date);
  }

  DateTime _parseFormattedDate(String formattedDate) {
    final parts = formattedDate.split('/');
    return DateTime(
      int.parse(parts[2]),
      int.parse(parts[1]),
      int.parse(parts[0]),
    );
  }
}
