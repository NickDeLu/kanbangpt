import { Command } from "./Command";
import { ProjectRepository } from "../repositories/ProjectRepository";
import { TaskRepository } from "../repositories/TaskRepository";

export class SummarizeProjectCommand implements Command {

  constructor(private projectTitle: string) {}

  async execute(): Promise<any> {
    const project = await ProjectRepository.findByTitle(this.projectTitle);

    if (!project) {
      return `Project '${this.projectTitle}' does not exist.`;
    }

    const tasks = await TaskRepository.listTasks(this.projectTitle);

    if (!tasks.length) {
      return `Project '${this.projectTitle}' exists but has no tasks yet.`;
    }

    const grouped: { [status: string]: string[] } = {};
    for (const task of tasks) {
      if (!grouped[task.status_title]) {
        grouped[task.status_title] = [];
      }
      grouped[task.status_title].push(task.description || `Task ${task.id}`);
    }

    const statusSummaries = Object.entries(grouped)
      .map(([status, descriptions]) => `- ${status}: ${descriptions.length} task(s) (${descriptions.join(", ")})`)
      .join("\n");

    return `Project '${this.projectTitle}' has ${tasks.length} task(s).\n${statusSummaries}`;
  }

}