import { Command } from "./Command";
import { StatusRepository } from "../repositories/StatusRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";

export class ListStatusesCommand implements Command {

  constructor(private projectTitle: string) {}

  async execute(): Promise<any> {

    const project = await ProjectRepository.findByTitle(this.projectTitle);

    if (!project) {
      throw new Error(`Project '${this.projectTitle}' not found`);
    }

    const statuses = await StatusRepository.listStatuses(project.id);

    return statuses.map(status => ({
      id: status.id,
      title: status.status_title,
      order: status.status_order
    }));

  }

}