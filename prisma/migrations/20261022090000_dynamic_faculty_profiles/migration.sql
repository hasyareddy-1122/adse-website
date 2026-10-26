-- Extend faculty profiles with public academic and contact information.
ALTER TABLE "FacultyProfile"
  ADD COLUMN "designation" TEXT,
  ADD COLUMN "qualification" TEXT,
  ADD COLUMN "bio" TEXT,
  ADD COLUMN "publicEmail" TEXT,
  ADD COLUMN "researchGate" TEXT,
  ADD COLUMN "googleScholar" TEXT,
  ADD COLUMN "orcid" TEXT,
  ADD COLUMN "website" TEXT;
