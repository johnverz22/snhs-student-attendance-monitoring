class Student {
  final int? id;
  final String studentId;
  final String name;
  final String email;
  final String? grade;
  final String? section;
  final String? phone;

  Student({
    this.id,
    required this.studentId,
    required this.name,
    required this.email,
    this.grade,
    this.section,
    this.phone,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      id: json['id'],
      studentId: json['student_id'] ?? json['studentId'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      grade: json['grade'],
      section: json['section'],
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'name': name,
      'email': email,
      'grade': grade,
      'section': section,
      'phone': phone,
    };
  }
}
