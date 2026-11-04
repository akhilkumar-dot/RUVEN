/**
 * Isolated Test Fixtures for Playwright and Unit Tests only.
 * MUST NEVER be imported by production application code (guarded by ESLint no-restricted-imports).
 */

export const TEST_ACCOUNTS = {
  individual: {
    name: "Test Talent",
    user_handle: "test_talent",
    type: "INDIVIDUAL",
    email: "talent.test@ruven.local",
  },
  founder: {
    name: "Test Founder",
    user_handle: "test_founder",
    type: "STARTUP_FOUNDER",
    email: "founder.test@ruven.local",
  },
  company: {
    name: "Test Company Owner",
    user_handle: "test_company",
    type: "COMPANY_OWNER",
    email: "company.test@ruven.local",
  },
  investor: {
    name: "Test Investor",
    user_handle: "test_investor",
    type: "INVESTOR",
    email: "investor.test@ruven.local",
  },
};
