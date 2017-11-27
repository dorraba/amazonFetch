import _ from 'lodash'
import htmlParser from '../src/htmlParser';
import itemHtmlMock1 from './mock/itemHtmlMock1';
import itemHtmlMock2 from './mock/itemHtmlMock2';
import cheerio from 'cheerio';

describe('htmlParser service should work as expected itemHtmlMock1', () => {
  let $ = cheerio.load(_.toLower(itemHtmlMock1));

  it('should get 511 reviews for the item', () => {
    const result = htmlParser.getReviewsCount($);
    expect(result).toBe(511);
  })
  it('should get rating of 4.5 for the item', () => {
    const result = htmlParser.getRatings($);
    expect(result).toBe(4.5);
  })
  it('should get salesRank of ### and category of ### for the item', () => {
    const result = htmlParser.getSalesRankData($);
    expect(result.salesRank).toBe(1224);
    expect(result.category).toBe('home & kitchen');
  })
  it('should get fulfillment of FBA', () => {
    const result = htmlParser.getFulfillmenet($);
    expect(result).toBe('fba');
  })
  it('should get 4 buybox sellers', () => {
    const result = htmlParser.getBuyBoxSellers($);
    expect(result).toBe(4);
  })

});

describe('htmlParser service should work as expected itemHtmlMock2', () => {
  let $ = cheerio.load(_.toLower(itemHtmlMock2));

  it('should get 511 reviews for the item', () => {
    const result = htmlParser.getReviewsCount($);
    expect(result).toBe(2428);
  })
  it('should get rating of 4.5 for the item', () => {
    const result = htmlParser.getRatings($);
    expect(result).toBe(4.7);
  })
  it('should get salesRank of ### and category of ### for the item', () => {
    const result = htmlParser.getSalesRankData($);
    expect(result.salesRank).toBe(3);
    expect(result.category).toBe('pet supplies');
  })
  it('should get fulfillment of FBA', () => {
    const result = htmlParser.getFulfillmenet($);
    expect(result).toBe('amz');
  })
  it('should get 4 buybox sellers', () => {
    const result = htmlParser.getBuyBoxSellers($);
    expect(result).toBe(32);
  })
});