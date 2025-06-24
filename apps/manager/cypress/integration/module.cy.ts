import { DisplayItemType, ModuleType, SectionType } from "@packages/shared/schemas";
import { appMenus } from "../../src/shared/constants/menu";
import { capitalize, startCase } from "lodash";
import 'cypress-file-upload';

describe("Modules Page", () => {
	beforeEach(() => {
		cy.visit("/");
	});

	const modulesMenu = appMenus.find((menu) => menu.label === "Modules");
	const modules = Object.values(ModuleType).map((item) => ({
		label: `New Test ${capitalize(startCase(item))} Module`,
		type: item,
	}));

	if (!modulesMenu) {
		throw new Error("Modules menu item not found in appMenus");
	}

	it("should navigate to Modules page via side navigation", () => {
		cy.contains("a", modulesMenu.label).should("be.visible").click();
		cy.url().should("include", modulesMenu.href);
		cy.get("h2, h3").contains(modulesMenu.label).should("be.visible");
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

		cy.contains("a", modulesMenu.label).click();

		modules.forEach(({ label, type }) => {
			const deleteIfExists = () => {
				cy.get("table").then(($table) => {
					if ($table.find(`td:contains('${label}')`).length > 0) {
						cy.log(`Module "${label}" exists, deleting it first`);

						cy.contains("td", label)
							.parent("tr")
							.within(() => {
								cy.get('[data-test="dhis2-uicore-button"]').click();
							});

						cy.contains("button", "Delete module").click();
						cy.get(
							'[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]',
						).click();

						cy.contains("td", label).should("not.exist");
					} else {
						cy.log(
							`Module "${label}" does not exist, proceeding to create`,
						);
					}
				});
			};

			cy.wait(1000);
			deleteIfExists();

			cy.contains("button", "Create a new module").click();

			cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
			cy.contains("Create Module").should("be.visible");

			cy.get('[data-test="add-module-label"]').within(($inputContainer) => {
				cy.get("input").type(label);
			});

			cy.get('[data-test="add-module-type-content"]').click();
			cy.get(`[data-value="${type}"]`).click();

			cy.contains("button", "Create module").click();

			cy.contains("button", "Back to all modules").click();

			cy.contains("td", label).should("exist");
		});
	});


	// Test for Visualization Module
	it("should add and edit visualization Module", () => {
		const visualizations = [
			"UlfTKWZWV4u",
			"LW0O27b7TdD",
		]
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Visualization Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.get('input[name="config.title"]').type("New Test Module");
		cy.get('textarea[name="config.shortDescription"]').type("Short description");
		cy.get(".jodit-wysiwyg").type("Full description");

		cy.contains("button", "Manage visualizations").click();

		cy.contains("button", "Add a new visualization").click();
		cy.get('[data-test="visualization-type-select-content"]').click();
		cy.get('[data-value="CHART"]').click();
		cy.wait(2000); // Wait for visualizations to load
		cy.get('[data-test="visualization-select-content"]').click();
		cy.get(`[data-value="${visualizations[0]}"]`).click();
		cy.get('textarea[name="caption"]').type("This is a test visualization caption");
		cy.get('[data-test="button-add-visualization"]').click();

		cy.contains("button", "Add a new visualization").click();
		cy.get('[data-test="visualization-type-select-content"]').click();
		cy.get('[data-value="CHART"]').click();
		cy.wait(2000); // Wait for visualizations to load
		cy.get('[data-test="visualization-select-content"]').click();
		cy.get(`[data-value="${visualizations[1]}"]`).click();
		cy.get('textarea[name="caption"]').type("This is a test visualization caption");
		cy.get('[data-test="button-add-visualization"]').click();

		cy.get('[data-test="screen-size-select"]').click();
		cy.get('[data-value="1500"]').click();

		cy.get(`[data-prefix="${visualizations[1]}"] > .absolute > svg > path`).click();

		cy.get('.react-grid-layout').then(() => {
			cy.get(`[data-prefix="${visualizations[0]}"] > .react-resizable-handle`)
				.trigger('mousedown', { button: 0 })
				.trigger('mousemove', { clientX: 200, clientY: 800 })
				.trigger('mouseup');
		});

		cy.get('.react-grid-layout').within(() => {
			cy.get(`[data-prefix="${visualizations[0]}"]`).should("exist");
		});
		cy.contains("button", "Save changes").click();

		cy.get('input[name="config.grouped"]').click();
		cy.get('input[value="segmented"]').click();

		cy.contains("button", "Add group").click();
		cy.get('input[name="title"]').type("Test Group");
		cy.get('input[name="shortName"]').type("Group");
		cy.get('[data-test="button-create-group"]').click();
		cy.get('textarea[name="config.groups.0.shortDescription"]').type("Short description");
		cy.get(".jodit-wysiwyg").type("Full description");


		cy.contains("button", "Save group changes").click();

		cy.get("table tbody tr")
			.contains("td", "Test Group")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="edit-group-0"]').click();
			});
		cy.get('input[name="config.groups.0.title"]').clear().type("Updated Test Group");
		cy.contains("button", "Save group changes").click();
		cy.get("table tbody tr")
			.contains("td", "Updated Test Group")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="remove-group-0"]').click();
			});

		cy.contains("button", "Add group").click();
		cy.get('input[name="title"]').type("Test Group Visualization");
		cy.get('input[name="shortName"]').type("Visuals");
		cy.get('[data-test="button-create-group"]').click();

		cy.contains("button", "Manage visualizations").click();

		cy.contains("button", "Add a new visualization").click();
		cy.get('[data-test="visualization-type-select-content"]').click();
		cy.get('[data-value="CHART"]').click();
		cy.wait(2000); // Wait for visualizations to load
		cy.get('[data-test="visualization-select-content"]').click();
		cy.get(`[data-value="${visualizations[0]}"]`).click();
		cy.get('textarea[name="caption"]').type("This is a test visualization caption");
		cy.get('[data-test="button-add-visualization"]').click();

		cy.contains("button", "Add a new visualization").click();
		cy.get('[data-test="visualization-type-select-content"]').click();
		cy.get('[data-value="CHART"]').click();
		cy.wait(2000); // Wait for visualizations to load
		cy.get('[data-test="visualization-select-content"]').click();
		cy.get(`[data-value="${visualizations[1]}"]`).click();
		cy.get('textarea[name="caption"]').type("This is a test visualization caption");
		cy.get('[data-test="button-add-visualization"]').click();

		cy.get('[data-test="screen-size-select"]').click();
		cy.get('[data-value="1500"]').click();

		cy.get(`[data-prefix="${visualizations[1]}"] > .absolute > svg > path`).click();

		cy.get('.react-grid-layout').then(() => {
			cy.get(`[data-prefix="${visualizations[0]}"] > .react-resizable-handle`)
				.trigger('mousedown', { button: 0 })
				.trigger('mousemove', { clientX: 200, clientY: 800 })
				.trigger('mouseup');
		});

		cy.get('.react-grid-layout').within(() => {
			cy.get(`[data-prefix="${visualizations[0]}"]`).should("exist");
		});
		cy.contains("button", "Save changes").click();

		cy.contains("button", "Back to dashboard").click();
	});

	// Test for Static Module
	it("should add and edit static Module", () => {
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Static Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.get('input[name="config.title"]').type("New Test Module");

		cy.contains("button", "Add item").click();
		cy.get('input[name="title"]').type("Blog Test");
		cy.contains("button", "Create item").click();
		cy.get('textarea[name="shortDescription"]').type("This is a short description for the blog test item.");
		cy.get(".jodit-wysiwyg").type("This is a full description for the blog test item.");
		cy.contains("button", "Save changes").click();
		cy.contains("td", "Blog Test").parent("tr").within(() => {
			cy.get('[data-test="dhis2-uicore-button"]').click();
		});
		cy.contains("button", "Cancel").click();
		cy.contains("td", "Blog Test").parent("tr").within(() => {
			cy.get('[data-test="dhis2-uicore-button"]').click();
		});
		cy.contains("button", "Back").click();
		cy.contains("td", "Blog Test").parent("tr").within(() => {
			cy.get('[data-test="dhis2-uicore-button"]').click();
		});
		cy.contains("button", "Delete item").click();
		cy.get('[data-test="confirm-delete-button"]').click();
		cy.contains("button", "Save changes").click();
	});

	// Test for Document Module
	it("should add and edit documents Module", () => {
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Documents Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.get('input[name="config.title"]').type("New Test Module");

		//For non-grouped
		cy.contains("button", "Add document").click();
		cy.get('[data-test="document-label-input"]').type("Document Test");
		cy.get('[data-test="document-type-select"]').click();
		cy.get('[data-value="PDF"]').click();
		cy.get('[data-test="file-input"]').click();
		cy.get('input[type="file"]').as('fileInput');
		cy.fixture('FlexiPortal_Overview.pdf', 'base64').then(fileContent => {
			cy.get('@fileInput').attachFile({
				fileContent,
				fileName: 'FlexiPortal_Overview.pdf',
				mimeType: 'application/pdf',
				encoding: 'base64'
			});
		});
		cy.get('[data-test="add-document-button"]').click();
		cy.contains("td", "Document Test").parent("tr").within(() => {
			cy.get('[data-test="dhis2-uicore-button"]').click();
		});

		// For grouped
		cy.get('input[name="config.grouped"]').click();
		cy.get('input[value="segmented"]').click();
		cy.contains("button", "Add group").click();
		cy.get('[data-test="document-group-title-input"]').type("Test Group");
		cy.contains("button", "Add file").click();
		cy.get('[data-test="document-group-label-input"]').type("Group Document Test");
		cy.get('[data-test="document-type-select"]').click();
		cy.get('[data-value="PDF"]').click();
		cy.get('input[type="file"]').as('groupFileInput');
		cy.fixture('FlexiPortal_Overview.pdf', 'base64').then(fileContent => {
			cy.get('@fileInput').attachFile({
				fileContent,
				fileName: 'FlexiPortal_Overview.pdf',
				mimeType: 'application/pdf',
				encoding: 'base64'
			});
		});
		cy.get('[data-test="save-file-button"]').click();
		cy.get('[data-test="save-document-group-button"]').click();
		cy.contains("td", "Document Test").parent("tr").within(() => {
			cy.get('[data-test="edit-document-group-button"]').click();
		});
		cy.get('input[name="title"]').clear().type("Updated Test Group");
		cy.get('[data-test="save-document-group-button"]').click();
		cy.contains("td", "Updated Test Group").parent("tr").within(() => {
			cy.get('[data-test="remove-document-group-button"]').click();
		});
		cy.get(':nth-child(3) > [data-test="dhis2-uicore-button"]').click();
		cy.contains("button", "Save changes").click();
	});

	it("should add and edit section Module", () => {
		const visualizations = [
			"UlfTKWZWV4u",
			"mYMnDl5Z9oD",
		]
		const sectionTypes = Object.values(SectionType).map((types) => ({
			label: startCase(types.toLowerCase()),
			value: types,
		}))
		cy.contains("a", modulesMenu.label).click();
		cy.get("table tbody tr")
			.contains("td", "New Test Section Module")
			.parent("tr")
			.within(() => {
				cy.get('[data-test="dhis2-uicore-button"]').click();
			});

		cy.get('input[value="sidebar"]').click();

		sectionTypes.forEach(({ label, value }, index) => {
			cy.contains("button", "Add Section").click();
			cy.get('input[name="title"]').type(label + " Test Section");
			cy.get('[data-test="section-display-select"]').click();
			cy.get(`[data-value="${value}"]`).click();
			cy.get('[data-test="add-section-button"]').click();

			switch (value) {
				case SectionType.GRID_LAYOUT:
					cy.contains("button", "Add item").click();
					cy.wait(1000);
					cy.get('[data-test="single-value-visualization-select-content"]').click();
					cy.get(`[data-value="${visualizations[1]}"]`).click();
					cy.get('input[type="file"]').attachFile({
						filePath: 'hisp-tz.svg',
						fileName: 'hisp-tz.svg',
						mimeType: 'image/svg+xml'
					});
					cy.get('[data-test="add-highlighted-item-button"]').click();
					cy.wait(2000);
					cy.contains("button", "Save section changes").click();
					cy.contains("button", "Back to module").click();
					break;
				case SectionType.SINGLE_ITEM:
					cy.get(".jodit-wysiwyg").type("This is a test section content");
					cy.contains("button", "Save section changes").click();
					cy.get('[data-test="section-single-item-type"]').click();
					cy.get(`[data-value="${DisplayItemType.VISUALIZATION}"]`).click();
					cy.get('[data-test="section-single-item-visualization-type"]').click();
					cy.get('[data-value="CHART"]').click();
					cy.get('[data-test="visualization-type-select-content"]').click();
					cy.get('[data-value="BAR"]').click();
					cy.wait(2000);
					cy.get('[data-test="section-single-item-visualization-content"]').click();
					cy.get(`[data-value="${visualizations[0]}"]`).click();
					cy.get(`textarea[name='config.sections.${index}.item.item.caption']`).type("This is a test caption");
					cy.contains("button", "Save section changes").click();
					cy.get('[data-test="section-single-item-type"]').click();
					cy.get(`[data-value="${DisplayItemType.FEEDBACK}"]`).click();
					cy.contains("button", "Add feedback recipient").click();
					cy.get('input[name="email"]').type("test@gmail.com");
					cy.get('[data-test="add-feedback-submit-button"]').click();
					cy.get('[data-test="edit-feedback-button"]').click();
					cy.get('input[name="email"]').clear().type("updatetest@gmail.com");
					cy.get('[data-test="add-feedback-submit-button"]').click();
					cy.contains("button", "Save section changes").click();
					cy.wait(2000);
					cy.get('[data-test="remove-feedback-button"]').click();
					cy.contains("button", "Save section changes").click();
					cy.contains("button", "Back to module").click();
					break;
				case SectionType.FLEXIBLE_LAYOUT:
					cy.contains("button", "Manage visualizations").click();
					cy.contains("button", "Add a new visualization").click();
					cy.get('[data-test="visualization-type-select-content"]').click();
					cy.get('[data-value="CHART"]').click();
					cy.wait(2000);
					cy.get('[data-test="visualization-select-content"]').click();
					cy.get(`[data-value="${visualizations[0]}"]`).click();
					cy.get('textarea[name="caption"]').type("This is a test visualization caption");
					cy.get('[data-test="button-add-visualization"]').click();
					cy.get('[data-test="screen-size-select"]').click();
					cy.get('[data-value="1500"]').click();
					cy.get('.react-grid-layout').then(() => {
						cy.get(`[data-prefix="${visualizations[0]}"] > .react-resizable-handle`)
							.trigger('mousedown', { button: 0 })
							.trigger('mousemove', { clientX: 200, clientY: 800 })
							.trigger('mouseup');
					});
					cy.contains("button", "Save changes").click();
					cy.contains("button", "Save section changes").click();
					cy.contains("button", "Back to module").click();
					break;
				default:
					cy.log(`No special handling for section type: ${value}`);
			}
		})

		cy.get('input[value="header"]').click();
		cy.contains("button", "Add Section").click();
		cy.get('input[name="title"]').type("Single Item Test Section");
		cy.get('[data-test="section-display-select"]').click();
		cy.get(`[data-value="SINGLE_ITEM"]`).click();
		cy.get('[data-test="add-section-button"]').click();

		cy.get(".jodit-wysiwyg").type("This is a test section content");
		cy.contains("button", "Save section changes").click();
		cy.get('[data-test="section-single-item-type"]').click();
		cy.get(`[data-value="${DisplayItemType.VISUALIZATION}"]`).click();
		cy.get('[data-test="section-single-item-visualization-type"]').click();
		cy.get('[data-value="CHART"]').click();
		cy.get('[data-test="visualization-type-select-content"]').click();
		cy.get('[data-value="BAR"]').click();
		cy.wait(2000);
		cy.get('[data-test="section-single-item-visualization-content"]').click();
		cy.get(`[data-value="${visualizations[0]}"]`).click();
		cy.contains("button", "Save section changes").click();
		cy.get('[data-test="section-single-item-type"]').click();
		cy.get(`[data-value="${DisplayItemType.FEEDBACK}"]`).click();
		cy.contains("button", "Add feedback recipient").click();
		cy.get('input[name="email"]').type("test@gmail.com");
		cy.get('[data-test="add-feedback-submit-button"]').click();
		cy.get('[data-test="edit-feedback-button"]').click();
		cy.get('input[name="email"]').clear().type("updatetest@gmail.com");
		cy.get('[data-test="add-feedback-submit-button"]').click();
		cy.contains("button", "Save section changes").click();
		cy.wait(2000);
		cy.get('[data-test="remove-feedback-button"]').click();
		cy.contains("button", "Save section changes").click();
		cy.contains("button", "Back to module").click();

		sectionTypes.forEach((_, index) => {
			cy.get(`[data-test="edit-section-${index}"]`).click();
			cy.contains("button", "Back to module").click();
			cy.get(`[data-test="remove-section-${index}"]`).click();
		});
		cy.contains("button", "Save changes").click();
	});

	it("should delete a module", () => {
		cy.contains("a", modulesMenu.label).click();

		modules.forEach(({ label }) => {
			cy.contains("td", label)
				.parent("tr")
				.within(() => {
					cy.get('[data-test="dhis2-uicore-button"]').click();
				});
			cy.contains("button", "Delete module").click();
			cy.get(
				'[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]'
			).click();
		});
	});

});
