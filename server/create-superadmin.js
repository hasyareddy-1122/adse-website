import "dotenv/config";
import readline from "node:readline/promises";
import { stdin as input, stdout as output, exit } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function promptHiddenPassword(rl, promptText) {
  return new Promise((resolve) => {
    const onData = (char) => {
      const str = char.toString("utf8");
      if (str === "\n" || str === "\r" || str === "\u0004") {
        input.removeListener("data", onData);
        if (input.isTTY) input.setRawMode(false);
        output.write("\n");
        resolve(password);
      } else if (str === "\u0003") {
        // Ctrl+C
        input.removeListener("data", onData);
        if (input.isTTY) input.setRawMode(false);
        output.write("\n");
        exit(1);
      } else if (str === "\u007f" || str === "\b") {
        if (password.length > 0) {
          password = password.slice(0, -1);
          output.write("\b \b");
        }
      } else {
        password += str;
        output.write("*");
      }
    };

    let password = "";
    output.write(promptText);
    if (input.isTTY) input.setRawMode(true);
    input.resume();
    input.on("data", onData);

    // Pause readline while handling raw password input
    rl.pause();
  });
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log("=== Create SUPER_ADMIN Account ===\n");

    const nameInput = (await rl.question("Full name: ")).trim();
    if (!nameInput) {
      throw new Error("Full name is required.");
    }

    const emailInput = (await rl.question("Email address: ")).trim().toLowerCase();
    if (!emailInput || !emailInput.includes("@")) {
      throw new Error("A valid email address is required.");
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailInput },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (existing) {
      throw new Error(
        `A user with email "${emailInput}" already exists (id=${existing.id}, role=${existing.role}).`
      );
    }

    const password = await promptHiddenPassword(
      rl,
      "Password (min. 12 characters): "
    );

    if (password.length < 12) {
      throw new Error("Password must be at least 12 characters long.");
    }

    const confirmPassword = await promptHiddenPassword(
      rl,
      "Confirm password: "
    );

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await prisma.user.create({
      data: {
        name: nameInput,
        email: emailInput,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    console.log("\nSUPER_ADMIN account created successfully:");
    console.log(created);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\nError:", err.message || err);
  exit(1);
});