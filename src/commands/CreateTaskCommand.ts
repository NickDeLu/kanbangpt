import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { StatusRepository } from "../repositories/StatusRepository";
import { TaskRepository } from "../repositories/TaskRepository";

export class CreateTaskCommand implements Command {

  constructor(
    private projectTitle: string,
    private statusTitle: string,
    private description: string
  ) {}

  async execute(): Promise<any> {

    const project = await ProjectRepository.findByTitle(this.projectTitle);

    const status = await StatusRepository.findStatus(
      project.id,
      this.statusTitle
    );

    const task = await TaskRepository.createTask(status.id, this.description);

    return {
      id: task.id,
      description: this.description,
      status_title: this.statusTitle
    };

  }

}