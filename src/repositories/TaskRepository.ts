import { pool } from "../database";

export class TaskRepository {

  static async createTask(statusId: number, description: string) {
    const result = await pool.query(
      `INSERT INTO Task(status_id, task_description)
       VALUES($1,$2) RETURNING *`,
      [statusId, description]
    );

    return result.rows[0];
  }

  static async moveTask(taskId: number, statusId: number) {
    await pool.query(
      `UPDATE Task SET status_id=$1 WHERE id=$2`,
      [statusId, taskId]
    );
  }

  static async listTasks(projectTitle: string) {
    const result = await pool.query(`
      SELECT t.id, t.task_description as description, s.status_title as status_title, p.project_title as project_title
      FROM Task t
      JOIN Status s ON t.status_id = s.id
      JOIN Project p ON s.project_id = p.id
      WHERE p.project_title = $1
    `, [projectTitle]);
    return result.rows;
  }

}