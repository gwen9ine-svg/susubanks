
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc, addDoc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// A placeholder for a more robust data fetching service.
// In a real app, you'd have more specific functions like `getUsers`, `getTransactions`, etc.
export async function getCollection(collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error)
 {
    console.error(`Error fetching ${collectionName}:`, error);
    // Return empty array if collection doesn't exist, which is expected before seeding.
    return [];
  }
}

export async function addDocument(collectionName: string, data: any, id?: string) {
    try {
        if (id) {
            // Use setDoc if a specific ID is provided
            await setDoc(doc(db, collectionName, id), data);
            return { success: true, id };
        } else {
            // Use addDoc for Firestore to auto-generate an ID
            const docRef = await addDoc(collection(db, collectionName), data);
            return { success: true, id: docRef.id };
        }
    } catch (error) {
        console.error('Error adding document:', error);
        return { success: false, error: "Failed to add document." };
    }
}

export async function deleteDocument(collectionName: string, docId: string) {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { success: false, error: "Failed to delete document." };
    }
}

export async function updateDocument(collectionName: string, docId: string, data: any) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return { success: true };
    } catch (error) {
        console.error('Error updating document:', error);
        return { success: false, error: "Failed to update document." };
    }
}


// Example seed function (you would call this once, perhaps from a script)
export async function seedDatabase() {
    const adminUserRef = doc(db, 'members', 'admin-user');
    const adminUserSnap = await getDoc(adminUserRef);

    // Only seed if the admin user doesn't exist.
    if (!adminUserSnap.exists()) {
        console.log('Admin user not found, seeding database...');
        const members = [
          { 
            id: 'admin-user', 
            name: "Admin User", 
            email: "admin@susu.bank", 
            avatar: "https://picsum.photos/100/100?d", 
            role: "Admin",
            password: "password123",
            contributed: "GH₵0.00",
            status: "Active"
          }
        ];
        
        const transactions = [
            { id: 'tx1', ref: "CONT-07-2024-A1", member: "Kofi Adu", email: "k.adu@example.com", avatar: "https://picsum.photos/100/100?a", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024", status: "Completed" },
            { id: 'tx2', ref: "WDR-07-2024-C3", member: "Yaw Mensah", email: "y.mensah@example.com", avatar: "https://picsum.photos/100/100?c", type: "Withdrawal", amount: "GH₵1,000.00", date: "July 2, 2024", status: "Pending", desc: "emergency" },
            { id: 'tx3', ref: "CONT-07-2024-B2", member: "Ama Serwaa", email: "a.serwaa@example.com", avatar: "https://picsum.photos/100/100?b", type: "Contribution", amount: "GH₵250.00", date: "July 1, 2024", status: "Completed" },
        ];

        const loans = [
            { id: 'loan1', memberId: '3', memberName: 'Yaw Mensah', amount: 'GH₵1000.00', date: 'June 15, 2024', status: 'Outstanding' },
            { id: 'loan2', memberId: '4', memberName: 'Adwoa Boateng', amount: 'GH₵2200.00', date: 'July 1, 2024', status: 'Outstanding' },
            { id: 'loan3', memberId: '1', memberName: 'Kofi Adu', amount: 'GH₵500.00', date: 'April 5, 2024', status: 'Paid' },
        ];

        try {
            const batch = writeBatch(db);
            
            members.forEach((member) => {
                const docRef = doc(db, 'members', member.id);
                batch.set(docRef, member);
            });

            transactions.forEach((transaction) => {
                const docRef = doc(db, 'transactions', transaction.id);
                batch.set(docRef, transaction);
            });
            
            loans.forEach((loan) => {
                const docRef = doc(db, 'loans', loan.id);
                batch.set(docRef, loan);
            });

            await batch.commit();
            console.log('Database seeded successfully!');
            return { success: true };
        } catch (error) {
            console.error('Error seeding database:', error);
            return { success: false, error: "Failed to seed database." };
        }
    }
    return { success: true, message: 'Database already seeded.' };
}

export { writeBatch };

    