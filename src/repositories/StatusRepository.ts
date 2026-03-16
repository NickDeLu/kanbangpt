import { pool } from "../database";

export class StatusRepository {

  static async findStatus(projectId: number, title: string) {
    const result = await pool.query(
      "SELECT * FROM Status WHERE project_id = $1 AND status_title = $2",
      [projectId, title]
    );
    return result.rows[0];
  }

}