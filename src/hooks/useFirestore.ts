import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import type { Project, Task, Note } from '@/types';

function getDb(): Firestore {
  if (!db) throw new Error('Firebase não configurado');
  return db;
}

function userCollection(userId: string, name: string) {
  return collection(getDb(), 'users', userId, name);
}

function mapDoc<T>(id: string, data: DocumentData): T {
  return { id, ...data } as T;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      userCollection(user.uid, 'projects'),
      orderBy('createdAt', 'desc'),
    );

    return onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => mapDoc<Project>(d.id, d.data())));
      setLoading(false);
    });
  }, [user]);

  const addProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    await addDoc(userCollection(user.uid, 'projects'), { ...data, createdAt: now, updatedAt: now });
  };

  const updateProject = async (id: string, data: Partial<Project>) => {
    if (!user) return;
    await updateDoc(doc(getDb(), 'users', user.uid, 'projects', id), { ...data, updatedAt: Date.now() });
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getDb(), 'users', user.uid, 'projects', id));
  };

  return { projects, loading, addProject, updateProject, deleteProject };
}

export function useTasks(projectId?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const constraints = projectId
      ? [where('projectId', '==', projectId), orderBy('createdAt', 'desc')]
      : [orderBy('createdAt', 'desc')];

    const q = query(userCollection(user.uid, 'tasks'), ...constraints);

    return onSnapshot(q, (snap) => {
      setTasks(snap.docs.map((d) => mapDoc<Task>(d.id, d.data())));
      setLoading(false);
    });
  }, [user, projectId]);

  const addTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    await addDoc(userCollection(user.uid, 'tasks'), { ...data, createdAt: now, updatedAt: now });
  };

  const updateTask = async (id: string, data: Partial<Task>) => {
    if (!user) return;
    await updateDoc(doc(getDb(), 'users', user.uid, 'tasks', id), { ...data, updatedAt: Date.now() });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getDb(), 'users', user.uid, 'tasks', id));
  };

  return { tasks, loading, addTask, updateTask, deleteTask };
}

export function useNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const q = query(
      userCollection(user.uid, 'notes'),
      orderBy('updatedAt', 'desc'),
    );

    return onSnapshot(q, (snap) => {
      setNotes(snap.docs.map((d) => mapDoc<Note>(d.id, d.data())));
      setLoading(false);
    });
  }, [user]);

  const addNote = async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    await addDoc(userCollection(user.uid, 'notes'), { ...data, createdAt: now, updatedAt: now });
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    if (!user) return;
    await updateDoc(doc(getDb(), 'users', user.uid, 'notes', id), { ...data, updatedAt: Date.now() });
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(getDb(), 'users', user.uid, 'notes', id));
  };

  return { notes, loading, addNote, updateNote, deleteNote };
}
