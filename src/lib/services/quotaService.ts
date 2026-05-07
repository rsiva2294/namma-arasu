import { db, isFirebaseConfigured } from "@/lib/db";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

interface QuotaRecord {
  fingerprint: string;
  count: number;
  lastResetDate: string; // YYYY-MM-DD
}

const LOCAL_STORAGE_KEY = "tvk_manifesto_synthesis_quota";
const MAX_DAILY_LIMIT = 10;

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate or retrieve persistent anonymous user fingerprint UUID
export function getUserFingerprint(): string {
  if (typeof window === "undefined") return "server-context";
  let fingerprint = localStorage.getItem("tvk_anon_fingerprint");
  if (!fingerprint) {
    fingerprint = crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("tvk_anon_fingerprint", fingerprint);
  }
  return fingerprint;
}

// Quota Service
export const quotaService = {
  /**
   * Checks if the user is allowed to perform an AI synthesis request.
   * Runs client-side (uses local storage) and can optionally sync to Firestore.
   */
  async checkAndIncrementQuota(fingerprint: string): Promise<{
    allowed: boolean;
    remaining: number;
    count: number;
  }> {
    const today = getTodayDateString();

    // 1. Local Storage fallback logic (always active to provide immediate feedback & robust fallback)
    let localRecord: QuotaRecord = {
      fingerprint,
      count: 0,
      lastResetDate: today,
    };

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as QuotaRecord;
          if (parsed.lastResetDate === today) {
            localRecord = parsed;
          } else {
            // New day, reset count
            localRecord = { fingerprint, count: 0, lastResetDate: today };
          }
        } catch {
          console.warn("Malformed quota record in localStorage. Resetting...");
        }
      }
    }

    // 2. Firestore Dynamic Synchronization (if configured)
    if (isFirebaseConfigured && db) {
      try {
        const quotaDocRef = doc(db, "quotas", fingerprint);
        const docSnap = await getDoc(quotaDocRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.lastResetDate === today) {
            // Document is from today
            const cloudCount = cloudData.count || 0;

            if (cloudCount >= MAX_DAILY_LIMIT) {
              // Cloud limit exceeded, sync local and return rejected
              localRecord.count = cloudCount;
              this.saveLocalQuota(localRecord);
              return { allowed: false, remaining: 0, count: cloudCount };
            }

            // Allowed: increment count in Firestore
            await updateDoc(quotaDocRef, {
              count: increment(1),
            });
            localRecord.count = cloudCount + 1;
          } else {
            // First request of a new day on Firestore, reset doc
            await setDoc(quotaDocRef, {
              fingerprint,
              count: 1,
              lastResetDate: today,
            });
            localRecord.count = 1;
          }
        } else {
          // Document does not exist, create it
          await setDoc(quotaDocRef, {
            fingerprint,
            count: 1,
            lastResetDate: today,
          });
          localRecord.count = 1;
        }

        this.saveLocalQuota(localRecord);
        return {
          allowed: true,
          remaining: Math.max(0, MAX_DAILY_LIMIT - localRecord.count),
          count: localRecord.count,
        };
      } catch (error) {
        console.warn("Firestore quota sync failed, relying solely on localStorage:", error);
      }
    }

    // 3. Fallback to Local Storage Only when Firestore fails or is disabled
    if (localRecord.count >= MAX_DAILY_LIMIT) {
      return { allowed: false, remaining: 0, count: localRecord.count };
    }

    localRecord.count += 1;
    this.saveLocalQuota(localRecord);

    return {
      allowed: true,
      remaining: Math.max(0, MAX_DAILY_LIMIT - localRecord.count),
      count: localRecord.count,
    };
  },

  /**
   * Retrieves the current remaining quota count without incrementing it.
   */
  getRemainingQuota(fingerprint: string): number {
    if (typeof window === "undefined" || !fingerprint) return MAX_DAILY_LIMIT;
    const today = getTodayDateString();
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as QuotaRecord;
        if (parsed.lastResetDate === today) {
          return Math.max(0, MAX_DAILY_LIMIT - parsed.count);
        }
      } catch {
        // ignore malformed
      }
    }
    return MAX_DAILY_LIMIT;
  },

  saveLocalQuota(record: QuotaRecord) {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(record));
    }
  },
};
