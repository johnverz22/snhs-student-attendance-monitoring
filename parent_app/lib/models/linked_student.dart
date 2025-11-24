class LinkedStudent {
  final int id;
  final String studentId;
  final String name;
  final String? grade;
  final String? section;
  final String? relationship;

  LinkedStudent({
    required this.id,
    required this.studentId,
    required this.name,
    this.grade,
    this.section,
    this.relationship,
  });

  factory LinkedStudent.fromJson(Map<String, dynamic> json) {
    return LinkedStudent(
      id: json['id'],
      studentId: json['student_id'],
      name: json['name'],
      grade: json['grade'],
      section: json['section'],
      relationship: json['relationship'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'student_id': studentId,
      'name': name,
      'grade': grade,
      'section': section,
      'relationship': relationship,
    };
  }
}
