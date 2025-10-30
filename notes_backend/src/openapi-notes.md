# Notes API Sketch

- GET /health
- GET /notes
- GET /notes/search
- GET /notes/{id}
- POST /notes
- PUT /notes/{id}
- DELETE /notes/{id}
- POST /notes/{id}/pin

Schemas:
- Note: { id: string, title: string, content: string, pinned: boolean, updatedAt: string }
