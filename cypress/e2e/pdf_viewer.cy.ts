describe("PDF Viewer", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("shows loading and renders the correct number of pages", () => {
    cy.contains(/loading/i).should("exist");
    cy.contains(/loading/i).should("not.exist");
    cy.contains(/pdf loaded successfully/i).should("exist");
    cy.contains("/18").should("exist");
  });

  it("updates the page number input based on the visible PDF page and scrolls to the specified page when input is changed", () => {
    // Scroll to the 5th page and verify the page number input updates correctly
    cy.get("#pdfContainer-5").scrollIntoView({ duration: 1000 });
    cy.get("#page-input").should("have.value", "5");

    // Clear the input, type a new page number, and verify it scrolls to the correct page
    cy.get("#page-input").clear().type("5").should("have.value", "5");
    cy.get("#pdfContainer-5").should("be.visible");
  });
  it("picks and renders a PDF file", () => {
    // Remove the last element (current directory)

    cy.get("#pdf-file-input").selectFile("cypress/fixtures/10-page-sample.pdf");
    cy.contains(/PDF loaded successfully/i).should("exist");
    //  cy.contains("/18").should("exist");
  });
});
