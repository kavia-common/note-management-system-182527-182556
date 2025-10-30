# Notes API Sketch

- GET /health
- GET /api/v1/notes
- GET /api/v1/notes/search
- GET /api/v1/notes/{id}
- POST /api/v1/notes
- PUT /api/v1/notes/{id}
- DELETE /api/v1/notes/{id}
- POST /api/v1/notes/{id}/pin

Schemas:
- Note: { id: string, title: string, content: string, pinned: boolean, updatedAt: string }
