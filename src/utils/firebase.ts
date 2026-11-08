import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export interface StudioCloudProject {
  id: string;
  title: string;
  lastModified: number;
  clipsCount: number;
  scenesCount: number;
  authorEmail?: string;
  notes?: string;
}

// Anonymous or user auth helper
export async function ensureAuthUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous auth notice:', err);
    return null;
  }
}

// Save studio project metadata to Firestore
export async function saveProjectToFirestore(project: StudioCloudProject): Promise<boolean> {
  try {
    const user = await ensureAuthUser();
    const docRef = doc(db, 'projects', project.id);
    await setDoc(docRef, {
      ...project,
      userId: user?.uid || 'sovereign_guest',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore saveProject error:', err);
    return false;
  }
}

// Load cloud projects
export async function loadProjectsFromFirestore(): Promise<StudioCloudProject[]> {
  try {
    const colRef = collection(db, 'projects');
    const snap = await getDocs(colRef);
    const list: StudioCloudProject[] = [];
    snap.forEach((d) => {
      list.push(d.data() as StudioCloudProject);
    });
    return list;
  } catch (err) {
    console.warn('Firestore loadProjects notice:', err);
    return [];
  }
}
