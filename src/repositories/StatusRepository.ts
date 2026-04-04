import { pool } from "../database";

export class StatusRepository {

  static async findStatus(projectId: number, title: string) {
    const result = await pool.query(
      "SELECT * FROM Status WHERE project_id = $1 AND status_title = $2",
      [projectId, title]
    );
    return result.rows[0];
  }

  static async listStatuses(projectId: number) {
    const result = await pool.query(
      "SELECT id, status_title, status_order FROM Status WHERE project_id = $1 ORDER BY status_order",
      [projectId]
    );
    return result.rows;
  }

}