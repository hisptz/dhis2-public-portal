import { ModuleType } from "@packages/shared/schemas";
import { appMenus } from "../../src/shared/constants/menu";
import { capitalize, startCase } from "lodash";

describe("Modules Page", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	const modulesMenu = appMenus.find((menu) => menu.label === "Modules");

	if (!modulesMenu) {
		throw new Error("Modules menu item not found in appMenus");
	}

	it("should navigate to Modules page via side navigation", () => {
		cy.contains("a", modulesMenu.label).should("be.visible").click();
		cy.url().should("include", modulesMenu.href);
		cy.get("h2, h3").contains(modulesMenu.label).should("be.visible");
	});

	it("should display Modules page UI elements", () => {
		cy.contains("a", modulesMenu.label).click();
		cy.get('select, [data-test="dhis2-uicore-select"]').should(
			"be.visible",
		);

		cy.get("table").should("be.visible");
		cy.contains("th", "Label").should("be.visible");
		cy.contains("th", "Type").should("be.visible");
		cy.contains("th", "Actions").should("be.visible");
	});

	it("should filter modules by type", () => {
		cy.contains("a", modulesMenu.label).click();

		const filterOptions = Object.values(ModuleType).map((item) => ({
			label: capitalize(startCase(item)),
			value: item,
			urlContains: `type=${item}`,
		}));

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
		});

		cy.get('[data-test="dhis2-uicore-singleselect-clear"]').click();
	});

	it("should create a new module", () => {
		const moduleName = "New Test Module";

		cy.contains("a", modulesMenu.label).click();

		const deleteIfExists = () => {
			cy.get("body").then(($body) => {
				if ($body.find(`td:contains('${moduleName}')`).length > 0) {
					cy.log(`Module "${moduleName}" exists, deleting it first`);

					cy.contains("td", moduleName)
						.parent("tr")
						.within(() => {
							cy.get('[data-test="dhis2-uicore-button"]').click();
						});

					cy.contains("button", "Delete module").click();
					cy.get(
						'[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]'
					).click();

					cy.contains("td", moduleName).should('not.exist');
				} else {
					cy.log(`Module "${moduleName}" does not exist, proceeding to create`);
				}
			});
		};

		deleteIfExists();
		cy.wait(1000);
		deleteIfExists();

		cy.contains("button", "Create a new module").click();

		cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
		cy.contains("Create Module").should("be.visible");

		cy.get('input[name="label"]').type(moduleName);
		cy.get(
			'.gap-4 > .flex > [data-test="dhis2-uiwidgets-singleselectfield"] > [data-test="dhis2-uiwidgets-singleselectfield-content"] > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-singleselect"] > .jsx-114080822 > [data-test="dhis2-uicore-select"] > [data-test="dhis2-uicore-select-input"]'
		).click();
		cy.get('[data-value="VISUALIZATION"]').click();

		cy.contains("button", "Create module").should("be.visible").click();

		cy.contains("button", "Back to all modules").click();

		cy.contains("td", moduleName).should('exist');
	});

	it("should navigate to module edit page and verify UI", () => {
		cy.contains("a", modulesMenu.label).click();

		cy.get("table tbody tr")
			.first()
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.url().should("match", /\/modules\/[^/]+\/edit/);

		cy.contains("button", "Back to all modules").should("be.visible");

		cy.contains("button", "Delete module").should("be.visible");
		cy.contains("button", "Save changes").should("be.disabled");
	});

	// Test for Visualization Module
	it("should add and edit visualization Module", () => {
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.get('input[name="config.title"]').type("New Test Module");

		cy.contains("button", "Manage visualizations").click();
		cy.contains("button", "Add a new visualization").should("be.visible").click();
		cy.get(
			'[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(1) > [data-test="dhis2-uicore-button"]',
		).click();

		cy.contains("button", "Cancel").click();

	});

	it("should delete a module", () => {
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});
		cy.contains("button", "Delete module").click();
		cy.get(
			'[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]',
		).click();
	});
});
