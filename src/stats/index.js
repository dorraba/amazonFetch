import _ from 'lodash';
import agg from './aggregations';
import generalCountCalc from './generalCountCalc';
import {getRankScore} from './scoreCalc';
import consts from '../consts/statsData'
import {generateExplanations} from './explanations';

export const initializeStats = () => {
  return {
    groupedBy: {
      salesRank: [],
      reviewsCount: [],
      reviewsRatings: [],
      fulfillment: [],
      brand: [],
      lowestPrice: [],
      category: [],
      overall: [],
    },
    averages: {
      salesRank: 0,
      reviewsCount: 0,
      reviewsRatings: 0,
      lowestPrice: 0,
    },
    score: {
      salesRank: 0,
      reviewsCount: 0,
      reviewsRatings: 0,
      overall: 0
    }
  };
}

function getBrandsGroupItems(items) {
  var groupedByBrands = _.groupBy(items, 'brand');
  var groupedByBrandsAmount = _.groupBy(groupedByBrands, 'length');

  return _.mapValues(groupedByBrandsAmount, (x)=>{
    return _.map(x, (c)=>{
      return c[0];
    })
  });
}

function getOverallRankScore(score) {
  return _.round(((score.reviewsCount * 3) + (score.reviewsRatings) + (score.salesRank * 5)) / 9);
}


export const generateStats = (items) => {
 var stats = initializeStats();
  items = _.filter(items, (x=> {return !x.isIgnored && x.salesRank>0}));
  var salesRankGroupedItems = agg.groupItemsByRange(items, 'salesRank', consts.SALES_RANK_LIMITS);
  var reviewsCountGroupedItems = agg.groupItemsByRange(items, 'reviewsCount', consts.REVIEWS_COUNT_LIMITS);
  var lowestPriceGroupedItems = agg.groupItemsByRange(items, 'lowestPrice', consts.PRICE_LIMITS);
  var reviewsRatingsGroupedItems = agg.groupItemsByRange(items, 'reviewsRatings', consts.RATINGS_LIMITS);
  var overallGroupedItems = [items];

  stats.groupedBy.salesRank = generalCountCalc(salesRankGroupedItems, items);
  stats.groupedBy.reviewsCount = generalCountCalc(reviewsCountGroupedItems, items);
  stats.groupedBy.lowestPrice = generalCountCalc(lowestPriceGroupedItems, items);
  stats.groupedBy.reviewsRatings = generalCountCalc(reviewsRatingsGroupedItems, items);
  stats.groupedBy.fulfillment = generalCountCalc(_.groupBy(items, 'fulfillment'), items, true);
  stats.groupedBy.category = generalCountCalc(_.groupBy(items, 'category'), items, true);
  stats.groupedBy.brand = generalCountCalc(getBrandsGroupItems(items), items, true);
  stats.groupedBy.overall = generalCountCalc(overallGroupedItems, items)[0];

  stats.averages.lowestPrice = agg.average(items, 'lowestPrice');
  stats.averages.reviewsCount = agg.average(items, 'reviewsCount');
  stats.averages.reviewsRatings = agg.average(items, 'reviewsRatings');

  stats.score.salesRank = getRankScore(items, 'salesRank', consts.SALES_RANK_LIMITS);
  stats.score.reviewsCount = getRankScore(items, 'reviewsCount', consts.REVIEWS_COUNT_LIMITS, true);
  stats.score.reviewsRatings = agg.average(items, 'reviewsRatings') * 20;
  stats.score.overall = getOverallRankScore(stats.score);
    stats.explanations = generateExplanations(stats);
  return stats;
}

