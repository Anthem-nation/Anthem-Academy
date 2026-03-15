import { describe, it, expect } from 'vitest'
import { getPaginationRange } from '@/lib/utils/pagination'

describe('getPaginationRange', () => {
  it('returns correct offset and totalPages for page 1', () => {
    expect(getPaginationRange(1, 20, 45)).toEqual({ offset: 0, totalPages: 3 })
  })

  it('returns correct offset for page 3', () => {
    expect(getPaginationRange(3, 20, 45)).toEqual({ offset: 40, totalPages: 3 })
  })

  it('clamps page 0 to page 1', () => {
    expect(getPaginationRange(0, 20, 45)).toEqual({ offset: 0, totalPages: 3 })
  })

  it('clamps page > totalPages to last page', () => {
    expect(getPaginationRange(99, 20, 45)).toEqual({ offset: 40, totalPages: 3 })
  })

  it('handles total of 0 (totalPages = 1, offset = 0)', () => {
    expect(getPaginationRange(1, 20, 0)).toEqual({ offset: 0, totalPages: 1 })
  })

  it('handles exact multiple of pageSize', () => {
    expect(getPaginationRange(2, 20, 40)).toEqual({ offset: 20, totalPages: 2 })
  })

  it('handles total smaller than pageSize', () => {
    expect(getPaginationRange(1, 20, 5)).toEqual({ offset: 0, totalPages: 1 })
  })
})
