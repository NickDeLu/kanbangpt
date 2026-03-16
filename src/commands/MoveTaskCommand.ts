import { Command } from "./Command";
import { StatusRepository } from "../repositories/StatusRepository";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { TaskRepository } from "../repositories/TaskRepository";

export class MoveTaskCommand implements Command {

  constructor(
    private taskId: number,
    private projectTitle: string,
    private newStatus: string
  ) {}

  async execute(): Promise<void> {

    const project = await ProjectRepository.findByTitle(this.projectTitle);

    const status = await StatusRepository.findStatus(
      project.id,
      this.newStatus
    );

    await TaskRepository.moveTask(this.taskId, status.id);

  }

}