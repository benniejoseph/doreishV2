import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DOREISH_DB_PATH || path.join(process.cwd(), 'data', 'doreish.sqlite');

let _db: Database.Database | null = null;

export function db() {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      ts INTEGER NOT NULL,
      source TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT,
      session_key TEXT,
      agent_id TEXT,
      payload_json TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
    CREATE INDEX IF NOT EXISTS idx_events_session_key ON events(session_key);

    CREATE TABLE IF NOT EXISTS task_links (
      id TEXT PRIMARY KEY,
      created_ts INTEGER NOT NULL,
      ruflo_task_id TEXT NOT NULL,
      linear_issue_id TEXT,
      linear_issue_key TEXT,
      payload_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_task_links_ruflo ON task_links(ruflo_task_id);
  `);
  return _db;
}
