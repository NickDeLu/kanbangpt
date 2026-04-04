import { Command } from "./Command";
import { TaskRepository } from "../repositories/TaskRepository";

export class ListTasksCommand implements Command {

  constructor(private projectTitle: string) {}

  async execute(): Promise<any> {
    const tasks = await TaskRepository.listTasks(this.projectTitle);
    return tasks;
  }

}