import { pool } from '../config/db.js';

export class Question {
  constructor(id, text, options, correctAnswer, createdAt, updatedAt) {
    this.id = id;
    this.text = text;
    this.options = options; // Array of options
    this.correctAnswer = correctAnswer;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({ text, options, correctAnswer }) {
    const optionsString = JSON.stringify(options);
    const [result] = await pool.execute(
      'INSERT INTO questions (text, options, correct_answer) VALUES (?, ?, ?)',
      [text, optionsString, correctAnswer]
    );
    return new Question(result.insertId, text, options, correctAnswer, new Date(), new Date());
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM questions WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    return new Question(
      row.id,
      row.text,
      JSON.parse(row.options),
      row.correct_answer,
      row.created_at,
      row.updated_at
    );
  }

  static async findAll() {
    const [rows] = await pool.execute('SELECT * FROM questions');
    return rows.map(row => new Question(
      row.id,
      row.text,
      JSON.parse(row.options),
      row.correct_answer,
      row.created_at,
      row.updated_at
    ));
  }

  async update() {
    const optionsString = JSON.stringify(this.options);
    await pool.execute(
      'UPDATE questions SET text = ?, options = ?, correct_answer = ? WHERE id = ?',
      [this.text, optionsString, this.correctAnswer, this.id]
    );
  }

  async delete() {
    await pool.execute('DELETE FROM questions WHERE id = ?', [this.id]);
  }
}
