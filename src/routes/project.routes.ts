import { Router, Request, Response } from "express";
import { ProjectModel } from "../models/project";

const router = Router();

// GET all projects
router.get("/", async (_req: Request, res: Response) => {
  const projects = await ProjectModel.getAll();
  res.json(projects);
});

export default router;