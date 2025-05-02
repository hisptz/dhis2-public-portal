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
        cy.get("h2, h3")
            .contains(modulesMenu.label)
            .should("be.visible");
    });

    it("should display Modules page UI elements", () => {
        cy.contains("a", modulesMenu.label).click();
        cy.get('select, [data-test="dhis2-uicore-select"]').should("be.visible");

        cy.get('table').should("be.visible");
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

        cy.contains("a", modulesMenu.label).click();

        cy.contains("button", "Create a new module").click();

        cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
        cy.contains("Create Module").should("be.visible");

        cy.get('input[name="label"]').type("New Test Module");
        cy.get('.gap-4 > .flex > [data-test="dhis2-uiwidgets-singleselectfield"] > [data-test="dhis2-uiwidgets-singleselectfield-content"] > [data-test="dhis2-uicore-box"] > [data-test="dhis2-uicore-singleselect"] > .jsx-114080822 > [data-test="dhis2-uicore-select"] > [data-test="dhis2-uicore-select-input"]').click();
        cy.get('[data-value="VISUALIZATION"]').click();

        cy.contains("button", "Create module").should("be.visible").click();

        cy.contains("button", "Creating...").should("be.visible");

        cy.contains("button", "Back to all modules").click();

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
        cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
            cy.get('[data-test="dhis2-uicore-button"]').click();
        });

        cy.get('input[name="config.title"]').type("New Test Module");
        cy.get(':nth-child(3) > [data-test="dhis2-uicore-field-content"] > .jodit-react-container > .jodit-container > .jodit-workplace > .jodit-wysiwyg').type("Short description");
        cy.get(':nth-child(4) > [data-test="dhis2-uicore-field-content"] > .jodit-react-container > .jodit-container > .jodit-workplace > .jodit-wysiwyg').type("Full desc");


        cy.contains("button", "Add visualizations").click();
        cy.get('[data-test="dhis2-uicore-modaltitle"]').contains("Add visualization").should("be.visible");
        cy.get('[data-test="dhis2-uicore-select-input"]').first().click();
        cy.get('[data-value="CHART"]').click();
        cy.get('[data-test="dhis2-uicore-select-input"]').eq(1).click();
        cy.get('[data-value="COLUMN"]').click();
        cy.wait(2000);
        cy.get('[data-test="dhis2-uicore-select-input"]').eq(2).click();
        cy.get('[data-value="hewtA7a025J"]').click();

        cy.get('textarea[name="caption"]').type("Chart Caption");
        cy.get('[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();


        cy.contains("button", "Save changes").should("not.be.disabled");


        cy.get("table").contains("td", "Chart Caption").parent("tr").within(() => {
            cy.get('button[title="Edit visualization"]').click();
        });
        cy.get('[data-test="dhis2-uicore-modal"]').should("be.visible");
        cy.contains("Update visualization").should("be.visible");
        cy.get('textarea[name="caption"]').clear().type("Updated Caption");
        cy.contains("button", "Update").click();

        cy.contains("button", "Configure layout").click();
        cy.get(".layout").should("be.visible");
        cy.contains("button", "Cancel").click();

        cy.contains("button", "Save changes").should("not.be.disabled");
        cy.contains("button", "Save changes").click();
    });


    it("should delete a module", () => {
        cy.contains("a", modulesMenu.label).click();
        cy.get("table tbody tr").contains("td", "New Test Module").parent("tr").within(() => {
            cy.get('[data-test="dhis2-uicore-button"]').click();
        });
        cy.contains("button", "Delete module").click();
        cy.get('[data-test="dhis2-uicore-modalactions"] > [data-test="dhis2-uicore-buttonstrip"] > :nth-child(2) > [data-test="dhis2-uicore-button"]').click();
    });
});
