import { db } from './firebase-config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

interface Document {
  id: string;
  [key: string]: any;
}

class DatabaseService {
  async addDocument(collectionName: string, data: DocumentData): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding document: ', error);
      throw error;
    }
  }

  async getDocuments(collectionName: string): Promise<Document[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents: Document[] = [];
      
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`Retrieved ${documents.length} documents from ${collectionName}`);
      return documents;
    } catch (error) {
      console.error('Error getting documents: ', error);
      throw error;
    }
  }

  async updateDocument(collectionName: string, docId: string, data: DocumentData): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      console.log('Document updated with ID: ', docId);
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  }

  async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      console.log('Document deleted with ID: ', docId);
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();