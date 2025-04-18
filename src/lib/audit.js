
import { storage } from "@/lib/storage"

export const audit = {
  log: (action, details) => {
    const user = storage.get("user")
    const logs = storage.get("audit_logs") || []
    
    const log = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: user?.id || "system",
      userName: user?.name || "Sistema",
      action,
      details,
      ip: window.location.hostname,
      userAgent: navigator.userAgent
    }
    
    logs.push(log)
    storage.set("audit_logs", logs)
    
    return log
  },
  
  getLogs: (filters = {}) => {
    const logs = storage.get("audit_logs") || []
    
    return logs.filter(log => {
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.action && log.action !== filters.action) return false
      if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false
      if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false
      return true
    })
  },
  
  clearOldLogs: (daysToKeep = 30) => {
    const logs = storage.get("audit_logs") || []
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) > cutoffDate
    )
    
    storage.set("audit_logs", filteredLogs)
  }
}
