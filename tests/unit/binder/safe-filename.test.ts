import { describe, it, expect } from 'vitest'
import { safeFileName, padExhibitNo, exhibitFileName } from '@/lib/binder/safe-filename'

describe('safeFileName', () => {
  it('replaces spaces with underscores', () => {
    expect(safeFileName('My Document Name')).toBe('My_Document_Name')
  })

  it('removes slashes', () => {
    expect(safeFileName('path/to/file')).toBe('path_to_file')
    expect(safeFileName('path\\to\\file')).toBe('path_to_file')
  })

  it('removes control characters', () => {
    expect(safeFileName('file\x00name\x1Fhere')).toBe('file_name_here')
  })

  it('collapses consecutive underscores', () => {
    expect(safeFileName('a   b   c')).toBe('a_b_c')
  })

  it('trims leading/trailing underscores and dots', () => {
    expect(safeFileName('...file...')).toBe('file')
    expect(safeFileName('___file___')).toBe('file')
  })

  it('truncates to maxLen preserving extension', () => {
    const longName = 'A'.repeat(100) + '.pdf'
    const result = safeFileName(longName, 20)
    expect(result.length).toBeLessThanOrEqual(20)
    expect(result.endsWith('.pdf')).toBe(true)
  })

  it('truncates without extension if no dot', () => {
    const longName = 'A'.repeat(100)
    const result = safeFileName(longName, 30)
    expect(result.length).toBeLessThanOrEqual(30)
  })

  it('returns unnamed for empty input', () => {
    expect(safeFileName('')).toBe('unnamed')
    expect(safeFileName('...')).toBe('unnamed')
  })

  it('preserves allowed characters', () => {
    expect(safeFileName('file-name_v2.0.pdf')).toBe('file-name_v2.0.pdf')
  })
})

describe('padExhibitNo', () => {
  it('pads numeric strings to 3 digits', () => {
    expect(padExhibitNo('1')).toBe('001')
    expect(padExhibitNo('12')).toBe('012')
    expect(padExhibitNo('123')).toBe('123')
  })

  it('leaves alpha strings unchanged', () => {
    expect(padExhibitNo('A')).toBe('A')
    expect(padExhibitNo('Z')).toBe('Z')
  })
})

describe('exhibitFileName', () => {
  it('builds deterministic filename from exhibit data', () => {
    const result = exhibitFileName('1', 'Lease Agreement', 'scan_2024.pdf')
    expect(result).toBe('Exhibit_001_Lease_Agreement.pdf')
  })

  it('uses original filename when title is null', () => {
    const result = exhibitFileName('2', null, 'photo.jpg')
    expect(result).toBe('Exhibit_002_photo.jpg')
  })

  it('handles files without extension', () => {
    const result = exhibitFileName('A', 'Notes', 'notes_file')
    expect(result).toBe('Exhibit_A_Notes')
  })

  it('sanitizes unsafe characters in title', () => {
    const result = exhibitFileName('3', 'My/Bad\\Title', 'file.pdf')
    expect(result).toBe('Exhibit_003_My_Bad_Title.pdf')
  })

  it('truncates very long titles', () => {
    const longTitle = 'A'.repeat(200)
    const result = exhibitFileName('1', longTitle, 'file.pdf')
    // Exhibit_001_ (12) + stem (≤50) + .pdf (4) = 66 max
    expect(result.length).toBeLessThanOrEqual(66)
    expect(result.startsWith('Exhibit_001_')).toBe(true)
    expect(result.endsWith('.pdf')).toBe(true)
  })
})
