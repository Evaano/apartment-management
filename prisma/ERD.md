# AMS
> Generated by [`prisma-markdown`](https://github.com/samchon/prisma-markdown)

- [default](#default)

## default
```mermaid
erDiagram
"User" {
  String id PK
  String email UK
  String name
  String mobile
  String roleId FK
  DateTime createdAt
  DateTime updatedAt
  DateTime deletedAt "nullable"
}
"Lease" {
  String id PK
  String userId FK
  DateTime startDate
  DateTime endDate
  Int rentAmount
  Int securityDeposit
  Int maintenanceFee
  String propertyDetails
  DateTime createdAt
  DateTime updatedAt
  DateTime deletedAt "nullable"
}
"Billing" {
  String id PK
  String leaseId FK
  DateTime paymentDate "nullable"
  DateTime dueDate
  Int amount
  String status
  String description
  DateTime createdAt
  DateTime updatedAt
  DateTime deletedAt "nullable"
  String filepath "nullable"
}
"Password" {
  String hash
  String userId FK
}
"Role" {
  String id PK
  String name UK
  String permissions
}
"Maintenance" {
  Int id PK
  String details
  String userId FK
  String status
  DateTime createdAt
  DateTime updatedAt
  DateTime deletedAt "nullable"
}
"Notification" {
  String id PK
  String userId FK
  String details
  DateTime dueDate
  Int amount
  DateTime createdAt
  DateTime updatedAt
}
"User" }o--|| "Role" : role
"Lease" |o--|| "User" : user
"Billing" }o--|| "Lease" : lease
"Password" |o--|| "User" : user
"Maintenance" }o--|| "User" : User
"Notification" }o--|| "User" : user
```

### `User`

**Properties**
  - `id`: 
  - `email`: 
  - `name`: 
  - `mobile`: 
  - `roleId`: 
  - `createdAt`: 
  - `updatedAt`: 
  - `deletedAt`: 

### `Lease`

**Properties**
  - `id`: 
  - `userId`: 
  - `startDate`: 
  - `endDate`: 
  - `rentAmount`: 
  - `securityDeposit`: 
  - `maintenanceFee`: 
  - `propertyDetails`: 
  - `createdAt`: 
  - `updatedAt`: 
  - `deletedAt`: 

### `Billing`

**Properties**
  - `id`: 
  - `leaseId`: 
  - `paymentDate`: 
  - `dueDate`: 
  - `amount`: 
  - `status`: 
  - `description`: 
  - `createdAt`: 
  - `updatedAt`: 
  - `deletedAt`: 
  - `filepath`: 

### `Password`

**Properties**
  - `hash`: 
  - `userId`: 

### `Role`

**Properties**
  - `id`: 
  - `name`: 
  - `permissions`: 

### `Maintenance`

**Properties**
  - `id`: 
  - `details`: 
  - `userId`: 
  - `status`: 
  - `createdAt`: 
  - `updatedAt`: 
  - `deletedAt`: 

### `Notification`

**Properties**
  - `id`: 
  - `userId`: 
  - `details`: 
  - `dueDate`: 
  - `amount`: 
  - `createdAt`: 
  - `updatedAt`: 