
import {initializeStats, generateStats} from '../src/stats';
import agg from '../src/stats/aggregations';
import generalCountCalc from '../src/stats/generalCountCalc';
import {getRankScore} from '../src/stats/scoreCalc';
import {generateExplanations} from '../src/stats/explanations';
import results from './mock/finalResultsMock';
import _ from 'lodash';

const SALES_RANK_LIMITS = [1000,3000,8000,15000,1000000];
const REVIEWS_COUNT_LIMITS = [50,200,500,1000,100000];
const SELLER_VALUES = ['AMZ','FBA','FBM'];
const items = _.filter(results.items, (x=> {return !x.isIgnored && x.salesRank>0}));

describe('Calculator ', function() {
  it('results should ba valid', function() {
    expect(items).toBeTruthy();
    expect(items.length).toEqual(20);
  });
  //aggregation check
  it('Should get results grouped by sales rank with 3 items between 1000 and 3000 rank', function() {
    var ranks = agg.groupItemsByRange(items, 'salesRank', SALES_RANK_LIMITS);
    expect(ranks[1].length).toEqual(3);
  })

  it('Should get results grouped by reviews rank with 3 items between 50 and 200 reviews', function() {
    var ranks = agg.groupItemsByRange(items, 'reviewsCount', REVIEWS_COUNT_LIMITS);
    expect(ranks[1].length).toEqual(3);
  })

  it('Should return correct average price exluding zeros', function() {
    var average = agg.average(items, 'lowestPrice')
    expect(average).toEqual(22.05);
  })

  //Score calc test
  it('Should return sales rank scroe of 53 out of 100', function() {
    var score = getRankScore(items, 'salesRank', SALES_RANK_LIMITS);
    expect(score).toEqual(53);
  });

  it('Should return reviews count scroe of 58 out of 100', function() {
    var score =getRankScore(items, 'reviewsCount', REVIEWS_COUNT_LIMITS, true);
    expect(score).toEqual(58);
  });

  //sales rank check
  it('Should return 1 item with rank below 1000', function() {
    var groupedItems = agg.groupItemsByRange(items, 'salesRank', SALES_RANK_LIMITS)
    var result = generalCountCalc(groupedItems, items);
    expect(result[0].count).toEqual(1);
  })

  it('Should expect that averageMonthlySales of 1000-3000 rank is 681', function() {
    var groupedItems = agg.groupItemsByRange(items, 'salesRank', SALES_RANK_LIMITS)
    var result = generalCountCalc(groupedItems, items);
    expect(result[1].averageMonthlySales).toEqual(681)
  })

  //reviews check
  it('Should return 3 items between 50 and 200 reviews', function() {
    var groupedItems = agg.groupItemsByRange(items, 'reviewsCount', REVIEWS_COUNT_LIMITS)
    var result = generalCountCalc(groupedItems, items);
    expect(result[1].count).toEqual(3);
  })

  //Overall - test
  it('Should return initialized empty stats object', function() {
    var stats = initializeStats();
    expect(stats).toBeTruthy();
  })

  it('should generate stats correctly', function() {
    var stats = generateStats(items);
    expect(stats.groupedBy.salesRank[1].averageMonthlySales).toEqual(681)
    expect(stats.groupedBy.reviewsCount[1].count).toEqual(3);
    expect(stats.groupedBy.category['Home'].percentageSales).toEqual(86);
    expect(stats.score.overall).toEqual(62);
  })

  it('should return correct explanations for the stats', function() {
    var stats = generateStats(items);
    var results = generateExplanations(stats);
    expect(results.bad.fulfillment.length).toBe(2);
    expect(results.bad.reviewsCount.length).toBe(1);
    expect(results.warning.salesRank.length).toBe(1);
  })
});