"use client"

import { useEffect, useMemo, useState } from "react"
import { getFirebaseDb } from "@/lib/firebase"
import { ref as dbRef, onValue, push, set, update, remove, get, child } from "firebase/database"

export type RTDBItem<T = any> = { id: string; data: T }

export function useRTDBList<T = any>(path: string) {
  const [items, setItems] = useState<RTDBItem<T>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const db = getFirebaseDb()

  useEffect(() => {
    setIsLoading(true)
    const r = dbRef(db, path)
    const unsubscribe = onValue(
      r,
      (snap) => {
        const val = snap.val() || {}
        const list: RTDBItem<T>[] = Object.keys(val).map((k) => ({
          id: k,
          data: val[k],
        }))
        setItems(list)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message)
        setIsLoading(false)
      },
    )
    return () => {
      // Use the unsubscribe returned by onValue
      unsubscribe()
    }
  }, [db, path])

  const api = useMemo(() => {
    return {
      async create(value: T, id?: string) {
        if (id) {
          await set(dbRef(db, `${path}/${id}`), value)
          return id
        }
        const newRef = push(dbRef(db, path))
        await set(newRef, value)
        return newRef.key as string
      },
      async read(id: string) {
        const snap = await get(child(dbRef(db), `${path}/${id}`))
        return snap.val()
      },
      async update(id: string, value: Partial<T>) {
        await update(dbRef(db, `${path}/${id}`), value as any)
      },
      async replace(id: string, value: T) {
        await set(dbRef(db, `${path}/${id}`), value)
      },
      async remove(id: string) {
        await remove(dbRef(db, `${path}/${id}`))
      },
    }
  }, [path])

  return { items, isLoading, error, ...api }
}
