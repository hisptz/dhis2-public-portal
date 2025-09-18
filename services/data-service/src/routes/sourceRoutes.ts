import { Router } from "express";
import { testDHIS2Route } from "../services/dhis2Routes";
import { AxiosError } from "axios";

const dhis2routes = Router();

dhis2routes.get("/", (req, res) => {
	//Return list of configured routes
	res.json([]);
});

dhis2routes.get("/:id/test", async (req, res) => {
	const id = req.params.id;
	try {
		const testResults = await testDHIS2Route(id);
		if (testResults) {
			res.json({
				status: "ok",
				success: true,
			});
			return;
		} else {
			res.json({
				status: "failed",
				message: "Test failed, Internal server error",
			});
		}
	} catch (e) {
		//The test has failed
		if (e instanceof AxiosError) {
			res.json({
				status: "failed",
				details: e.response?.data,
				message: e.message,
			});
		}
	}
});
export { dhis2routes };
