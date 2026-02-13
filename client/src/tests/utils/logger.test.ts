import { describe, it, expect, beforeEach, vi } from 'vitest'
import Logger from '../../utils/logger'

describe('Logger', () => {
  beforeEach(() => {
    Logger.clearLogs()
    localStorage.clear()
  })

  describe('logInput', () => {
    it('should log input to localStorage', () => {
      const input = { username: 'testuser', password: 'testpass' }
      Logger.logInput('login', input)

      const logs = JSON.parse(localStorage.getItem('user_input_logs') || '[]')
      expect(logs).toHaveLength(1)
      expect(logs[0].page).toBe('login')
      expect(logs[0].input).toEqual(input)
      expect(logs[0].timestamp).toBeDefined()
    })

    it('should not log empty input', () => {
      Logger.logInput('login', {})
      const logs = JSON.parse(localStorage.getItem('user_input_logs') || '[]')
      expect(logs).toHaveLength(0)
    })

    it('should sanitize long strings', () => {
      const longString = 'a'.repeat(2000)
      Logger.logInput('test', { longField: longString })

      const logs = JSON.parse(localStorage.getItem('user_input_logs') || '[]')
      expect(logs[0].input.longField).toHaveLength(1000)
    })

    it('should limit logs to MAX_LOGS', () => {
      for (let i = 0; i < 1001; i++) {
        Logger.logInput('test', { index: i })
      }

      const logs = JSON.parse(localStorage.getItem('user_input_logs') || '[]')
      expect(logs).toHaveLength(1000)
      expect(logs[0].input.index).toBe(1) // First entry should be removed
    })

    it('should include userAgent', () => {
      Logger.logInput('test', { field: 'value' })
      const logs = JSON.parse(localStorage.getItem('user_input_logs') || '[]')
      expect(logs[0].userAgent).toBeDefined()
    })
  })

  describe('getLogsForDate', () => {
    it('should return logs for specific date', () => {
      const today = new Date().toISOString().split('T')[0]
      
      Logger.logInput('page1', { data: 'test1' })
      Logger.logInput('page2', { data: 'test2' })

      const logs = Logger.getLogsForDate(today)
      expect(logs.length).toBeGreaterThanOrEqual(2)
      logs.forEach(log => {
        expect(log.timestamp.startsWith(today)).toBe(true)
      })
    })

    it('should return empty array for date with no logs', () => {
      Logger.logInput('test', { data: 'test' })
      const futureDate = '2099-12-31'
      const logs = Logger.getLogsForDate(futureDate)
      expect(logs).toHaveLength(0)
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      Logger.logInput('test', { data: 'test' })
      expect(localStorage.getItem('user_input_logs')).toBeTruthy()

      Logger.clearLogs()
      expect(localStorage.getItem('user_input_logs')).toBeNull()
    })
  })
})
