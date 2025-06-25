import { appMenus } from "../../src/shared/constants/menu";

describe("General Section", () => {
  const generalMenu = appMenus.find((menu) => menu.label === "General");

  beforeEach(() => {
    cy.visit("/");
  });

  it("should navigate to General section via side navigation", () => {
    cy.contains("a", generalMenu.label).should("be.visible").click();
    cy.url().should("include", generalMenu.href);
    cy.get("h2, h3").contains(generalMenu.action).should("be.visible");
  });

  it("should display General configuration form fields", () => {
    cy.contains("a", generalMenu.label).click();
    cy.get('#name').should("be.visible");
    cy.get('#description').should("be.visible");
    cy.get('#applicationURL').should("be.visible");
    cy.get('[name="icon"]').should("exist");
  });

  it("should fill and save the General configuration form", () => {
    cy.contains("a",generalMenu.label).click();
    cy.get('#name').clear().type("Test Portal Name");
    cy.get('#description').clear().type("Test portal description");
    cy.get('#applicationURL').clear().type("https://test-portal.org");
    cy.get('input[type="file"][name="icon"]').selectFile('cypress/fixtures/sample-icon.png', { force: true });
    cy.contains("button", "Save changes").should("not.be.disabled").click();
    cy.contains("button", "Save changes").should("be.disabled");
  });
});
