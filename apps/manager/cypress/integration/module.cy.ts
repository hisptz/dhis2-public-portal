import { ModuleType } from "@packages/shared/schemas";
import { appMenus } from "../../src/shared/constants/menu";

describe("Modules Page", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	const modulesMenu = appMenus.find((menu) => menu.label === "Modules");

	if (!modulesMenu) {
		throw new Error("Modules menu item not found in appMenus");
	}

	it("should navigate to Modules page via side navigation", () => {
		// Verify Modules menu item exists
		// expect(modulesMenu, "Modules menu item should exist in appMenus").to.exist;

		// Click the Modules menu item
		cy.contains("a", modulesMenu.label).should("be.visible").click();

		// Verify URL
		cy.url().should("include", modulesMenu.href);

		// Verify header
		cy.get("h2, h3").contains(modulesMenu.label).should("be.visible");
	});

	it("should display Modules page UI elements", () => {
		// Navigate to Modules page
		cy.contains("a", modulesMenu.label).click();

		// Verify type selector
		cy.get('select, [data-test="dhis2-uicore-select"]').should(
			"be.visible",
		);

		// Verify table and columns
		cy.get("table").should("be.visible");
		cy.contains("th", "Title").should("be.visible");
		cy.contains("th", "Type").should("be.visible");
		cy.contains("th", "Actions").should("be.visible");
	});

	it("should filter modules by type", () => {
		cy.contains("a", modulesMenu.label).click();

		const filterOptions = [
			{
				label: "VISUALIZATION",
				value: ModuleType.VISUALIZATION,
				urlContains: "type=VISUALIZATION",
			},
			{
				label: "SECTION",
				value: ModuleType.SECTION,
				urlContains: "type=SECTION",
			},
			{
				label: "DOCUMENTS",
				value: ModuleType.DOCUMENTS,
				urlContains: "type=DOCUMENTS",
			},
			{
				label: "STATIC",
				value: ModuleType.STATIC,
				urlContains: "type=STATIC",
			},
		];

		filterOptions.forEach(({ label, value, urlContains }) => {
			cy.get('[data-test="dhis2-uicore-select-input"]').click();
			cy.get(`[data-value="${value}"]`).click();

			cy.get('[data-test="dhis2-uicore-select-input"]').should(
				"contain",
				label,
			);

			if (urlContains) {
				cy.url().should("include", urlContains);
			} else {
				cy.url().should("not.include", "type=");
			}

			cy.get("table tbody tr").then(($rows) => {
				if ($rows.length === 0) {
					cy.contains(
						"There are no modules matching the selected type",
					).should("be.visible");
				} else if ($rows.length > 0) {
					cy.wrap($rows).each(($row) => {
						cy.wrap($row).find("td").eq(1).should("contain", value);
					});
				}
			});
		});

		cy.get('[data-test="dhis2-uicore-singleselect-clear"]').click();
	});

	it("should create a new module", () => {
		// cy.contains("a", modulesMenu.label).click();
		//
		// // Click Create button
		// cy.contains("button", "Create a new module").click();
		//
		// // Verify modal
		// cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
		// cy.contains("Create Module").should("be.visible");
		//
		// // Fill form
		// cy.get('input[name="config.title"]').type("New Test Module");
		// cy.get('.gap-4 > .flex > [data-test="dhis2-uiwidgets-singleselectfield"] > [data-test="dhis2-uiwidgets-singleselectfield-content"] > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-singleselect"] > .jsx-114080822 > [data-test="dhis2-uicore-select"] > [data-test="dhis2-uicore-select-input"]').click();
		// cy.get('[data-value="VISUALIZATION"]').click();
		// cy.get('input[name="id"]').type("new-module-123");
		//
		// // Submit form
		// cy.contains("button", "Create module").should("be.visible").click();
		//
		// // Verify loading state
		// cy.contains("button", "Creating...").should("be.visible");
		//
		// // Verify success alert
		// cy.contains("Module created successfully").should("be.visible");
		//
		// // Verify navigation to edit page
		// cy.url().should("include", "/modules/new-module-123/edit");
		//
		// // Go back to Modules page
		// cy.contains("button", "Back to all modules").click();
		//
		// // Verify new module in table
		// cy.get("table tbody tr").within(() => {
		//     cy.contains("td", "New Test Module").should("be.visible");
		//     cy.contains("td", "VISUALIZATION").should("be.visible");
		// });
	});

	// it("should navigate to module edit page and verify UI", () => {
	//     cy.contains("a", modulesMenu.label).click();

	//     cy.get("table tbody tr")
	//         .first()
	//         .within(() => {
	//             cy.get('[data-test="dhis2-uicore-button"]').click();
	//         });

	//     cy.url().should("match", /\/modules\/[^/]+\/edit/);

	//     cy.contains("button", "Back to all modules").should("be.visible");

	//     cy.contains("button", "Delete module").should("be.visible");
	//     cy.contains("button", "Save changes").should("be.disabled");
	// });

	// it("should add form fields in DashboardGeneralConfig", () => {
	//     cy.contains("a", modulesMenu.label).click();
	//     cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
	//         cy.get('[data-test="dhis2-uicore-button"]').click();
	//     });

	//     // Fill form fields
	//     cy.get('input[name="config.title"]').clear().type("New Test Module");
	//     cy.get('div[data-test="dhis2-uiwidgets-richtextareafield"][data-name="config.shortDescription"] div[contenteditable="true"]')
	//         .should("be.visible")
	//         .click()
	//         .type("Short desc");
	//     cy.get(':nth-child(2) > [data-test="dhis2-uicore-field-content"] > .jodit-react-container > .jodit-container').type("Short description");
	//     cy.get(':nth-child(3) > [data-test="dhis2-uicore-field-content"] > .jodit-react-container > .jodit-container > .jodit-workplace > .jodit-wysiwyg').type("Full desc");

	//     // cy.get('textarea[name="config.description"]').type("Full desc");
	//     cy.get('input[name="config.grouped"]').check();

	//     cy.contains("button", "Save changes").should("not.be.disabled");

	//     cy.contains("button", "Save changes").click();
	// });

	// it("should add and edit visualization when hasGroups is false", () => {
	//     cy.contains("a", modulesMenu.label).click();
	//     cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
	//         cy.get('[data-test="dhis2-uicore-button"]').click();
	//     });

	//     cy.get('input[name="config.grouped"]').uncheck();
	//     cy.get('input[name="config.grouped"]').should("not.be.checked");

	//     cy.contains("button", "Add visualizations").click();
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Add visualization").should("be.visible");
	//     cy.get('[data-test="dhis2-uicore-select-input"]').first().click();
	//     cy.get('[data-value="CHART"]').click();
	//     cy.get('[data-test="dhis2-uicore-select-input"]').eq(1).click();
	//     cy.get('[data-value="COLUMN"]').click();
	//     cy.wait(2000);
	//     cy.get('[data-test="dhis2-uicore-select-input"]').eq(2).click();
	//     cy.get('[data-value="hewtA7a025J"]').click();

	//     cy.get('textarea[name="caption"]').type("Chart Caption");
	//     cy.get('[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();

	//     cy.contains("button", "Save changes").should("not.be.disabled");

	//     cy.get("table").contains("td", "Chart Caption").parent("tr").within(() => {
	//         cy.get('button[title="Edit visualization"]').click();
	//     });
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Update visualization").should("be.visible");
	//     cy.get('textarea[name="caption"]').clear().type("Updated Caption");
	//     cy.contains("button", "Update").click();

	//     cy.contains("button", "Configure layout").click();
	//     cy.url().should("include", "/modules/new-module-123/edit/layout");
	//     cy.get(".layout").should("be.visible");
	//     cy.contains("button", "Cancel").click();

	//     cy.contains("button", "Save changes").should("not.be.disabled");
	//     cy.contains("button", "Save changes").click();
	// });

	// it("should add group when hasGroups is true", () => {
	//     cy.contains("a", modulesMenu.label).click();
	//     cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
	//         cy.get('[data-test="dhis2-uicore-button"]').click();
	//     });

	//     // Enable hasGroups
	//     cy.get('input[name="config.grouped"]').check();

	//     // Add group
	//     cy.contains("button", "Add group").click();
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Create Dashboard Group").should("be.visible");
	//     cy.get('input[name="title"]').type("Group 1");
	//     cy.get('input[name="shortName"]').type("G1");
	//     cy.get('input[name="id"]').type("group1");
	//     cy.get('[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();

	//     cy.contains("button", "Add visualizations").click();
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Add visualization").should("be.visible");
	//     cy.get('[data-test="dhis2-uicore-select-input"]').first().click();
	//     cy.get('[data-value="CHART"]').click();
	//     cy.get('[data-test="dhis2-uicore-select-input"]').eq(1).click();
	//     cy.get('[data-value="COLUMN"]').click();
	//     cy.wait(1000);
	//     cy.get('[data-test="dhis2-uicore-select-input"]').eq(2).click();
	//     cy.get('[data-value="hewtA7a025J"]').click();

	//     cy.get('textarea[name="caption"]').type("Chart Caption");
	//     cy.get('[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();

	//     cy.get("table").contains("td", "Chart Caption").should("be.visible");

	//     cy.get("table").contains("td", "Chart Caption").parent("tr").within(() => {
	//         cy.get('button[title="Edit visualization"]').click();
	//     });
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Update visualization").should("be.visible");
	//     cy.get('textarea[name="caption"]').clear().type("Updated Caption");
	//     cy.contains("button", "Update").click();

	//     cy.get("table").contains("td", "Updated Caption").should("be.visible");

	//     cy.contains("button", "Save group changes").click();

	//     cy.get("table").contains("td", "Group 1").parent("tr").within(() => {
	//         cy.get('[data-test="dhis2-uicore-buttonstrip"] > :nth-child(1) > [data-test="dhis2-uicore-button"]').click();
	//     });
	//     cy.contains("button", "Cancel").click();

	//     // Save changes
	//     cy.contains("button", "Save changes").should("not.be.disabled");
	//     cy.contains("button", "Save changes").click();

	// });

	// it("should show confirmation dialog when deleting a module", () => {
	//     cy.contains("a", modulesMenu.label).click();

	//     cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
	//         cy.get('button[aria-label="View"]').click();
	//     });

	//     cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
	//     cy.contains("Are you sure you want to delete the dashboard").should(
	//         "be.visible"
	//     );

	//     cy.contains("button", "Delete module").click();
	//     cy.get('[data-test="dhis2-uicore-modal"]').should("not.exist");
	// });
});
