import CONSTS from '../consts/statsData';
import agg from './aggregations';

const strings = {
  reviewsCountMoreThanReviews0 : `There is 1 item with more than {0} reviews`,
  reviewsCountMoreThanReviews1: `There are {0} item with more than {1} reviews`,
  reviewsCountMoreThanReviews2: `There are {0} item with more than {1} reviews`,
  reviewsCountMoreThanReviews3: `There are no items with more than {0} reviews.`,
  reviewsCountMoreThanResultsSalePercentage: `Items with more than {0} reviews makes {1}% of the sales.`,
  salesRankPercentageCount1: `{0}% of the items have a salesRank below 1000 and makes in average {1} sales a month ({2}$)`,
  salesRankPercentageCount2 :`There are no items with sales rank below 1000`,
  salesRankPercentageCount3 :`There are only {0} items with sales rank below 1000`,
  salesRankPercentageCount4 :`{0} of the items are making {1}% of the monthly sales`,
  fulfillmentAMZCount1: `There are no items sold by Amazon`,
  fulfillmentAMZCount2: `There are only {0} items sold by Amazon`,
  fulfillmentAMZCount3: `There are about {0} items sold by Amazon which are {1}% of the items`,
  fulfillmentAMZCount4: `There are {0} items sold by Amazon which are {1}% of the items`,
  fulfillmentAMZCount5: `Items that are sold by Amazon are almost not a factor`,
  fulfillmentAMZCount6: `Items that are sold by Amazon makes about {0}% of the sales which is a cut you should take into consideration`,
  fulfillmentAMZCount7: `Items that are sold by Amazon makes {0}% of the sales which is a huge cut`,
};

const grades = {
  salesRank: {
    maxGoodCountPercentage: 10,
    minGoodPercentageCount: 30,
    amzMaxGoodSalesPercentage: 50,
  },
  fulfillment: {
    maxGoodCount: 2,
    minBadCount: 6,
    amzMaxGoodSalesPercentage: 10,
    amzMinBadSalesPercentage: 40,
  },
  reviewsCount: {
    minBadSalesPercentage1: 30,
    minBadSalesPercentage2: 30,
    minBadSalesPercentage3: 50,
    minBadSalesPercentage4: 70,
    minBadCount0: 2,
    minBadCount1: 5,
    minBadCount2: 7,
    minBadCount3: 4,
  }
}

class explanationsSections {
  constructor() {
    this.salesRank = [];
    this.reviewsCount = [];
    this.fulfillment = [];
    this.lowestPrice = [];
    this.reviewsRatings = [];
    this.category = [];
    this.brand = [];
    this.overall = [];
  }
}

export const generateExplanations = (stats) => {
  var result = {
    good: new explanationsSections(),
    warning: new explanationsSections(),
    bad: new explanationsSections(),
  }

  generateSalesRankExplanations(result, stats);
  generateFulfillmentExplanations(result, stats);
  generateReviewsCountExplanations(result, stats);

  return result;
}



//Reviews count
function generateReviewsCountExplanations(result, stats) {
  var reducedAgggregations = agg.getReducedAggregations(stats);

  if (stats.groupedBy.reviewsCount[4].count > grades.reviewsCount.minBadCount0) {
    result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, stats.groupedBy.reviewsCount[4].count, CONSTS.REVIEWS_COUNT_LIMITS[3]));
    if (stats.groupedBy.reviewsCount[4].percentageSales > grades.reviewsCount.minBadSalesPercentage1) {
      result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, CONSTS.REVIEWS_COUNT_LIMITS[3],stats.groupedBy.reviewsCount[4].percentageSales));
    }

  } else if (reducedAgggregations[3].count> grades.reviewsCount.minBadCount1) {
    result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, stats.groupedBy.reviewsCount[3].count, CONSTS.REVIEWS_COUNT_LIMITS[2]))

    if (reducedAgggregations[3].salesPercentage > grades.reviewsCount.minBadSalesPercentage2) {
      result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, CONSTS.REVIEWS_COUNT_LIMITS[2],stats.groupedBy.reviewsCount[3].percentageSales));
    }
  } else if (reducedAgggregations[2].count > grades.reviewsCount.minBadCount2) {
    result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, stats.groupedBy.reviewsCount[2].count, CONSTS.REVIEWS_COUNT_LIMITS[1]))

    if (stats.groupedBy.reviewsCount[2].percentageSales > grades.reviewsCount.minBadSalesPercentage3) {
      result.bad.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, CONSTS.REVIEWS_COUNT_LIMITS[1],stats.groupedBy.reviewsCount[2].percentageSales));
    }
  } else if (reducedAgggregations[1].count > grades.reviewsCount.minBadCount3) {
    result.warning.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, stats.groupedBy.reviewsCount[1].count, CONSTS.REVIEWS_COUNT_LIMITS[0]))

    if (stats.groupedBy.reviewsCount[1].percentageSales > grades.reviewsCount.minBadSalesPercentage4) {
      result.warning.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, CONSTS.REVIEWS_COUNT_LIMITS[0],stats.groupedBy.reviewsCount[2].percentageSales));
    }
  } else if (reducedAgggregations[1].count > 0) {
    result.good.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews2, stats.groupedBy.reviewsCount[1].count, CONSTS.REVIEWS_COUNT_LIMITS[0]))

    if (stats.groupedBy.reviewsCount[1].percentageSales > grades.reviewsCount.minBadSalesPercentage4) {
      result.warning.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews1, CONSTS.REVIEWS_COUNT_LIMITS[0],stats.groupedBy.reviewsCount[1].percentageSales));
    }
  } else {
    result.good.reviewsCount.push(getExplanationText(strings.reviewsCountMoreThanReviews3, CONSTS.REVIEWS_COUNT_LIMITS[0]));
  }
}


// End reviews

function generateSalesRankExplanations(result, stats) {
  if (stats.groupedBy.salesRank[0].percentageCount > grades.salesRank.minGoodPercentageCount) {
    result.good.salesRank.push(getExplanationText(strings.salesRankPercentageCount1, stats.groupedBy.salesRank[0].percentageCount,stats.groupedBy.salesRank[0].averageMonthlySales, stats.groupedBy.salesRank[0].averageMonthlyRevenue));

  } else if (stats.groupedBy.salesRank[0].percentageCount ==0) {
    result.warning.salesRank.push(getExplanationText(strings.salesRankPercentageCount2));
  } else if (stats.groupedBy.salesRank[0].percentageCount <= grades.salesRank.maxGoodCountPercentage) {
    result.warning.salesRank.push(getExplanationText(strings.salesRankPercentageCount3, stats.groupedBy.salesRank[0].count));

    if (stats.groupedBy.salesRank[0].percentageSales > grades.salesRank.amzMaxGoodSalesPercentage) {
       result.warning.salesRank.push(getExplanationText(strings.salesRankPercentageCount2, stats.groupedBy.salesRank[0].percentageCount, stats.groupedBy.salesRank[0].percentageSales));
    }
  }
}

function generateFulfillmentExplanations(result, stats) {
  if (!stats.groupedBy.fulfillment.AMZ || stats.groupedBy.fulfillment.AMZ.length == 0) {
    result.good.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount1));
  } else if (stats.groupedBy.fulfillment.AMZ.length <= grades.fulfillment.maxGoodCount) {
    result.good.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount2, stats.groupedBy.fulfillment.AMZ.count));
  } else if (stats.groupedBy.fulfillment.AMZ.length < grades.fulfillment.minBadCount) {
    result.bad.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount3, stats.groupedBy.fulfillment.AMZ.count,stats.groupedBy.fulfillment.AMZ.percentageCount))
  } else {
     result.bad.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount4, stats.groupedBy.fulfillment.AMZ.count,stats.groupedBy.fulfillment.AMZ.percentageCount))
  }

  if (!stats.groupedBy.fulfillment.AMZ || stats.groupedBy.fulfillment.AMZ.percentageSales <= grades.fulfillment.amzMaxGoodSalesPercentage) {
    result.good.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount5));
  } else if (stats.groupedBy.fulfillment.AMZ.length < grades.fulfillment.amzMinBadSalesPercentage) {
    result.warning.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount6, stats.groupedBy.fulfillment.AMZ.percentageSales));
  } else {
     result.bad.fulfillment.push(getExplanationText(strings.fulfillmentAMZCount7, stats.groupedBy.fulfillment.AMZ.percentageSales));
  }
}


function getExplanationText(str, ...args) {
  return str.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
}
