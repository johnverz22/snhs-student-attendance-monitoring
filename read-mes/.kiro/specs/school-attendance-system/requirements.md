# Requirements Document

## Introduction

This document defines the requirements for a School Attendance Logging System that enables students to check in at school gates using QR code scanning with GPS verification, while providing real-time notifications to parents and comprehensive reporting capabilities for administrators.

## Glossary

- **Student App**: The Flutter mobile application used by students to scan QR codes and log attendance
- **Parent App**: The Flutter mobile application used by parents to receive attendance notifications
- **Server**: The Node.js backend system that processes attendance, validates location, and manages data
- **Admin Interface**: The web-based interface for viewing logs and generating reports
- **QR Code**: Quick Response code displayed at school gates for attendance scanning
- **GPS Coordinates**: Geographic location data from the student's mobile device
- **School Boundary**: The defined geographic area that constitutes valid school grounds
- **Pushy Service**: The push notification service used for real-time parent alerts
- **Attendance Log**: A record of a student's entry into school with timestamp and location
- **SQLite Database**: The relational database system storing all application data

## Requirements

### Requirement 1

**User Story:** As a student, I want to create an account and log in to the Student App, so that I can use the attendance system

#### Acceptance Criteria

1. THE Student App SHALL provide a registration interface for creating new student accounts
2. WHEN a student submits registration details, THE Student App SHALL validate required fields before account creation
3. THE Student App SHALL provide a login interface accepting student credentials
4. WHEN login credentials are valid, THE Student App SHALL grant access to the main application features
5. THE Student App SHALL store authentication tokens securely on the device


### Requirement 2

**User Story:** As a student, I want to save my basic details in the app, so that my information is available for attendance tracking

#### Acceptance Criteria

1. THE Student App SHALL provide an interface for entering student profile information
2. THE Student App SHALL store student name, grade, contact information, and parent details
3. WHEN a student updates profile information, THE Student App SHALL synchronize changes with the Server
4. THE Student App SHALL validate profile data format before submission
5. THE Student App SHALL display current profile information for review and editing

### Requirement 3

**User Story:** As a student, I want to scan a QR code at the school gate, so that my attendance is recorded

#### Acceptance Criteria

1. THE Student App SHALL provide a QR code scanning interface accessible from the main screen
2. WHEN the QR scanner is activated, THE Student App SHALL request camera permissions if not already granted
3. WHEN a QR code is detected, THE Student App SHALL decode the QR code content
4. THE Student App SHALL capture the device GPS coordinates at the time of QR code scan
5. WHEN QR code and GPS data are captured, THE Student App SHALL transmit both to the Server for validation

### Requirement 4

**User Story:** As a student, I want my location verified when scanning the QR code, so that attendance is only recorded when I am physically at school

#### Acceptance Criteria

1. WHEN the Server receives a QR scan request, THE Server SHALL extract GPS coordinates from the request
2. THE Server SHALL compare received GPS coordinates against stored school boundary coordinates
3. IF GPS coordinates fall outside school boundaries, THEN THE Server SHALL reject the attendance entry
4. WHEN GPS coordinates are within school boundaries, THE Server SHALL proceed with attendance validation
5. THE Server SHALL return location validation status to the Student App


### Requirement 5

**User Story:** As a student, I want to receive confirmation when my attendance is logged, so that I know the check-in was successful

#### Acceptance Criteria

1. WHEN attendance is successfully recorded, THE Server SHALL send a success response to the Student App
2. THE Student App SHALL display a visual confirmation message upon successful attendance logging
3. IF attendance logging fails, THEN THE Student App SHALL display an error message with failure reason
4. THE Student App SHALL show the timestamp of the successful attendance entry
5. THE Student App SHALL maintain a local history of recent attendance entries

### Requirement 6

**User Story:** As a parent, I want to create an account and log in to the Parent App, so that I can monitor my child's attendance

#### Acceptance Criteria

1. THE Parent App SHALL provide a registration interface for creating parent accounts
2. THE Parent App SHALL link parent accounts to one or more student accounts during registration
3. THE Parent App SHALL provide a login interface accepting parent credentials
4. WHEN login credentials are valid, THE Parent App SHALL grant access to attendance monitoring features
5. THE Parent App SHALL store authentication tokens securely on the device

### Requirement 7

**User Story:** As a parent, I want to receive real-time notifications when my child enters school, so that I am informed of their arrival

#### Acceptance Criteria

1. WHEN a student attendance entry is successfully logged, THE Server SHALL trigger a notification to linked parent accounts
2. THE Server SHALL use Pushy Service to deliver push notifications to parent devices
3. THE Parent App SHALL register the device with Pushy Service upon login
4. WHEN a push notification is received, THE Parent App SHALL display the notification with student name and entry timestamp
5. THE Parent App SHALL maintain a notification history accessible within the application


### Requirement 8

**User Story:** As a parent, I want to view my child's attendance history in the app, so that I can track their school attendance patterns

#### Acceptance Criteria

1. THE Parent App SHALL display a list of attendance entries for linked students
2. THE Parent App SHALL show entry date, time, and location validation status for each attendance record
3. THE Parent App SHALL provide filtering options for viewing attendance by date range
4. WHEN a parent selects a student, THE Parent App SHALL display that student's complete attendance history
5. THE Parent App SHALL refresh attendance data when the application is opened

### Requirement 9

**User Story:** As a server administrator, I want the system to validate QR codes, so that only authorized codes trigger attendance logging

#### Acceptance Criteria

1. THE Server SHALL store valid QR code identifiers in the SQLite Database
2. WHEN a QR scan request is received, THE Server SHALL verify the QR code against stored valid codes
3. IF the QR code is not recognized, THEN THE Server SHALL reject the attendance request
4. THE Server SHALL check QR code expiration timestamps if time-limited codes are configured
5. WHEN QR code validation succeeds, THE Server SHALL proceed to location verification

### Requirement 10

**User Story:** As a server administrator, I want to configure school location boundaries, so that attendance is only recorded within valid geographic areas

#### Acceptance Criteria

1. THE Server SHALL store school boundary coordinates in the SQLite Database
2. THE Server SHALL support configuration of school location as latitude, longitude, and radius
3. THE Server SHALL calculate distance between received GPS coordinates and school center point
4. WHEN calculated distance exceeds configured radius, THE Server SHALL reject the attendance entry
5. THE Server SHALL log all location validation attempts with results


### Requirement 11

**User Story:** As a server administrator, I want all data stored in SQLite, so that the system has a reliable and simple database solution

#### Acceptance Criteria

1. THE Server SHALL use SQLite as the exclusive database system
2. THE Server SHALL create database tables for students, parents, attendance logs, QR codes, and school configuration
3. THE Server SHALL implement database schema with appropriate relationships and constraints
4. THE Server SHALL handle database connections with proper error handling
5. THE Server SHALL perform database backups on a configurable schedule

### Requirement 12

**User Story:** As an administrator, I want to access a web interface to view attendance logs, so that I can monitor school attendance

#### Acceptance Criteria

1. THE Admin Interface SHALL provide a login page for administrator authentication
2. WHEN an administrator logs in successfully, THE Admin Interface SHALL display the main dashboard
3. THE Admin Interface SHALL show a summary of daily attendance statistics on the dashboard
4. THE Admin Interface SHALL provide a searchable table of attendance logs with date, student name, and timestamp
5. THE Admin Interface SHALL use modern styling with clean spacing, smooth colors, and clear typography

### Requirement 13

**User Story:** As an administrator, I want to search for specific students in the interface, so that I can quickly find attendance records

#### Acceptance Criteria

1. THE Admin Interface SHALL provide a search input field on the logs page
2. WHEN an administrator enters search text, THE Admin Interface SHALL filter displayed records in real-time
3. THE Admin Interface SHALL search across student name, student ID, and date fields
4. THE Admin Interface SHALL display search results with highlighting of matched terms
5. THE Admin Interface SHALL show a message when no records match the search criteria


### Requirement 14

**User Story:** As an administrator, I want to generate daily attendance reports, so that I can review attendance for a specific day

#### Acceptance Criteria

1. THE Server SHALL provide an API endpoint for retrieving daily attendance reports
2. WHEN a daily report is requested, THE Server SHALL return all attendance entries for the specified date
3. THE Admin Interface SHALL display daily reports with student name, entry time, and validation status
4. THE Admin Interface SHALL provide a date picker for selecting the report date
5. THE Admin Interface SHALL allow downloading daily reports in CSV format

### Requirement 15

**User Story:** As an administrator, I want to generate weekly attendance reports, so that I can analyze attendance patterns over a week

#### Acceptance Criteria

1. THE Server SHALL provide an API endpoint for retrieving weekly attendance reports
2. WHEN a weekly report is requested, THE Server SHALL return attendance entries for the specified week
3. THE Admin Interface SHALL display weekly reports grouped by day with attendance counts
4. THE Admin Interface SHALL calculate and display weekly attendance statistics
5. THE Admin Interface SHALL allow downloading weekly reports in CSV format

### Requirement 16

**User Story:** As an administrator, I want to generate monthly attendance reports, so that I can track long-term attendance trends

#### Acceptance Criteria

1. THE Server SHALL provide an API endpoint for retrieving monthly attendance reports
2. WHEN a monthly report is requested, THE Server SHALL return attendance entries for the specified month
3. THE Admin Interface SHALL display monthly reports with daily attendance summaries
4. THE Admin Interface SHALL calculate monthly attendance percentages and trends
5. THE Admin Interface SHALL allow downloading monthly reports in CSV format


### Requirement 17

**User Story:** As an administrator, I want to generate per-student attendance logs, so that I can review individual student attendance history

#### Acceptance Criteria

1. THE Server SHALL provide an API endpoint for retrieving per-student attendance logs
2. WHEN a per-student report is requested, THE Server SHALL return all attendance entries for the specified student
3. THE Admin Interface SHALL display per-student logs with date, time, and location validation status
4. THE Admin Interface SHALL provide a student selector or search for choosing the target student
5. THE Admin Interface SHALL allow downloading per-student logs in CSV format

### Requirement 18

**User Story:** As a developer, I want the Student App to have a clean modern design, so that students have a positive user experience

#### Acceptance Criteria

1. THE Student App SHALL use a consistent color scheme throughout the application
2. THE Student App SHALL implement smooth transitions between screens
3. THE Student App SHALL use clear typography with appropriate font sizes and weights
4. THE Student App SHALL provide intuitive navigation with recognizable icons
5. THE Student App SHALL follow Flutter material design guidelines for UI components

### Requirement 19

**User Story:** As a developer, I want the Parent App to have a simple modern layout, so that parents can easily navigate the application

#### Acceptance Criteria

1. THE Parent App SHALL use a minimal interface design with essential features prominently displayed
2. THE Parent App SHALL implement a consistent visual style matching modern mobile design patterns
3. THE Parent App SHALL use clear labels and intuitive icons for all navigation elements
4. THE Parent App SHALL provide responsive layouts that adapt to different screen sizes
5. THE Parent App SHALL follow Flutter material design guidelines for UI components


### Requirement 20

**User Story:** As a system operator, I want the Server to handle errors gracefully, so that the system remains stable under various conditions

#### Acceptance Criteria

1. THE Server SHALL validate all incoming API requests for required fields and data types
2. WHEN invalid data is received, THE Server SHALL return appropriate HTTP error codes with descriptive messages
3. THE Server SHALL log all errors with timestamps and context information
4. THE Server SHALL handle database connection failures with retry logic
5. THE Server SHALL return user-friendly error messages to client applications

### Requirement 21

**User Story:** As a system operator, I want the Server to provide RESTful API endpoints, so that client applications can interact with the system consistently

#### Acceptance Criteria

1. THE Server SHALL implement Express.js routing for all API endpoints
2. THE Server SHALL use standard HTTP methods for API operations
3. THE Server SHALL return responses in JSON format
4. THE Server SHALL implement authentication middleware for protected endpoints
5. THE Server SHALL document API endpoints with request and response formats
