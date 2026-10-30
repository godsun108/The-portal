import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCredentialRegistry } from "./credentials.mjs";
import { createDurableSessionStore } from "./durable-sessions.mjs";
import { createCredentialRevocationCoordinator } from "./credential-revocation.mjs";

test("credential revocation atomically removes only sessions bound to that account credential", () => {
  const dir = mkdtempSync(join(tmpdir(), "earthid-credential-revoke-"));
  const databasePath = join(dir, "identity.db");
  const credentials = createCredentialRegistry(databasePath);
  const sessions = createDurableSessionStore({ databasePath });
  const coordinator = createCredentialRevocationCoordinator({ databasePath });
  try {
    credentials.addAccount("alice");
    credentials.addAccount("bob");
    for (const id of ["alice_key_1", "alice_key_2", "bob_key_1"]) {
      const accountId = id.startsWith("bob") ? "bob" : "alice";
      assert.equal(credentials.addVerifiedWebAuthnCredential({
        id, accountId, publicKey: new Uint8Array([1, 2, 3, 4])
      }), true);
    }
    const targetA = sessions.issue("alice", { credentialId: "alice_key_1" });
    const targetB = sessions.issue("alice", { credentialId: "alice_key_1" });
    const otherKey = sessions.issue("alice", { credentialId: "alice_key_2" });
    const otherAccount = sessions.issue("bob", { credentialId: "bob_key_1" });

    assert.deepEqual(coordinator.revokeCredential("alice", "alice_key_1"), {
      revoked: true, sessionsRevoked: 2
    });
    assert.equal(sessions.resolve(targetA.token), null);
    assert.equal(sessions.resolve(targetB.token), null);
    assert.deepEqual(sessions.resolve(otherKey.token), {
      subject: "alice", verified: true, credentialId: "alice_key_2"
    });
    assert.deepEqual(sessions.resolve(otherAccount.token), {
      subject: "bob", verified: true, credentialId: "bob_key_1"
    });
    assert.equal(credentials.getWebAuthnCredential("alice_key_1", "alice"), null);
    assert.deepEqual(coordinator.revokeCredential("alice", "alice_key_1"), {
      revoked: true, sessionsRevoked: 0
    });
    assert.deepEqual(coordinator.revokeCredential("bob", "alice_key_2"), {
      revoked: false, sessionsRevoked: 0
    });
  } finally {
    coordinator.close(); sessions.close(); credentials.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("legacy session database migrates and retains sessions without credential bindings", () => {
  const dir = mkdtempSync(join(tmpdir(), "earthid-credential-migrate-"));
  const databasePath = join(dir, "identity.db");
  try {
    let sessions = createDurableSessionStore({ databasePath });
    const legacy = sessions.issue("alice");
    sessions.close();

    const credentials = createCredentialRegistry(databasePath);
    credentials.addAccount("alice");
    credentials.addVerifiedWebAuthnCredential({
      id: "alice_key_1", accountId: "alice", publicKey: new Uint8Array([1, 2, 3])
    });
    sessions = createDurableSessionStore({ databasePath });
    const bound = sessions.issue("alice", { credentialId: "alice_key_1" });
    const coordinator = createCredentialRevocationCoordinator({ databasePath });
    try {
      assert.deepEqual(sessions.resolve(legacy.token), { subject: "alice", verified: true });
      assert.deepEqual(coordinator.revokeCredential("alice", "alice_key_1"), {
        revoked: true, sessionsRevoked: 1
      });
      assert.equal(sessions.resolve(bound.token), null);
      assert.deepEqual(sessions.resolve(legacy.token), { subject: "alice", verified: true });
    } finally { coordinator.close(); sessions.close(); credentials.close(); }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("coordinator fails closed when credential or session binding schema is absent", () => {
  assert.throws(() => createCredentialRevocationCoordinator(), /schema_unavailable/);
});
