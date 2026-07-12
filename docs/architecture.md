# FocusFlow - Architecture & Integration Contract

This document outlines the API contract between the frontend dashboard and the serverless AWS Lambda backend.

## 1. Sequence Diagram

```
[React App] ────( VITE_API_URL/plan )───> [API Gateway] ────> [AWS Lambda] ────> [Amazon Bedrock]
     │                                                                                │
     │<──( JSON ProductivityPlan Response )<─── [Return JSON] <───────────────────────┘
```

## 2. API Schema

### Endpoint
`POST /plan`

### Request Body
```json
{
  "tasks": [
    {
      "id": "uuid-string",
      "name": "Task Name",
      "category": "Work",
      "priority": "high",
      "deadline": "2026-07-20",
      "duration": 2.5,
      "notes": "Context notes",
      "status": "todo",
      "createdAt": "ISO Date"
    }
  ]
}
```

### Response Body (`ProductivityPlan`)
```json
{
  "priorityRanking": [
    {
      "id": "uuid-string",
      "taskName": "Task Name",
      "reason": "Prioritization analysis",
      "order": 1
    }
  ],
  "timeline": [
    {
      "timeRange": "09:00–11:30",
      "taskName": "Task Name"
    }
  ],
  "estimatedFocusHours": 2.5,
  "recommendations": [
    "Work peak hours first.",
    "Take active cognitive breaks."
  ]
}
```
