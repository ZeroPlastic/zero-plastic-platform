import twilio from 'twilio';
import { env } from './env';
import { logger } from '../utils/logger';

const client =
  env.twilio.accountSid && env.twilio.authToken
    ? twilio(env.twilio.accountSid, env.twilio.authToken)
    : null;

/**
 * Sends an SMS via Twilio. Silently no-ops (with a warning log) when Twilio
 * credentials aren't configured, so local/dev environments can exercise the
 * OTP flow without a live Twilio account.
 */
export async function sendSms(to: string, body: string): Promise<void> {
  if (!client) {
    logger.warn(`Twilio not configured — would have sent SMS to ${to}: "${body}"`);
    return;
  }

  await client.messages.create({
    to,
    from: env.twilio.fromNumber,
    body,
  });
}
