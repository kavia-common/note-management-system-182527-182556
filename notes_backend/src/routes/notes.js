import { Router } from 'express';
import { ValidationError } from '../utils/errorHandler.js';
import {
  listNotes,
  searchNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin
} from '../services/notesService.js';
import {
  noteCreateSchema,
  noteUpdateSchema,
  paginationSchema
} from '../validation/noteSchemas.js';

export const notesRouter = Router();

/**
 * GET /notes
 * Summary: List notes with optional search, pinned filter, and pagination.
 * Query:
 *  - q?: string
 *  - page?: number (default 1)
 *  - pageSize?: number (default 100)
 *  - pinned?: "true" | "false"
 * Returns: { items: Note[], total: number, page: number, pageSize: number }
 */
notesRouter.get('/', async (req, res, next) => {
  try {
    const { error, value } = paginationSchema.validate(req.query, { convert: true });
    if (error) throw new ValidationError('Invalid query parameters', error.details);

    const pinnedFilter =
      typeof value.pinned === 'string'
        ? value.pinned === 'true'
        : undefined;

    const result = await listNotes({
      q: value.q,
      page: value.page,
      pageSize: value.pageSize,
      pinned: pinnedFilter
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /notes/search
 * Summary: Search notes with a simple query param q against title/content.
 * Returns: Note[]
 */
notesRouter.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString();
    const data = await searchNotes(q);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /notes/:id
 * Summary: Get a single note by id.
 * Returns: Note
 */
notesRouter.get('/:id', async (req, res, next) => {
  try {
    const data = await getNote(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /notes
 * Summary: Create a note.
 * Body: { title: string, content: string, pinned?: boolean }
 * Returns: Note
 */
notesRouter.post('/', async (req, res, next) => {
  try {
    const { error, value } = noteCreateSchema.validate(req.body, { convert: true });
    if (error) throw new ValidationError('Invalid request body', error.details);

    const created = await createNote(value);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /notes/:id
 * Summary: Update a note (partial).
 * Body: { title?, content?, pinned? }
 * Returns: Note
 */
notesRouter.put('/:id', async (req, res, next) => {
  try {
    const { error, value } = noteUpdateSchema.validate(req.body, { convert: true });
    if (error) throw new ValidationError('Invalid request body', error.details);

    const updated = await updateNote(req.params.id, {
      ...value,
      updatedAt: new Date().toISOString()
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /notes/:id
 * Summary: Delete a note by id.
 * Returns: 204 No Content
 */
notesRouter.delete('/:id', async (req, res, next) => {
  try {
    await deleteNote(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * POST /notes/:id/pin
 * Summary: Toggle pin for a note by id.
 * Returns: Note
 */
notesRouter.post('/:id/pin', async (req, res, next) => {
  try {
    const note = await togglePin(req.params.id);
    res.json(note);
  } catch (err) {
    next(err);
  }
});
