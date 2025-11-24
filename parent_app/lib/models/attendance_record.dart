class AttendanceRecord {
  final int id;
  final int studentId;
  final String studentName;
  final DateTime entryTime;
  final String gateName;
  final bool locationValid;
  final double? latitude;
  final double? longitude;

  AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.entryTime,
    required this.gateName,
    required this.locationValid,
    this.latitude,
    this.longitude,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['id'],
      studentId: json['student_id'] ?? json['studentId'] ?? 0,
      studentName: json['student_name'] ?? json['studentName'] ?? '',
      entryTime: DateTime.parse(json['entry_time'] ?? json['entryTime']),
      gateName: json['gate_name'] ?? json['gateName'] ?? 'Unknown Gate',
      locationValid:
          json['location_valid'] == 1 ||
          json['location_valid'] == true ||
          json['locationValid'] == true,
      latitude: json['latitude']?.toDouble(),
      longitude: json['longitude']?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'student_name': studentName,
      'entry_time': entryTime.toIso8601String(),
      'gate_name': gateName,
      'location_valid': locationValid,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  String get formattedDate {
    return '${entryTime.day.toString().padLeft(2, '0')}/${entryTime.month.toString().padLeft(2, '0')}/${entryTime.year}';
  }

  String get formattedTime {
    final hour = entryTime.hour > 12 ? entryTime.hour - 12 : entryTime.hour;
    final period = entryTime.hour >= 12 ? 'PM' : 'AM';
    return '${hour.toString().padLeft(2, '0')}:${entryTime.minute.toString().padLeft(2, '0')} $period';
  }

  String get formattedDateTime {
    return '$formattedDate at $formattedTime';
  }
}
