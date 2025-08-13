import { Router } from "express";

export const serviceStatusRouter = Router();

enum ServiceStatus {
	IDLE = "idle",
	RUNNING = "running",
	NOT_STARTED = "not_started",
}

serviceStatusRouter.get(`/`, (req, res) => {
	res.json({
		status: ServiceStatus.NOT_STARTED,
	});
});

serviceStatusRouter.get(`/data-upload`, async (req, res) => {
	res.json({
		status: ServiceStatus.NOT_STARTED,
	});
});

serviceStatusRouter.get(`/data-download`, async (req, res) => {
	res.json({
		status: ServiceStatus.NOT_STARTED,
	});
});
