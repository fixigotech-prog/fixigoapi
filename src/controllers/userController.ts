import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { users } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { generateOtp, sendSms, composeMessage } from '../db/otpService';
import dotenv from "dotenv"
dotenv.config();


// Define a type for the decorated fastify instance
interface App extends FastifyInstance {
  db: any;
}

// Interfaces for type safety
interface RegisterBody {
  fullName: string;
  email?: string;
  password?: string;
  phone: string;
  role: 'customer';
}

interface LoginBody {
  phone: string;
}

interface OtpBody {
  phone: string;
  otp: string;
}

interface PhoneBody {
  phone: string;
  resendType: string;
}

export const register = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { fullName, email, password, phone, role } = request.body;

  // If email is provided, check if it's already taken by a verified user
  if (email) {
    const userByEmail = await app.db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (userByEmail) {
      return reply.status(409).send({ message: 'This email is already associated with a verified account.' });
    }
  }

  // Find user by phone to decide whether to update or insert
  const userByPhone = await app.db.query.users.findFirst({
    where: eq(users.phone, phone),
  });

  if (userByPhone && userByPhone.isVerified) {
    return reply.status(409).send({ message: 'This phone number is already associated with a verified account.' });
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  if (userByPhone) { // User exists with this phone but is not verified, so we update their info
    await app.db.update(users).set({
      fullName,
      email: email || null,
      password: hashedPassword,
      role,
      otp,
      otpExpiresAt,
      updatedAt: new Date(),
    }).where(eq(users.phone, phone));
  } else { // No user with this phone, create a new one
    // Check for unverified user with the same email but different phone
    if (email) {
        const unverifiedUserByEmail = await app.db.query.users.findFirst({
            where: and(eq(users.email, email), eq(users.isVerified, false)),
        });
        if (unverifiedUserByEmail) {
            return reply.status(409).send({ message: 'This email is already used in a pending registration. Please use a different email or complete the verification for that account.' });
        }
    }

    await app.db.insert(users).values({
      fullName:fullName,
      email: email || null,
      password: hashedPassword,
      phone:phone,
      role: role || "customer",
      otp,
      otpExpiresAt
    });
  }

  try {
    const message = composeMessage('login', 'en', { OTP: otp });
    await sendSms(phone, message,"");
    return reply.status(200).send({ message: 'OTP sent to your phone number. Please verify to complete registration.' });
  } catch (error) {
    console.error('OTP sending failed:', error);
    return reply.status(500).send({ message: 'Failed to send OTP. Please try again.' });
  }
};

export const login = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { phone } = request.body;

  const user = await app.db.query.users.findFirst({
    where: eq(users.phone, phone),
  });

  if (!user) {
    return reply.status(404).send({ message: 'Verified user not found with this phone number.' });
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await app.db.update(users).set({
    otp,
    otpExpiresAt,
    updatedAt: new Date(),
  }).where(eq(users.phone, phone));

  try {
    const message = composeMessage('login', 'en', { OTP: otp });
    await sendSms(phone, message,"signin");
    return reply.status(200).send({ message: 'OTP sent to your phone number. Please verify to log in.' });
  } catch (error) {
    console.error('OTP sending failed:', error);
    return reply.status(500).send({ message: 'Failed to send OTP. Please try again.' });
  }
};

export const verifyOtp = async (request: FastifyRequest<{ Body: OtpBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { phone, otp } = request.body;

  const user = await app.db.query.users.findFirst({
    where: eq(users.phone, phone),
  });

  if (!user) {
    return reply.status(404).send({ message: 'User not found' });
  }

  if (user.otp !== otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    return reply.status(400).send({ message: 'Invalid or expired OTP' });
  }

  const [updatedUser] = await app.db.update(users).set({
    isVerified: true,
    otp: null,
    otpExpiresAt: null,
    updatedAt: new Date(),
  }).where(eq(users.phone, phone)).returning();

  if (!updatedUser) {
    return reply.status(500).send({ message: 'Failed to verify user.' });
  }

  const token = jwt.sign({ id: updatedUser.id, role: updatedUser.role }, process.env.JWT_SECRET!);

  return reply.status(200).send({ message: 'User verified successfully.', token });
};

export const resendOtp = async (request: FastifyRequest<{ Body: PhoneBody }>, reply: FastifyReply) => {
  const app = request.server as App;
  const { phone,resendType } = request.body;

  const user = await app.db.query.users.findFirst({
    where: eq(users.phone, phone),
  });

  if (!user) {
    return reply.status(404).send({ message: 'User not found. Please register first.' });
  }

  if (user.isVerified) {
    return reply.status(400).send({ message: 'User is already verified. Please log in.' });
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  await app.db.update(users).set({
    otp,
    otpExpiresAt,
    updatedAt: new Date(),
  }).where(eq(users.phone, phone));

  try {
    const message = composeMessage('login', 'en', { OTP: otp });
    await sendSms(phone, message, resendType);
    return reply.status(200).send({ message: 'OTP re-sent to your phone number.' });
  } catch (error) {
    console.error('OTP sending failed:', error);
    return reply.status(500).send({ message: 'Failed to send OTP. Please try again.' });
  }
};