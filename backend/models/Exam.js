import { pool } from '../config/db.js';

export class Exam {
  constructor(id, title, description, date, duration, createdAt, updatedAt) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.date = date; // Date of the exam
    this.duration = duration; // Duration in minutes
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({ title, description, date, duration }) {
    const [result] = await pool.execute(
      'INSERT INTO exams (title, description, date, duration) VALUES (?, ?, ?, ?)',
      [title, description, date, duration]
    );
    return new Exam(result.insertId, title, description, date, duration, new Date(), new Date());
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM exams WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Exam(
      row.id,
      row.title,
      row.description,
      row.date,
      row.duration,
      row.created_at,
      row.updated_at
    );
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM exams');
    return rows.map(row => new Exam(
      row.id,
      row.title,
      row.description,
      row.date,
      row.duration,
      row.created_at,
      row.updated_at
    ));
  }

  async update() {
    await pool.execute(
      'UPDATE exams SET title = ?, description = ?, date = ?, duration = ? WHERE id = ?',
      [this.title, this.description, this.date, this.duration, this.id]
    );
  }

  async delete() {
    await pool.execute('DELETE FROM exams WHERE id = ?', [this.id]);
  }
}
