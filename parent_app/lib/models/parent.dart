class Parent {
  final int id;
  final String name;
  final String email;
  final String? phone;

  Parent({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
  });

  factory Parent.fromJson(Map<String, dynamic> json) {
    return Parent(
      id: json['id'],
      name: json['name'],
      email: json['email'],
      phone: json['phone'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name, 'email': email, 'phone': phone};
  }
}
