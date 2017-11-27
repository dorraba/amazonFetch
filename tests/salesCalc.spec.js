import _ from 'lodash'
import htmlParser from '../src/salesCalc';
import {getMothlySalesForRank} from '../src/salesCalc'

describe('salesCalc service should work as expected', () => {
  it('should return null for salesRank 1350 in category Pet supplies, for USA', () => {
    const result = getMothlySalesForRank('us', 'dummy category', 1350)
    expect(result).toBeNull();
  })
  it('should return null if no sales rank was passed', () => {
    const result = getMothlySalesForRank('pet supplies')
    expect(result).toBe(null);
  })
  it('should return null if sales rank of 0 was passed', () => {
    const result = getMothlySalesForRank('pet supplies', 1)
    expect(result).toBe(null);
  })
  it('should return top sales for category if passed rank of 1', () => {
    const result = getMothlySalesForRank('pet supplies', 0)
    expect(result).toBe(null);
  })
  it('should return null if country not exists', () => {
    const result = getMothlySalesForRank('dummy', 'pet supplies', 0)
    expect(result).toBe(null);
  })
  it('should return 1110 for salesRank 1350 in category Pet supplies, for USA', () => {
    const result = getMothlySalesForRank('us', 'pet supplies', 1350)
    expect(result).toBe(1110);
  })
  it('should return XXXX for salesRank 2135 in category Home, for USA', () => {
    const result = getMothlySalesForRank('us', 'home', 2135)
    expect(result).toBe(719);
  })
  it('should return 0 for salesRank 1350000 in category Automotive parts and accessories, for USA', () => {
    const result = getMothlySalesForRank('us', 'automotive parts and accessories', 1350000)
    expect(result).toBe(0);
  })
  it('should return XXXX for salesRank 670 in category Office products, for USA', () => {
    const result = getMothlySalesForRank('us', 'office products', 1350)
    expect(result).toBe(1521);
  })
  it('should return XXXX for salesRank 14879 in category toys & games, for USA', () => {
    const result = getMothlySalesForRank('us', 'toys & games', 14879)
    expect(result).toBe(130);
  })
});