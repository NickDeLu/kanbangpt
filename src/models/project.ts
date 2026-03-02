import { pool } from '../database'

export interface Project {
  id: number;
  project_title: string;
}

export class ProjectModel {
  static async getAll(): Promise<Project[]> {
    const result = await pool.query("SELECT * FROM Project");
    return result.rows;
  }
}