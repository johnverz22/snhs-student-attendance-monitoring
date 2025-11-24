class AttendanceNotification {
  final int? id;
  final String type;
  final int studentId;
  final String studentName;
  final String title;
  final String body;
  final DateTime timestamp;
  final bool isRead;
  final Map<String, dynamic>? data;

  AttendanceNotification({
    this.id,
    required this.type,
    required this.studentId,
    required this.studentName,
    required this.title,
    required this.body,
    required this.timestamp,
    this.isRead = false,
    this.data,
  });

  factory AttendanceNotification.fromJson(Map<String, dynamic> json) {
    return AttendanceNotification(
      id: json['id'],
      type: json['type'] ?? 'attendance',
      studentId: json['studentId'] ?? json['student_id'] ?? 0,
      studentName: json['studentName'] ?? json['student_name'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? '',
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
      isRead: json['isRead'] ?? json['is_read'] ?? false,
      data: json['data'],
    );
  }

  factory AttendanceNotification.fromPushPayload(Map<String, dynamic> payload) {
    final data = payload['data'] ?? {};
    final notification = payload['notification'] ?? {};

    return AttendanceNotification(
      type: data['type'] ?? 'attendance',
      studentId: int.tryParse(data['studentId']?.toString() ?? '0') ?? 0,
      studentName: data['studentName'] ?? '',
      title: notification['title'] ?? '',
      body: notification['body'] ?? '',
      timestamp: data['entryTime'] != null
          ? DateTime.parse(data['entryTime'])
          : DateTime.now(),
      isRead: false,
      data: data,
    );
  }

  factory AttendanceNotification.fromFCMMessage(dynamic message) {
    // Handle both RemoteMessage and Map types
    final Map<String, dynamic> data = message is Map
        ? Map<String, dynamic>.from(message)
        : {
            'data': Map<String, dynamic>.from(message.data ?? {}),
            'notification': {
              'title': message.notification?.title ?? '',
              'body': message.notification?.body ?? '',
            },
          };

    final messageData = Map<String, dynamic>.from(data['data'] ?? {});
    final notification = Map<String, dynamic>.from(data['notification'] ?? {});

    return AttendanceNotification(
      type: messageData['type'] ?? 'attendance',
      studentId: int.tryParse(messageData['studentId']?.toString() ?? '0') ?? 0,
      studentName: messageData['studentName'] ?? '',
      title: notification['title'] ?? '',
      body: notification['body'] ?? '',
      timestamp: messageData['entryTime'] != null
          ? DateTime.parse(messageData['entryTime'])
          : DateTime.now(),
      isRead: false,
      data: messageData,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'studentId': studentId,
      'studentName': studentName,
      'title': title,
      'body': body,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
      'data': data,
    };
  }

  AttendanceNotification copyWith({
    int? id,
    String? type,
    int? studentId,
    String? studentName,
    String? title,
    String? body,
    DateTime? timestamp,
    bool? isRead,
    Map<String, dynamic>? data,
  }) {
    return AttendanceNotification(
      id: id ?? this.id,
      type: type ?? this.type,
      studentId: studentId ?? this.studentId,
      studentName: studentName ?? this.studentName,
      title: title ?? this.title,
      body: body ?? this.body,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      data: data ?? this.data,
    );
  }
}
