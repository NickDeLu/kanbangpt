import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class ListProjectsCommand implements Command {

  async execute(): Promise<any> {
    const projects = await ProjectRepository.listProjects();
    return projects;
  }

}