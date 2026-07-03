# Upload Documents Integration Plan

## Goal
- Upload PDF/DOC/DOCX (max 5MB) from the /review "Thêm" flow without auth.
- Send multipart form-data (file + required title).
- Reset form and show success message on upload success.

## Files to Update
- src/config/api.js
- src/services/documentsService.js (new)
- src/components/popup/addSubject.jsx
- src/pages/user/dashboard/review/listSubjects.jsx

## Steps
1. Add document upload endpoint in API config.
2. Create documents service with unauthenticated upload call.
3. Replace "Mã môn học" input with file upload + title in AddSubject.
4. Wire the /review "Thêm" button to upload flow and feedback.
5. Validate file type and size on the client.
