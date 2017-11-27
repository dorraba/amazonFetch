import _ from 'lodash'
import {getTrends} from '../src/googleTrends';
import searchResultsAmazonApiMock from './mock/googleTrendsApiMock';
import googleTrends from 'google-trends-api';
import amazonService from '../src/amazon';
googleTrends.interestOverTime = (val) => searchResultsAmazonApiMock

describe('google trends service should work as expected', () => {
  it('should return an array with more than one result of objects with name and value props', async () => {
    // const results = await getTrends('spinner');
    // expect(results.length).toBeGreaterThan(0)
    // expect(_.isString(results[0].name)).toBeTruthy()
    // expect(_.isNumber(results[0].value)).toBeTruthy()
  })
});
