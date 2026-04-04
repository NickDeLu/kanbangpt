import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class DeleteProjectCommand implements Command {

  constructor(private title: string) {}

  async execute(): Promise<any> {
    await ProjectRepository.deleteProject(this.title);
    return {
      success: true,
      message: `Deleted project ${this.title}`
    };
  }

}