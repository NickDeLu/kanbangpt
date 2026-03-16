import { Command } from "./Command";
import { CreateProjectCommand } from "./CreateProjectCommand";
import { CreateTaskCommand } from "./CreateTaskCommand";
import { MoveTaskCommand } from "./MoveTaskCommand";
import { DeleteProjectCommand } from "./DeleteProjectCommand";

export class CommandFactory {

  static create(toolCall: any): Command {

    switch (toolCall.tool) {

      case "create_project":
        return new CreateProjectCommand(toolCall.args.title);

      case "create_task":
        return new CreateTaskCommand(
          toolCall.args.project_title,
          toolCall.args.status_title,
          toolCall.args.description
        );

      case "move_task":
        return new MoveTaskCommand(
          toolCall.args.task_id,
          toolCall.args.project_title,
          toolCall.args.new_status
        );

      case "delete_project":
        return new DeleteProjectCommand(
          toolCall.args.project_title
        );

      default:
        throw new Error("Unknown tool");
    }

  }

}