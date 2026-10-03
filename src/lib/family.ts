export interface FamilyMember {
  id: string
  userId: string // Main account holder ID
  fullName: string
  dob: string // YYYY-MM-DD
  relationship: 'Self' | 'Father' | 'Mother' | 'Son' | 'Daughter' | 'Wife' | 'Husband' | 'Sibling' | 'Other'
  mobile: string
  email: string
  gender?: 'Male' | 'Female' | 'Other'
  medicalHistory?: string
  createdAt?: string
}

/**
 * Calculates exact age in years from Date of Birth (YYYY-MM-DD).
 * Handles edge cases like leap years and month/day comparisons.
 */
export function calculateAgeFromDob(dob: string): number {
  if (!dob) return 0
  try {
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return 0
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age < 0 ? 0 : age
  } catch {
    return 0
  }
}

/**
 * Retrieves family members stored in localStorage for current session (with fallback).
 */
export function getStoredFamilyMembers(userId: string): FamilyMember[] {
  if (typeof window === 'undefined' || !userId) return []
  try {
    const saved = localStorage.getItem(`falix_family_members_${userId}`)
    if (saved) {
      return JSON.parse(saved) as FamilyMember[]
    }
  } catch (err) {
    console.error('Error reading family members:', err)
  }
  return []
}

/**
 * Saves or updates a family member in localStorage.
 */
export function saveStoredFamilyMember(userId: string, member: FamilyMember): FamilyMember[] {
  if (typeof window === 'undefined' || !userId) return []
  const existing = getStoredFamilyMembers(userId)
  const index = existing.findIndex(m => m.id === member.id)
  
  let updated: FamilyMember[]
  if (index >= 0) {
    updated = [...existing]
    updated[index] = member
  } else {
    updated = [...existing, member]
  }
  
  try {
    localStorage.setItem(`falix_family_members_${userId}`, JSON.stringify(updated))
  } catch (err) {
    console.error('Error saving family member:', err)
  }
  return updated
}

/**
 * Deletes a family member from localStorage.
 */
export function deleteStoredFamilyMember(userId: string, memberId: string): FamilyMember[] {
  if (typeof window === 'undefined' || !userId) return []
  const existing = getStoredFamilyMembers(userId)
  const updated = existing.filter(m => m.id !== memberId)
  
  try {
    localStorage.setItem(`falix_family_members_${userId}`, JSON.stringify(updated))
  } catch (err) {
    console.error('Error deleting family member:', err)
  }
  return updated
}
