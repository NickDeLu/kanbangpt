import { pool } from "../database";

export class ProjectRepository {

  static async createProject(title: string) {
    const result = await pool.query(
      "INSERT INTO Project(project_title) VALUES($1) RETURNING *",
      [title]
    );
    return result.rows[0];
  }

  static async deleteProject(title: string) {
    await pool.query(
      "DELETE FROM Project WHERE project_title = $1",
      [title]
    );
  }

  static async findByTitle(title: string) {
    const result = await pool.query(
      "SELECT * FROM Project WHERE project_title = $1",
      [title]
    );
    return result.rows[0];
  }

}