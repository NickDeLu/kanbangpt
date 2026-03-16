import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class DeleteProjectCommand implements Command {

  constructor(private title: string) {}

  async execute(): Promise<void> {
    await ProjectRepository.deleteProject(this.title);
  }

}