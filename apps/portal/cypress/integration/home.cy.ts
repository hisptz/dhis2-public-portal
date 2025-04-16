describe("home", () => {
	it("should display welcome header", () => {
		cy.visit("/");
		cy.get("h1")
			.contains("Welcome to DHIS2 Public Portal!")
			.should("be.visible");
	});
});
