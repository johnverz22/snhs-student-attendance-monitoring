import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_provider.dart';
import '../services/profile_service.dart';
import '../models/student.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _profileService = ProfileService();

  late TextEditingController _nameController;
  late TextEditingController _gradeController;
  late TextEditingController _sectionController;
  late TextEditingController _phoneController;

  bool _isLoading = false;
  bool _isEditing = false;
  Student? _student;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _gradeController = TextEditingController();
    _sectionController = TextEditingController();
    _phoneController = TextEditingController();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _gradeController.dispose();
    _sectionController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _student = authProvider.student;

    if (_student != null) {
      _nameController.text = _student!.name;
      _gradeController.text = _student!.grade ?? '';
      _sectionController.text = _student!.section ?? '';
      _phoneController.text = _student!.phone ?? '';
    }

    // Sync with server to get latest data
    final response = await _profileService.syncProfile();

    if (response.success && response.student != null) {
      setState(() {
        _student = response.student;
        _nameController.text = _student!.name;
        _gradeController.text = _student!.grade ?? '';
        _sectionController.text = _student!.section ?? '';
        _phoneController.text = _student!.phone ?? '';
      });

      // Update auth provider with fresh data
      authProvider.updateStudent(response.student!);
    }

    setState(() => _isLoading = false);
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    final response = await _profileService.updateProfile(
      name: _nameController.text.trim(),
      grade: _gradeController.text.trim(),
      section: _sectionController.text.trim(),
      phone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (!mounted) return;

    if (response.success) {
      // Update auth provider with updated data
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (response.student != null) {
        authProvider.updateStudent(response.student!);
        setState(() {
          _student = response.student;
          _isEditing = false;
        });
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.message ?? 'Profile updated successfully'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(response.message ?? 'Failed to update profile'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _toggleEdit() {
    setState(() {
      if (_isEditing) {
        // Cancel editing - restore original values
        if (_student != null) {
          _nameController.text = _student!.name;
          _gradeController.text = _student!.grade ?? '';
          _sectionController.text = _student!.section ?? '';
          _phoneController.text = _student!.phone ?? '';
        }
      }
      _isEditing = !_isEditing;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: true,
        actions: [
          if (!_isLoading)
            IconButton(
              icon: Icon(_isEditing ? Icons.close : Icons.edit),
              onPressed: _toggleEdit,
              tooltip: _isEditing ? 'Cancel' : 'Edit Profile',
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadProfile,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(20.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Profile Header
                      CircleAvatar(
                        radius: 60,
                        backgroundColor: theme.colorScheme.primary,
                        child: Text(
                          _student?.name.substring(0, 1).toUpperCase() ?? 'S',
                          style: theme.textTheme.displayMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _student?.name ?? 'Student',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _student?.email ?? '',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),

                      // Profile Information Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.person_outline,
                                    color: theme.colorScheme.primary,
                                    size: 24,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'Personal Information',
                                    style: theme.textTheme.titleLarge?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),

                              // Student ID (Read-only)
                              _buildInfoField(
                                context,
                                icon: Icons.badge,
                                label: 'Student ID',
                                value: _student?.studentId ?? 'N/A',
                                isReadOnly: true,
                              ),
                              const SizedBox(height: 16),

                              // Name Field
                              _buildEditableField(
                                context,
                                controller: _nameController,
                                icon: Icons.person,
                                label: 'Full Name',
                                enabled: _isEditing,
                                validator: (value) {
                                  if (value == null || value.trim().isEmpty) {
                                    return 'Name is required';
                                  }
                                  if (value.trim().length < 2) {
                                    return 'Name must be at least 2 characters';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // Grade Field
                              _buildEditableField(
                                context,
                                controller: _gradeController,
                                icon: Icons.school,
                                label: 'Grade',
                                enabled: _isEditing,
                                validator: (value) {
                                  if (value != null &&
                                      value.isNotEmpty &&
                                      value.trim().length > 20) {
                                    return 'Grade must be less than 20 characters';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // Section Field
                              _buildEditableField(
                                context,
                                controller: _sectionController,
                                icon: Icons.class_,
                                label: 'Section',
                                enabled: _isEditing,
                                validator: (value) {
                                  if (value != null &&
                                      value.isNotEmpty &&
                                      value.trim().length > 20) {
                                    return 'Section must be less than 20 characters';
                                  }
                                  return null;
                                },
                              ),
                              const SizedBox(height: 16),

                              // Phone Field
                              _buildEditableField(
                                context,
                                controller: _phoneController,
                                icon: Icons.phone,
                                label: 'Phone Number',
                                enabled: _isEditing,
                                keyboardType: TextInputType.phone,
                                hintText: '09XX XXX XXXX',
                                validator: (value) {
                                  if (value != null && value.isNotEmpty) {
                                    // Remove spaces for validation
                                    final cleanPhone = value.replaceAll(
                                      ' ',
                                      '',
                                    );
                                    // Philippine mobile format: 09XX XXX XXXX (11 digits starting with 09)
                                    final phoneRegex = RegExp(r'^09\d{9}$');
                                    if (!phoneRegex.hasMatch(cleanPhone)) {
                                      return 'Format: 09XX XXX XXXX';
                                    }
                                  }
                                  return null;
                                },
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Save Button
                      if (_isEditing)
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isLoading ? null : _saveProfile,
                            icon: _isLoading
                                ? const SizedBox(
                                    height: 20,
                                    width: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(Icons.save),
                            label: const Text('Save Changes'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildInfoField(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String value,
    bool isReadOnly = false,
  }) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: theme.colorScheme.primary, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: theme.textTheme.bodyLarge?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEditableField(
    BuildContext context, {
    required TextEditingController controller,
    required IconData icon,
    required String label,
    required bool enabled,
    String? Function(String?)? validator,
    TextInputType? keyboardType,
    String? hintText,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: theme.colorScheme.primary, size: 20),
            const SizedBox(width: 12),
            Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          enabled: enabled,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: enabled ? (hintText ?? 'Enter $label') : controller.text,
            filled: !enabled,
            fillColor: enabled
                ? null
                : theme.colorScheme.surfaceVariant.withOpacity(0.3),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
          style: theme.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.w500,
          ),
          validator: validator,
        ),
      ],
    );
  }
}
