# School Attendance System - High-Level Flowchart

## System Overview

```mermaid
graph TB
    subgraph "Users"
        STUDENT[👨‍🎓 Student]
        PARENT[👨‍👩‍👧 Parent]
        ADMIN[👔 Admin]
    end
    
    subgraph "Applications"
        SA[Student Mobile App<br/>Flutter]
        PA[Parent Mobile App<br/>Flutter]
        WEB[Admin Web Interface<br/>HTML/CSS/JS]
    end
    
    subgraph "Backend System"
        API[REST API Server<br/>Node.js + Express]
        DB[(SQLite<br/>Database)]
    end
    
    subgraph "External"
        PUSHY[Pushy<br/>Push Service]
    end
    
    STUDENT --> SA
    PARENT --> PA
    ADMIN --> WEB
    
    SA -->|HTTPS| API
    PA -->|HTTPS| API
    WEB -->|HTTPS| API
    
    API --> DB
    API --> PUSHY
    PUSHY -.->|Push Notification| PA
    
    style STUDENT fill:#e3f2fd
    style PARENT fill:#f3e5f5
    style ADMIN fill:#fff3e0
    style SA fill:#2196f3,color:#fff
    style PA fill:#9c27b0,color:#fff
    style WEB fill:#ff9800,color:#fff
    style API fill:#4caf50,color:#fff
    style DB fill:#607d8b,color:#fff
    style PUSHY fill:#ff5722,color:#fff
```

## Main Attendance Flow

```mermaid
flowchart TD
    Start([Student Arrives at School]) --> OpenApp[Open Student App]
    OpenApp --> ScanQR[Scan QR Code at Gate]
    ScanQR --> GetGPS[Capture GPS Location]
    GetGPS --> Submit[Submit to Server]
    
    Submit --> Validate{Validate<br/>Request}
    
    Validate -->|Invalid QR| Error1[Show Error:<br/>Invalid QR Code]
    Validate -->|Out of Bounds| Error2[Show Error:<br/>Not at School]
    Validate -->|Duplicate| Error3[Show Error:<br/>Already Logged]
    
    Validate -->|Valid| LogDB[Save to Database]
    LogDB --> Success[Show Success Message]
    
    LogDB --> Notify[Send Notification]
    Notify --> ParentApp[Parent Receives<br/>Push Notification]
    
    LogDB --> UpdateDash[Update Admin Dashboard]
    
    Error1 --> End([End])
    Error2 --> End
    Error3 --> End
    Success --> End
    ParentApp --> End
    UpdateDash --> End
    
    style Start fill:#e8f5e9
    style Success fill:#c8e6c9
    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
    style Error3 fill:#ffcdd2
    style ParentApp fill:#e1bee7
    style UpdateDash fill:#ffe0b2
```

## Core System Processes

```mermaid
flowchart LR
    subgraph "1. Authentication"
        A1[Login] --> A2[Verify Credentials]
        A2 --> A3[Generate JWT Token]
        A3 --> A4[Access Granted]
    end
    
    subgraph "2. Attendance Logging"
        B1[Scan QR Code] --> B2[Validate QR]
        B2 --> B3[Check GPS Location]
        B3 --> B4[Save Record]
    end
    
    subgraph "3. Notification"
        C1[Attendance Logged] --> C2[Get Parent Info]
        C2 --> C3[Send Push via Pushy]
        C3 --> C4[Deliver to Parent]
    end
    
    subgraph "4. Reporting"
        D1[Select Report Type] --> D2[Query Database]
        D2 --> D3[Generate Report]
        D3 --> D4[Export/View]
    end
    
    style A4 fill:#c8e6c9
    style B4 fill:#c8e6c9
    style C4 fill:#c8e6c9
    style D4 fill:#c8e6c9
```

## User Journeys

```mermaid
flowchart TD
    subgraph "Student Journey"
        S1[📱 Open App] --> S2[🔍 Scan QR at Gate]
        S2 --> S3[📍 GPS Verified]
        S3 --> S4[✅ Attendance Logged]
        S4 --> S5[📊 View History]
    end
    
    subgraph "Parent Journey"
        P1[📱 Receive Notification] --> P2[👀 View Alert]
        P2 --> P3[📋 Check Attendance History]
        P3 --> P4[📈 View Statistics]
    end
    
    subgraph "Admin Journey"
        A1[💻 Login to Dashboard] --> A2[📊 View Today's Stats]
        A2 --> A3[📑 Generate Reports]
        A3 --> A4[⚙️ Manage QR Codes]
        A4 --> A5[📥 Export Data]
    end
    
    S4 -.->|Triggers| P1
    S4 -.->|Updates| A2
    
    style S4 fill:#c8e6c9
    style P2 fill:#e1bee7
    style A2 fill:#ffe0b2
```

## Data Flow

```mermaid
flowchart LR
    Input[📱 Student Scans QR] --> Process[⚙️ Backend Processing]
    
    Process --> Output1[💾 Database Record]
    Process --> Output2[🔔 Parent Notification]
    Process --> Output3[📊 Admin Dashboard]
    
    Output1 --> Report[📈 Reports & Analytics]
    
    style Input fill:#e3f2fd
    style Process fill:#c8e6c9
    style Output1 fill:#fff9c4
    style Output2 fill:#f8bbd0
    style Output3 fill:#ffccbc
    style Report fill:#d1c4e9
```

## Security & Validation Layers

```mermaid
flowchart TD
    Request[📨 Incoming Request] --> Layer1{🔒 HTTPS?}
    Layer1 -->|No| Reject[❌ Reject]
    Layer1 -->|Yes| Layer2{🎫 Valid Token?}
    
    Layer2 -->|No| Reject
    Layer2 -->|Yes| Layer3{✅ Valid Data?}
    
    Layer3 -->|No| Reject
    Layer3 -->|Yes| Layer4{📍 Location Valid?}
    
    Layer4 -->|No| Reject
    Layer4 -->|Yes| Process[✅ Process Request]
    
    Process --> Success[✅ Success Response]
    Reject --> Error[❌ Error Response]
    
    style Request fill:#e3f2fd
    style Process fill:#c8e6c9
    style Success fill:#a5d6a7
    style Reject fill:#ef9a9a
    style Error fill:#ffcdd2
```

## Complete End-to-End Flow

```mermaid
sequenceDiagram
    participant Student
    participant StudentApp
    participant Backend
    participant Database
    participant Pushy
    participant ParentApp
    participant Admin
    
    Student->>StudentApp: Open & Scan QR
    StudentApp->>StudentApp: Get GPS Location
    StudentApp->>Backend: Submit Attendance
    
    Backend->>Backend: Authenticate & Validate
    Backend->>Database: Check QR Code
    Backend->>Database: Verify Location
    Backend->>Database: Save Attendance Log
    
    Database-->>Backend: Success
    Backend-->>StudentApp: Attendance Confirmed
    StudentApp-->>Student: Show Success
    
    Backend->>Database: Get Parent Info
    Database-->>Backend: Parent Details
    Backend->>Pushy: Send Notification
    Pushy->>ParentApp: Push Notification
    ParentApp-->>ParentApp: Display Alert
    
    Admin->>Backend: Request Dashboard Data
    Backend->>Database: Query Attendance
    Database-->>Backend: Attendance Records
    Backend-->>Admin: Display Statistics
```

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        F1[Student App<br/>Flutter/Dart]
        F2[Parent App<br/>Flutter/Dart]
        F3[Admin Web<br/>HTML/CSS/JS]
    end
    
    subgraph "Backend"
        B1[Node.js]
        B2[Express.js]
        B3[JWT Auth]
        B4[REST API]
    end
    
    subgraph "Data"
        D1[SQLite Database]
        D2[File Storage]
    end
    
    subgraph "External"
        E1[Pushy API]
        E2[QR Scanner]
        E3[GPS/Location]
    end
    
    F1 --> B4
    F2 --> B4
    F3 --> B4
    
    B4 --> B1
    B1 --> B2
    B2 --> B3
    B2 --> D1
    
    B2 --> E1
    F1 --> E2
    F1 --> E3
    
    style F1 fill:#42a5f5
    style F2 fill:#ab47bc
    style F3 fill:#ffa726
    style B1 fill:#66bb6a
    style D1 fill:#78909c
    style E1 fill:#ff7043
```

## Database Schema Overview

```mermaid
erDiagram
    STUDENTS ||--o{ ATTENDANCE_LOGS : creates
    PARENTS ||--o{ PARENT_STUDENT_LINKS : has
    STUDENTS ||--o{ PARENT_STUDENT_LINKS : linked_to
    QR_CODES ||--o{ ATTENDANCE_LOGS : used_in
    PARENTS ||--o{ PUSH_TOKENS : owns
    
    STUDENTS {
        int id
        string student_id
        string name
        string email
    }
    
    PARENTS {
        int id
        string name
        string email
    }
    
    ATTENDANCE_LOGS {
        int id
        int student_id
        int qr_code_id
        float latitude
        float longitude
        datetime entry_time
    }
    
    QR_CODES {
        int id
        string code
        string gate_name
        boolean is_active
    }
```

## Key Features Summary

```mermaid
mindmap
  root((School Attendance<br/>System))
    Student Features
      QR Code Scanning
      GPS Verification
      Attendance History
      Profile Management
    Parent Features
      Push Notifications
      Real-time Alerts
      Attendance Tracking
      Multiple Students
    Admin Features
      Dashboard Analytics
      Report Generation
      QR Code Management
      Student Management
      Export Data
    Security
      JWT Authentication
      HTTPS Encryption
      Location Validation
      Rate Limiting
```
