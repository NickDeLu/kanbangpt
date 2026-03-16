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

}