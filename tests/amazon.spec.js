import _ from 'lodash'
import * as amazon from '../src/amazon';
import {serverHost} from '../src/consts/config';
import searchResultsAmazonApiMock from './mock/searchResultsAmazonApiMock.js';
import amazonService from '../src/amazon';
import itemHtmlMock1 from './mock/itemHtmlMock1';
import itemHtmlMock2 from './mock/itemHtmlMock2';

describe('amazon service API should work as expected', () => {
  it('return a url to send to the server in order to get signed url for amazon api', async () => {
    const url = await amazon.generateUrl('query123');
    expect(url).toBe(`${serverHost}generate?search=query123&page=0&country=us`);
  })

  it('should return valid amazon api urls from server', async () => {
    let json = jest.fn((str) => Promise.resolve([`${str}1`, `${str}2`]));
    global.fetch = jest.fn((str) => Promise.resolve({json: () => json(str)}))

    const result = await amazon.getAmazonApiSignedUrls('url')
    expect(result.length).toBe(2)
    expect(_.every(result, String)).toBeTruthy()
  })

  it('should return 2 xml elements from amazon api in flatten array ', async () => {
    let text = jest.fn((str) => Promise.resolve('Some XML'));
    fetch = jest.fn((str) => Promise.resolve({text: () => text(str)}))

    const result = await amazon.getItemsFromAmazonApi(['url', 'url'])
    expect(result.length).toBe(2)
  })

  it('should return valid json object with 10 items from the Raw XML of amazon api', async () => {
    const result = await amazon.parseAmazonApiXmlToJson([searchResultsAmazonApiMock])
    expect(result[0][0].asin[0]).toBe('B000W5SLB8')
  })

  it('should return json parsed object for amazon api raw data', async () => {
    const parsed = await amazon.parseAmazonApiXmlToJson([searchResultsAmazonApiMock]);
    const result = amazon.parseAmazonJsonObjects(parsed);
    expect(result[0].asin).toBe('B000W5SLB8')
    expect(result[0].image).toBe('https://images-na.ssl-images-amazon.com/images/I/51lr4K3BWHL._SL75_.jpg')
    expect(result[0].largeImage).toBe('https://images-na.ssl-images-amazon.com/images/I/51lr4K3BWHL.jpg')
    expect(result[0].lowestPrice).toBe(48.99)
    expect(result[0].brand).toBe('Taste of the Wild')
    expect(result[0].category).toBe('Pet Products')
    expect(result[0].title).toBe('Taste of the Wild Dry Dog Food, High Prairie Canine Formula with Roasted Bison and Venison')
    expect(result[0].dimensions.height.value).toBe(425)
    expect(result[0].dimensions.height.unit).toBe('hundredths-inches')
    expect(result[0].dimensions.width.value).toBe(1701)
    expect(result[0].dimensions.width.unit).toBe('hundredths-inches')
    expect(result[0].dimensions.length.value).toBe(2551)
    expect(result[0].dimensions.length.unit).toBe('hundredths-inches')
    expect(result[0].dimensions.weight.value).toBe(3010)
    expect(result[0].dimensions.weight.unit).toBe('hundredths-pounds')
  })

  it('should return an entire parsed 20 results from amazon items htmls', async () => {
    global.text = jest.fn((str) => Promise.resolve(itemHtmlMock1));
    global.fetch = jest.fn((str) => Promise.resolve({text: () => text(str)}))

    const pingMock = jest.fn();
    const urls = _.fill(new Array(20), {url: 'url', asin:'1234'});
    const results = await amazon.fillSellersDataFromAmazon(urls, 'us', pingMock)
    expect(results.length).toBe(20);
    expect(results[0].reviewsCount).toBe(511)
    expect(results[0].reviewsRatings).toBe(4.5)
    expect(results[0].salesRank).toBe(1224)
    expect(results[0].category).toBe('home & kitchen')
    expect(results[0].fulfillment).toBe('fba')
    expect(results[0].buyBox).toBe(4)

    expect(pingMock).toHaveBeenCalledTimes(20)
  })

  it('should return an entire parsed 20 results from amazon items htmls', async () => {
    global.text = jest.fn((str) => Promise.resolve(itemHtmlMock2));
    global.fetch = jest.fn((str) => Promise.resolve({text: () => text(str)}))

    const pingMock = jest.fn();
    const urls = _.fill(new Array(20), {url: 'url', asin:'1234'});
    const results = await amazon.fillSellersDataFromAmazon(urls, 'us', pingMock)
    expect(results.length).toBe(20);
    expect(results[0].reviewsCount).toBe(2428)
    expect(results[0].reviewsRatings).toBe(4.7)
    expect(results[0].salesRank).toBe(3)
    expect(results[0].category).toBe('pet supplies')
    expect(results[0].fulfillment).toBe('amz')
    expect(results[0].buyBox).toBe(32)

    expect(pingMock).toHaveBeenCalledTimes(20)
  })
  //TODO: Test the fillSalesAmount
})


itemHtmlMock2
describe('amazon autocomplete should work as expected', () => {

  it('should return nothing if nothing passed', async () => {
    const result = await amazonService.autocomplete('');
    expect(result).toEqual([])
  })

  it('should return nothing if passed less than 2 chars', async () => {
    const result = await amazonService.autocomplete('d');
    expect(result).toEqual([])
  })

  it('should return 3 results when passed 3 chars', async () =>{
    global.text = jest.fn((str) => Promise.resolve('completion = ["dogs",["dogs clothes","dogswell happy hips","dogs toys","dogs playing poker","dogs treats","dogs bed","dogswell","dogs before dudes","dogs shoes","dogs coats for winter"],[{"nodes":[{"name":"Pet Supplies","alias":"pets"}]},{},{},{},{},{},{},{},{},{}],[],"3Q1LH695YIY95"];String();'));
    global.fetch = jest.fn((str) => Promise.resolve({text: () => text(str)}))

    const result = await amazonService.autocomplete('dog');
    expect(result.length).toBe(10)
    expect(result[0]).toBe('dogs clothes');
  })
});
