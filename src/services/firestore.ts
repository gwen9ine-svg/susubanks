
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// A placeholder for a more robust data fetching service.
// In a real app, you'd have more specific functions like `getUsers`, `getTransactions`, etc.
export async function getCollection(collectionName: string) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
}

// Example seed function (you would call this once, perhaps from a script)
export async function seedDatabase() {
    const members = [
      { id: '1', name: "Kofi Adu", email: "k.adu@example.com", avatar: "https://picsum.photos/100/100?a", role: "Admin", contributed: "GH₵2,500", status: "Active" },
      { id: '2', name: "Ama Serwaa", email: "a.serwaa@example.com", avatar: "https://picsum.photos/100/100?b", role: "Member", contributed: "GH₵1,750", status: "Active" },
      { id: '3', name: "Yaw Mensah", email: "y.mensah@example.com", avatar: "https://picsum.photos/100/100?c", role: "Member", contributed: "GH₵2,000", status: "On Leave" },
      { id: '4', name: "Adwoa Boateng", email: "a.boateng@example.com", avatar: "https://picsum.photos/100/100?d", role: "Member", contributed: "GH₵2,200", status: "Active" },
      { id: '5', name: "Kwame Nkrumah", email: "k.nkrumah@example.com", avatar: "https://picsum.photos/100/100?e", role: "Member", contributed: "GH₵1,500", status: "Suspended" },
    ];

    const membersRef = collection(db, 'members');
    for (const member of members) {
        // In a real app, you'd use addDoc or setDoc with a specific ID
        // For simplicity, we are not implementing a full seeding script here.
        console.log(`Would seed member: ${member.name}`);
    }
}
