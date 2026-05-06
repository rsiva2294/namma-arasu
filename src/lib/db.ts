import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc, 
  query, 
  where 
} from "firebase/firestore";
import { PromiseItem, UpdateItem, EvidenceItem, CommentItem, DistrictStats, PromiseStatus } from "@/types";
import { INITIAL_MOCK_PROMISES, INITIAL_MOCK_UPDATES, INITIAL_MOCK_EVIDENCE, INITIAL_MOCK_COMMENTS, TAMIL_NADU_DISTRICTS } from "./mockData";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.appId
);

// Alias for Sidebar compatibility to avoid breaking UI changes
export const isSupabaseConfigured = isFirebaseConfigured;

const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

export const db = app ? getFirestore(app) : null;

// ==========================================================
// LOCAL STORAGE FALLBACK ENGINE
// ==========================================================

const LOCAL_KEYS = {
  PROMISES: "namma_arasu_promises",
  UPDATES: "namma_arasu_updates",
  EVIDENCE: "namma_arasu_evidence",
  COMMENTS: "namma_arasu_comments",
};

const CACHE_VERSION = "v3_budget_cleared";

// Safely initialize local storage with mock data
const initLocalStorage = () => {
  if (typeof window === "undefined") return;

  const currentVersion = localStorage.getItem("namma_arasu_cache_version");
  const localPromises = localStorage.getItem(LOCAL_KEYS.PROMISES);
  
  const shouldReset = 
    currentVersion !== CACHE_VERSION || 
    !localPromises || 
    JSON.parse(localPromises).length !== INITIAL_MOCK_PROMISES.length;

  if (shouldReset) {
    localStorage.setItem("namma_arasu_cache_version", CACHE_VERSION);
    localStorage.setItem(LOCAL_KEYS.PROMISES, JSON.stringify(INITIAL_MOCK_PROMISES));
    localStorage.setItem(LOCAL_KEYS.UPDATES, JSON.stringify(INITIAL_MOCK_UPDATES));
    localStorage.setItem(LOCAL_KEYS.EVIDENCE, JSON.stringify(INITIAL_MOCK_EVIDENCE));
    localStorage.setItem(LOCAL_KEYS.COMMENTS, JSON.stringify(INITIAL_MOCK_COMMENTS));
  }
};

const getLocalData = <T>(key: string, defaultData: T[]): T[] => {
  if (typeof window === "undefined") return defaultData;
  initLocalStorage();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultData;
};

const setLocalData = <T>(key: string, data: T[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================================
// DATABASE INTERACTION METHODS
// ==========================================================

export const promiseService = {
  // Fetch all promises
  // Fetch all promises
  async getPromises(): Promise<PromiseItem[]> {
    const localBase = getLocalData<PromiseItem>(LOCAL_KEYS.PROMISES, INITIAL_MOCK_PROMISES);

    if (isFirebaseConfigured && db) {
      try {
        const promisesCol = collection(db, "promises");
        const snapshot = await getDocs(promisesCol);
        
        if (snapshot.empty) {
          console.log("Firestore promises collection is empty. Seeding featured example...");
          const featured = INITIAL_MOCK_PROMISES.find(p => p.id === "p0-tvk-journey");
          if (featured) {
            await setDoc(doc(db, "promises", featured.id), featured);
          }
          for (const u of INITIAL_MOCK_UPDATES) {
            await setDoc(doc(db, "updates", u.id), u);
          }
          for (const ev of INITIAL_MOCK_EVIDENCE) {
            await setDoc(doc(db, "evidence", ev.id), ev);
          }
          for (const c of INITIAL_MOCK_COMMENTS) {
            await setDoc(doc(db, "comments", c.id), c);
          }
          return localBase.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
        }

        const firestoreUpdates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Partial<PromiseItem>[];
        
        // Automated Self-Healing Sync: Prune any Firestore documents that are not our featured showcase journey card p0-tvk-journey
        const orphanedDocs = snapshot.docs.filter((d) => d.id !== "p0-tvk-journey");
        
        if (orphanedDocs.length > 0) {
          console.log(`Self-healing sync active: Pruning ${orphanedDocs.length} orphaned cloud documents...`);
          const { deleteDoc } = await import("firebase/firestore");
          for (const d of orphanedDocs) {
            await deleteDoc(doc(db, "promises", d.id));
          }
        }

        // Merge Firestore dynamic updates onto our static promises base
        const merged = localBase.map((localPromise) => {
          const update = firestoreUpdates.find((u) => u.id === localPromise.id);
          return update ? { ...localPromise, ...update } : localPromise;
        });

        // Sort client side to bypass immediate complex composite index requirement on firestore
        return merged.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
      } catch (error) {
        console.warn("Firestore fetch failed, falling back to local:", error);
      }
    }
    return localBase.sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime());
  },

  // Fetch a single promise by id
  async getPromiseById(id: string): Promise<PromiseItem | null> {
    const promises = getLocalData<PromiseItem>(LOCAL_KEYS.PROMISES, INITIAL_MOCK_PROMISES);
    const localPromise = promises.find((p) => p.id === id) || null;

    if (isFirebaseConfigured && db && localPromise) {
      try {
        const docRef = doc(db, "promises", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { ...localPromise, ...docSnap.data() } as PromiseItem;
        }
      } catch (error) {
        console.warn("Firestore promise fetch failed:", error);
      }
    }
    return localPromise;
  },

  // Update a promise (e.g., status, progress)
  async updatePromise(id: string, updates: Partial<PromiseItem>): Promise<PromiseItem | null> {
    const updatedAt = new Date().toISOString();
    
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "promises", id);
        await updateDoc(docRef, { ...updates, updated_at: updatedAt });
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as PromiseItem;
        }
      } catch (error) {
        console.warn("Firestore update failed, falling back to local:", error);
      }
    }

    const promises = getLocalData<PromiseItem>(LOCAL_KEYS.PROMISES, INITIAL_MOCK_PROMISES);
    const index = promises.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedPromise = {
      ...promises[index],
      ...updates,
      updated_at: updatedAt,
    };
    promises[index] = updatedPromise;
    setLocalData(LOCAL_KEYS.PROMISES, promises);
    return updatedPromise;
  },

  // Update status and append official progress log automatically
  async transitionPromiseStatus(id: string, newStatus: PromiseStatus, progress: number, logDescription: string): Promise<PromiseItem | null> {
    const updated = await this.updatePromise(id, {
      status: newStatus,
      progress_percentage: progress,
    });
    
    if (updated) {
      await this.addUpdate({
        promise_id: id,
        title: `Status updated to ${newStatus}`,
        description: logDescription,
        created_by: "Official Administrator",
      });
    }
    return updated;
  },

  // Fetch chronological updates for a promise
  async getUpdatesByPromiseId(promiseId: string): Promise<UpdateItem[]> {
    const localList = getLocalData<UpdateItem>(LOCAL_KEYS.UPDATES, INITIAL_MOCK_UPDATES).filter((u) => u.promise_id === promiseId);

    if (isFirebaseConfigured && db) {
      try {
        const updatesCol = collection(db, "updates");
        const q = query(updatesCol, where("promise_id", "==", promiseId));
        const snapshot = await getDocs(q);
        const cloudList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UpdateItem[];
        
        // Merge cloud items, avoiding duplicates
        const merged = [...localList];
        cloudList.forEach((cloudItem) => {
          if (!merged.some((localItem) => localItem.id === cloudItem.id)) {
            merged.push(cloudItem);
          }
        });
        
        return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (error) {
        console.warn("Firestore updates fetch failed:", error);
      }
    }
    return localList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Add an update timeline entry
  async addUpdate(update: Omit<UpdateItem, "id" | "created_at">): Promise<UpdateItem> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newUpdate: UpdateItem = {
      ...update,
      id,
      created_at: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "updates", id);
        await setDoc(docRef, newUpdate);
        return newUpdate;
      } catch (error) {
        console.warn("Firestore add update failed, falling back:", error);
      }
    }

    const updates = getLocalData<UpdateItem>(LOCAL_KEYS.UPDATES, INITIAL_MOCK_UPDATES);
    updates.unshift(newUpdate);
    setLocalData(LOCAL_KEYS.UPDATES, updates);
    return newUpdate;
  },

  // Fetch citizen-uploaded evidence for a promise
  async getEvidenceByPromiseId(promiseId: string): Promise<EvidenceItem[]> {
    const localList = getLocalData<EvidenceItem>(LOCAL_KEYS.EVIDENCE, INITIAL_MOCK_EVIDENCE).filter((e) => e.promise_id === promiseId);

    if (isFirebaseConfigured && db) {
      try {
        const evidenceCol = collection(db, "evidence");
        const q = query(evidenceCol, where("promise_id", "==", promiseId));
        const snapshot = await getDocs(q);
        const cloudList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as EvidenceItem[];
        
        const merged = [...localList];
        cloudList.forEach((cloudItem) => {
          if (!merged.some((localItem) => localItem.id === cloudItem.id)) {
            merged.push(cloudItem);
          }
        });
        
        return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (error) {
        console.warn("Firestore evidence fetch failed:", error);
      }
    }
    return localList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // Add citizen evidence
  async addEvidence(evidence: Omit<EvidenceItem, "id" | "verification_status" | "created_at">): Promise<EvidenceItem> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newEvidence: EvidenceItem = {
      ...evidence,
      id,
      verification_status: "verified", // Auto-verify in MVP mode to make it satisfying!
      created_at: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "evidence", id);
        await setDoc(docRef, newEvidence);
        return newEvidence;
      } catch (error) {
        console.warn("Firestore insert evidence failed:", error);
      }
    }

    const evidenceList = getLocalData<EvidenceItem>(LOCAL_KEYS.EVIDENCE, INITIAL_MOCK_EVIDENCE);
    evidenceList.unshift(newEvidence);
    setLocalData(LOCAL_KEYS.EVIDENCE, evidenceList);
    return newEvidence;
  },

  // Fetch comments for a promise
  async getCommentsByPromiseId(promiseId: string): Promise<CommentItem[]> {
    const localList = getLocalData<CommentItem>(LOCAL_KEYS.COMMENTS, INITIAL_MOCK_COMMENTS).filter((c) => c.promise_id === promiseId);

    if (isFirebaseConfigured && db) {
      try {
        const commentsCol = collection(db, "comments");
        const q = query(commentsCol, where("promise_id", "==", promiseId));
        const snapshot = await getDocs(q);
        const cloudList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as CommentItem[];
        
        const merged = [...localList];
        cloudList.forEach((cloudItem) => {
          if (!merged.some((localItem) => localItem.id === cloudItem.id)) {
            merged.push(cloudItem);
          }
        });
        
        return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (error) {
        console.warn("Firestore comments fetch failed:", error);
      }
    }
    return localList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },


  // Add a comment
  async addComment(comment: Omit<CommentItem, "id" | "created_at">): Promise<CommentItem> {
    const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
    const newComment: CommentItem = {
      ...comment,
      id,
      created_at: new Date().toISOString(),
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "comments", id);
        await setDoc(docRef, newComment);
        return newComment;
      } catch (error) {
        console.warn("Firestore comment insert failed:", error);
      }
    }

    const comments = getLocalData<CommentItem>(LOCAL_KEYS.COMMENTS, INITIAL_MOCK_COMMENTS);
    comments.unshift(newComment);
    setLocalData(LOCAL_KEYS.COMMENTS, comments);
    return newComment;
  },

  // Fetch district analytics summary
  async getDistrictStats(): Promise<DistrictStats[]> {
    const promises = await this.getPromises();
    const evidenceList = getLocalData<EvidenceItem>(LOCAL_KEYS.EVIDENCE, INITIAL_MOCK_EVIDENCE);

    return TAMIL_NADU_DISTRICTS.map((districtName) => {
      // Find promises that affect this district
      const affected = promises.filter(
        (p) => p.districts?.includes(districtName) || p.districts?.includes("All Districts")
      );

      const completed = affected.filter((p) => p.status === "Completed");
      const active = affected.filter((p) => ["In Progress", "Budget Allocated", "Planned"].includes(p.status));
      const delayed = affected.filter((p) => p.status === "Delayed" || p.status === "Blocked");
      
      const districtEvidence = evidenceList.filter((e) => e.district === districtName).length;

      const completionRate = affected.length > 0
        ? Math.round((completed.length / affected.length) * 100)
        : 0;

      return {
        name: districtName,
        totalPromises: affected.length,
        completedPromises: completed.length,
        activePromises: active.length,
        delayedPromises: delayed.length,
        evidenceCount: districtEvidence,
        completionRate,
      };
    }).sort((a, b) => b.totalPromises - a.totalPromises); // Sort by highest involvement
  }
};
