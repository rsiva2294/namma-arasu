import { describe, it, expect, beforeEach, vi } from "vitest";
import { promiseService } from "../lib/db";
import { INITIAL_MOCK_PROMISES } from "../lib/mockData";

describe("NammaArasu promiseService Core Engine", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  it("should successfully fetch initial promises list sorted chronologically", async () => {
    const promises = await promiseService.getPromises();
    expect(promises).toBeDefined();
    expect(Array.isArray(promises)).toBe(true);
    expect(promises.length).toBeGreaterThan(0);
    
    // Check that our journey showcase card exists
    const journey = promises.find(p => p.id === "p0-tvk-journey");
    expect(journey).toBeDefined();
    expect(journey?.title).toContain("TVK's Journey");
  });

  it("should successfully retrieve a single promise by id", async () => {
    const featuredId = "p0-tvk-journey";
    const promise = await promiseService.getPromiseById(featuredId);
    expect(promise).not.toBeNull();
    expect(promise?.id).toBe(featuredId);
    expect(promise?.status).toBe("Completed");
  });

  it("should return null when retrieving a promise with non-existent id", async () => {
    const nonExistent = await promiseService.getPromiseById("invalid-id-999");
    expect(nonExistent).toBeNull();
  });

  it("should update an existing promise status and progress_percentage", async () => {
    const targetId = "p0-tvk-journey";
    const originalPromise = await promiseService.getPromiseById(targetId);
    expect(originalPromise).not.toBeNull();

    const updated = await promiseService.updatePromise(targetId, {
      status: "In Progress",
      progress_percentage: 60,
    });

    expect(updated).not.toBeNull();
    expect(updated?.status).toBe("In Progress");
    expect(updated?.progress_percentage).toBe(60);

    // Verify it is persisted in local storage
    const reFetched = await promiseService.getPromiseById(targetId);
    expect(reFetched?.status).toBe("In Progress");
    expect(reFetched?.progress_percentage).toBe(60);
  });

  it("should add a comment and retrieve it successfully", async () => {
    const promiseId = "p0-tvk-journey";
    const newComment = await promiseService.addComment({
      promise_id: promiseId,
      author: "Test Activist",
      content: "Verified this milestone through official documents.",
    });

    expect(newComment).toBeDefined();
    expect(newComment.id).toBeDefined();
    expect(newComment.author).toBe("Test Activist");

    const comments = await promiseService.getCommentsByPromiseId(promiseId);
    const found = comments.find(c => c.id === newComment.id);
    expect(found).toBeDefined();
    expect(found?.content).toBe("Verified this milestone through official documents.");
  });

  it("should add citizen evidence and retrieve it successfully", async () => {
    const promiseId = "p0-tvk-journey";
    const newEvidence = await promiseService.addEvidence({
      promise_id: promiseId,
      type: "document",
      file_url: "https://example.com/gazette-proof.pdf",
      district: "Chennai",
      description: "Official Gazette notification proof.",
    });

    expect(newEvidence).toBeDefined();
    expect(newEvidence.id).toBeDefined();
    expect(newEvidence.verification_status).toBe("verified");

    const evidenceList = await promiseService.getEvidenceByPromiseId(promiseId);
    const found = evidenceList.find(e => e.id === newEvidence.id);
    expect(found).toBeDefined();
    expect(found?.file_url).toBe("https://example.com/gazette-proof.pdf");
  });
});
