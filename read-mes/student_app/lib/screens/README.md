# Student App Screens

## Authentication Screens

### LoginScreen (`login_screen.dart`)

Material Design 3 login interface with:

- Email and password input fields
- Form validation
- Password visibility toggle
- Loading state during authentication
- Error message display via SnackBar
- Navigation to registration screen
- Automatic navigation to HomeScreen on success

**Features:**
- Clean, modern UI with rounded corners
- Icon-based input fields
- Responsive layout
- Keyboard-aware scrolling

### RegistrationScreen (`registration_screen.dart`)

Comprehensive registration form with:

- Required fields: Student ID, Name, Email, Password
- Optional fields: Grade, Phone
- Password confirmation with matching validation
- Form validation for all inputs
- Password visibility toggles
- Loading state during registration
- Error message display
- Navigation back to login

**Validation Rules:**
- Email must contain '@'
- Password minimum 8 characters
- Passwords must match
- All required fields must be filled

### HomeScreen (`home_screen.dart`)

Main dashboard after authentication:

- Displays welcome message
- Shows student information (name, ID, grade)
- Logout button in app bar
- Placeholder for QR scanner feature
- Material Design 3 card layouts

## Navigation Flow

```
LoginScreen
    ↓ (Register link)
RegistrationScreen
    ↓ (Success)
HomeScreen
    ↓ (Logout)
LoginScreen
```

## State Management

All screens use Provider to access `AuthProvider`:

```dart
final authProvider = Provider.of<AuthProvider>(context);
```

This provides:
- Authentication state
- Loading indicators
- Error messages
- Student data

## UI Design

Following Material Design 3 guidelines:

- Primary color: Blue (#2196F3)
- Rounded corners (12px radius)
- Filled input fields with light gray background
- Icon-based navigation and actions
- Smooth transitions
- Consistent spacing (8px, 16px, 24px, 32px)
