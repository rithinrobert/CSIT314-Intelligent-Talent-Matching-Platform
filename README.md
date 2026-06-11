# TalentMatch Platform - Full Stack Prototype

This project is a CSIT314 second-submission prototype for an Intelligent Talent Matching Platform.
It includes a role-based frontend and a lightweight Express backend with JSON-file storage.

## Roles
- Candidate
- Employer
- Administrator

## Features
- Role-based login/register
- Candidate profile enhancement
- Employer profile and job posting
- Membership logic: Free = Top 10, Premium = Unlimited
- Keyword search, filters, keyword + filter, fuzzy search
- Candidate and job recommendations
- Admin dashboard, user management and job management

## Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Default admin login

```text
Email: admin@talentmatch.com
Password: admin123
Role: Administrator
```

## API Summary

- POST /api/register
- POST /api/login
- GET /api/users
- GET /api/candidates
- PUT /api/candidates/:userId
- GET /api/employers
- PUT /api/employers/:userId
- PUT /api/membership/:userId
- GET /api/jobs
- POST /api/jobs
- DELETE /api/jobs/:jobId
- GET /api/recommendations/jobs/:candidateId
- GET /api/recommendations/candidates/:jobId
- GET /api/search/candidates
- POST /api/applications
- GET /api/applications/:candidateId
- GET /api/admin/stats
```
