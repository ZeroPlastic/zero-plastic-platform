-- Table is empty at this point (no OTP codes issued yet), so this cast is safe.
ALTER TYPE "OtpPurpose" RENAME TO "OtpPurpose_old";
CREATE TYPE "OtpPurpose" AS ENUM ('REGISTRATION', 'LOGIN');
ALTER TABLE "otp_codes" ALTER COLUMN "purpose" TYPE "OtpPurpose" USING ("purpose"::text::"OtpPurpose");
DROP TYPE "OtpPurpose_old";
