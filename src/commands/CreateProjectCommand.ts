import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { pool } from "../database";

export class CreateProjectCommand implements Command {

  constructor(private title: string) {}

  async execute(): Promise<void> {

    const project = await ProjectRepository.createProject(this.title);

    const defaultStatuses = ["To Do", "In Progress", "Done"];

    for (let i = 0; i < defaultStatuses.length; i++) {
      await pool.query(
        `INSERT INTO Status(project_id,status_title,status_order)
         VALUES($1,$2,$3)`,
        [project.id, defaultStatuses[i], i]
      );
    }

  }

}